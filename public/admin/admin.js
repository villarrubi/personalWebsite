// Project administration for the static portfolio.
// Reads and writes content/projects/*.json and project images straight in the
// GitHub repository; the Pages workflow rebuilds the site after every commit.
// Note for maintainers: scripts/deploy-paths.mjs rewrites root-relative strings
// such as a quoted slash in deployed files, so this module builds paths with SLASH.
import {validateProject} from './project-schema.js';

const SLASH = String.fromCharCode(47);
const join = (...parts) => parts.join(SLASH);
const REPO = {owner: 'villarrubi', name: 'personalWebsite', branch: 'main'};
const API = 'https://api.github.com';
const PROJECTS_DIR = join('content', 'projects');
const IMAGE_DIR = join('public', 'assets', 'images');
const IMAGE_URL_PREFIX = SLASH + join('assets', 'images') + SLASH;
const TOKEN_KEY = 'av-admin-token';
// The admin page lives at <base>/admin/, so the site root is one level up.
const SITE_ROOT = location.pathname.replace(/admin\/(index\.html)?$/, '');

const $ = selector => document.querySelector(selector);
const state = {
  token: null, user: null,
  headSha: null, tree: new Map(),           // path -> blob sha at the loaded commit
  projects: [],                             // {id, path, sha, data}
  filter: 'all', query: '',
  editing: null,                            // {id, isNew, path, sha, original, draft}
  uploads: new Map(),                       // image url -> {bytes, preview}
  busy: false,
};

// ---------- small utilities ----------
const storage = {
  get() { for (const store of [sessionStorage, localStorage]) { try { const value = store.getItem(TOKEN_KEY); if (value) return value; } catch {} } return null; },
  set(token, remember) { try { (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token); } catch {} },
  clear() { for (const store of [sessionStorage, localStorage]) { try { store.removeItem(TOKEN_KEY); } catch {} } },
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const slugify = value => String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const clone = value => structuredClone(value);
const getPath = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);
function setPath(object, path, value) {
  const keys = path.split('.'), last = keys.pop();
  let target = object;
  for (const key of keys) target = target[key] && typeof target[key] === 'object' ? target[key] : (target[key] = {});
  target[last] = value;
}
function toBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
const fromBase64 = text => Uint8Array.from(atob(text.replace(/\s/g, '')), char => char.charCodeAt(0));
const utf8 = {encode: text => new TextEncoder().encode(text), decode: bytes => new TextDecoder().decode(bytes)};

let toastTimer;
function toast(message, kind = 'info') {
  const element = $('#toast');
  element.textContent = message; element.dataset.kind = kind; element.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), kind === 'error' ? 7000 : 4000);
}

// ---------- GitHub API ----------
class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
async function api(path, {method = 'GET', body, auth = true} = {}) {
  const headers = {Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28'};
  if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(API + path, {method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store'});
  if (!response.ok) {
    let detail = '';
    try { detail = (await response.json()).message || ''; } catch {}
    throw new ApiError(response.status, detail || response.statusText);
  }
  return response.status === 204 ? null : response.json();
}
const repoPath = suffix => `${SLASH}repos${SLASH}${REPO.owner}${SLASH}${REPO.name}${suffix}`;

async function readHead() {
  const ref = await api(repoPath(`${SLASH}git${SLASH}ref${SLASH}heads${SLASH}${REPO.branch}`));
  const commit = await api(repoPath(`${SLASH}git${SLASH}commits${SLASH}${ref.object.sha}`));
  const tree = await api(repoPath(`${SLASH}git${SLASH}trees${SLASH}${commit.tree.sha}?recursive=1`));
  return {sha: ref.object.sha, treeSha: commit.tree.sha, files: new Map(tree.tree.filter(item => item.type === 'blob').map(item => [item.path, item.sha]))};
}
async function readBlob(sha) {
  const blob = await api(repoPath(`${SLASH}git${SLASH}blobs${SLASH}${sha}`));
  return fromBase64(blob.content);
}

// One commit per action: blobs -> tree -> commit -> move the branch.
// `changes` maps repository paths to Uint8Array contents, or null to delete.
// `expect` maps paths to the blob sha they must still have (null = must not exist).
async function commitChanges(message, changes, expect) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const head = await readHead();
    for (const [path, sha] of Object.entries(expect)) {
      if ((head.files.get(path) ?? null) !== sha)
        throw new ApiError(409, sha === null ? 'Ya existe un proyecto con ese identificador.' : 'Este proyecto ha cambiado en GitHub desde que lo abriste. Recarga la página para ver la última versión.');
    }
    const tree = [];
    for (const [path, bytes] of Object.entries(changes)) {
      if (bytes === null) { if (head.files.has(path)) tree.push({path, mode: '100644', type: 'blob', sha: null}); continue; }
      const blob = await api(repoPath(`${SLASH}git${SLASH}blobs`), {method: 'POST', body: {content: toBase64(bytes), encoding: 'base64'}});
      tree.push({path, mode: '100644', type: 'blob', sha: blob.sha});
    }
    const newTree = await api(repoPath(`${SLASH}git${SLASH}trees`), {method: 'POST', body: {base_tree: head.treeSha, tree}});
    const commit = await api(repoPath(`${SLASH}git${SLASH}commits`), {method: 'POST', body: {message, tree: newTree.sha, parents: [head.sha]}});
    try {
      await api(repoPath(`${SLASH}git${SLASH}refs${SLASH}heads${SLASH}${REPO.branch}`), {method: 'PATCH', body: {sha: commit.sha, force: false}});
      return commit.sha;
    } catch (error) {
      // Someone else pushed in between: retry once on top of the new head.
      if (error.status !== 422 || attempt) throw error;
    }
  }
}

// ---------- data loading ----------
async function loadCatalog() {
  const head = await readHead();
  state.headSha = head.sha; state.tree = head.files;
  const entries = [...head.files].filter(([path]) => path.startsWith(PROJECTS_DIR + SLASH) && path.endsWith('.json') && !path.slice(PROJECTS_DIR.length + 1).includes(SLASH));
  state.projects = await Promise.all(entries.map(async ([path, sha]) => {
    const id = path.slice(PROJECTS_DIR.length + 1, -5);
    let data, error = null;
    try { data = JSON.parse(utf8.decode(await readBlob(sha))); } catch { data = {id, name: id}; error = 'JSON no válido'; }
    return {id, path, sha, data, error};
  }));
  state.projects.sort((a, b) => (a.data.order ?? 1000) - (b.data.order ?? 1000) || a.id.localeCompare(b.id));
}

// ---------- publish status ----------
let publishTimer;
async function watchPublish(commitSha) {
  const element = $('#publish-state');
  const show = (text, kind) => { element.hidden = false; element.textContent = text; element.dataset.kind = kind; };
  show('Publicando…', 'pending');
  clearTimeout(publishTimer);
  const started = Date.now();
  const poll = async () => {
    try {
      const runs = await api(repoPath(`${SLASH}actions${SLASH}runs?branch=${REPO.branch}&per_page=5`));
      const run = runs.workflow_runs.find(item => item.head_sha === commitSha);
      if (run?.status === 'completed') {
        if (run.conclusion === 'success') { show('Publicado ✓', 'ok'); toast('Los cambios ya están en la web.', 'ok'); }
        else { show('Error al publicar', 'error'); toast('La publicación ha fallado. Revisa los detalles en GitHub Actions.', 'error'); }
        return;
      }
    } catch (error) {
      if (error.status === 403 || error.status === 404) { show('Publicando (unos minutos)', 'pending'); return; }
    }
    if (Date.now() - started < 10 * 60 * 1000) publishTimer = setTimeout(poll, 8000);
    else show('Publicación en curso', 'pending');
  };
  publishTimer = setTimeout(poll, 5000);
}

// ---------- views ----------
function showView(name) {
  for (const view of document.querySelectorAll('.view')) view.hidden = view.id !== `view-${name}`;
  window.scrollTo({top: 0});
}

function renderList() {
  const query = state.query.trim().toLowerCase();
  const counts = {all: state.projects.length, published: 0, draft: 0};
  for (const project of state.projects) counts[project.data.published ? 'published' : 'draft']++;
  for (const key of Object.keys(counts)) $(`#count-${key}`).textContent = counts[key];
  const visible = state.projects.filter(({data}) => {
    if (state.filter === 'published' && !data.published) return false;
    if (state.filter === 'draft' && data.published) return false;
    if (!query) return true;
    return [data.name, data.enName, data.id, ...(data.tags || [])].some(value => String(value || '').toLowerCase().includes(query));
  });
  $('#list-empty').hidden = visible.length > 0;
  $('#project-list').innerHTML = visible.map(({id, data, error}) => {
    const cover = data.cover ? imageUrl(data.cover) : '';
    return `<li><a class="project-row" href="#/editar/${encodeURIComponent(id)}">
      <span class="thumb">${cover ? `<img src="${escapeHtml(cover)}" alt="" loading="lazy">` : `<span aria-hidden="true">${escapeHtml((data.name || id).slice(0, 1))}</span>`}</span>
      <span class="row-main"><strong>${escapeHtml(data.name || id)}</strong><small>${escapeHtml(data.category?.es || 'Sin área')} · ${escapeHtml(data.year || '—')}</small></span>
      <span class="chips">
        ${error ? '<span class="chip error">Error</span>' : ''}
        <span class="chip ${data.published ? 'ok' : 'muted'}">${data.published ? 'Publicado' : 'Borrador'}</span>
        ${data.featured ? '<span class="chip accent">Destacado</span>' : ''}
        <span class="chip">${data.status === 'built' ? 'Realizado' : 'En desarrollo'}</span>
      </span>
      <span class="order" title="Orden">${escapeHtml(data.order ?? '—')}</span>
      <span class="go" aria-hidden="true">→</span></a></li>`;
  }).join('');
}

function imageUrl(value) {
  if (state.uploads.has(value)) return state.uploads.get(value).preview;
  return value.startsWith(SLASH) ? SITE_ROOT + value.slice(1) : value;
}

// ---------- editor ----------
const VISUALS = [['data', 'Software y datos'], ['chess', 'Ajedrez'], ['pipa', 'Asistente'], ['map', 'Mapas'], ['planning', 'Organización'], ['science', 'Ciencia'], ['security', 'Seguridad']];
const field = {
  text: (path, label, options = {}) => ({kind: 'text', path, label, ...options}),
  area: (path, label, options = {}) => ({kind: 'area', path, label, ...options}),
  lines: (path, label, options = {}) => ({kind: 'lines', path, label, ...options}),
};
const bilingual = (path, label, kind = 'area', options = {}) => ({kind: 'pair', path, label, inner: kind, ...options});

function newProjectTemplate() {
  const maxOrder = Math.max(0, ...state.projects.map(project => Number(project.data.order) || 0));
  return {
    id: '', published: false, visibility: 'private', localOnly: false, name: '', year: String(new Date().getFullYear()),
    status: 'development', featured: false, visual: 'data', tags: [], order: maxOrder + 10,
    category: {es: '', en: ''}, summary: {es: '', en: ''}, idea: {es: '', en: ''}, built: {es: [], en: []}, stage: {es: '', en: ''},
  };
}

function inputFor(spec, value, id) {
  const common = `id="${id}" data-path="${spec.path}" data-kind="${spec.kind}"${spec.required ? ' required' : ''}${spec.placeholder ? ` placeholder="${escapeHtml(spec.placeholder)}"` : ''}`;
  if (spec.kind === 'area') return `<textarea ${common} rows="${spec.rows || 3}">${escapeHtml(value || '')}</textarea>`;
  if (spec.kind === 'lines') return `<textarea ${common} rows="${spec.rows || 4}">${escapeHtml((value || []).join('\n'))}</textarea>`;
  return `<input ${common} type="${spec.type || 'text'}" value="${escapeHtml(value ?? '')}"${spec.readonly ? ' readonly' : ''}${spec.pattern ? ` pattern="${spec.pattern}"` : ''}>`;
}
function renderField(spec, draft) {
  const id = `f-${spec.path.replaceAll('.', '-')}`;
  const help = spec.help ? `<small class="help">${spec.help}</small>` : '';
  if (spec.kind === 'pair') {
    const langs = [['es', 'Español'], ['en', 'English']];
    return `<fieldset class="pair"><legend>${spec.label}</legend>${help}<div class="pair-grid">${langs.map(([lang, name]) =>
      `<label for="${id}-${lang}"><span class="lang">${name}</span>${inputFor({...spec, kind: spec.inner, path: `${spec.path}.${lang}`}, getPath(draft, `${spec.path}.${lang}`), `${id}-${lang}`)}</label>`).join('')}</div></fieldset>`;
  }
  return `<label class="field" for="${id}"><span>${spec.label}</span>${inputFor(spec, getPath(draft, spec.path), id)}${help}</label>`;
}
function toggle(path, label, help, checked) {
  return `<label class="switch"><input type="checkbox" data-path="${path}" data-kind="bool"${checked ? ' checked' : ''}><span class="track" aria-hidden="true"></span><span><strong>${label}</strong><small>${help}</small></span></label>`;
}
function select(path, label, options, value) {
  return `<label class="field" for="f-${path}"><span>${label}</span><select id="f-${path}" data-path="${path}" data-kind="select">${options.map(([key, name]) => `<option value="${key}"${key === value ? ' selected' : ''}>${name}</option>`).join('')}</select></label>`;
}
function imageBlock(key, label, draft) {
  const value = draft[key];
  return `<div class="image-field" data-image="${key}">
    <div class="image-preview">${value ? `<img src="${escapeHtml(imageUrl(value))}" alt="">` : '<span>Sin imagen</span>'}</div>
    <div class="image-controls">
      <strong>${label}</strong>
      <small>${value ? escapeHtml(value) : 'PNG, JPG, WebP o AVIF. Las imágenes grandes se optimizan al subirlas.'}</small>
      <div class="image-actions">
        <label class="secondary file-button">${value ? 'Cambiar imagen' : 'Subir imagen'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif" data-upload="${key}"></label>
        ${value ? `<button type="button" class="link-button danger-text" data-remove-image="${key}">Quitar</button>` : ''}
      </div>
    </div>
  </div>${value ? renderField(bilingual(`${key}Alt`, 'Descripción de la imagen (accesibilidad)', 'area', {rows: 2}), draft) : ''}`;
}

function renderEditor() {
  const {draft, isNew} = state.editing;
  const filled = value => Array.isArray(value) ? value.some(filled) : value && typeof value === 'object' ? Object.values(value).some(filled) : typeof value === 'string' && value.trim() !== '';
  const caseOpen = filled(draft.caseStudy);
  $('#edit-title').textContent = isNew ? 'Nuevo proyecto' : (draft.name || state.editing.id);
  $('#edit-meta').innerHTML = isNew ? 'Se guardará como borrador hasta que lo publiques.' : `content/projects/${escapeHtml(state.editing.id)}.json${draft.published ? ` · <a href="${escapeHtml(SITE_ROOT)}es/projects/${escapeHtml(state.editing.id)}/" target="_blank" rel="noopener">Ver en la web ↗</a>` : ''}`;
  $('#editor').innerHTML = `
    <p class="form-error" id="editor-error" role="alert" hidden></p>
    <section class="card">
      <h3>Lo básico</h3>
      <div class="grid">
        ${renderField(field.text('name', 'Nombre del proyecto', {required: true}), draft)}
        ${renderField(field.text('id', 'Identificador de la dirección', {readonly: !isNew, required: true, pattern: '[a-z0-9]+(-[a-z0-9]+)*', help: isNew ? 'Minúsculas, números y guiones. No se puede cambiar después.' : 'No se puede cambiar.'}), draft)}
        ${renderField(field.text('enName', 'Nombre en inglés (si cambia)'), draft)}
        ${renderField(field.text('shortName', 'Nombre corto en la órbita', {help: 'Opcional, para nombres largos.'}), draft)}
        ${renderField(field.text('year', 'Año'), draft)}
        ${renderField(field.text('order', 'Orden', {type: 'number', help: 'Los números bajos aparecen antes.'}), draft)}
      </div>
    </section>
    <section class="card">
      <h3>Publicación</h3>
      <div class="switches">
        ${toggle('published', 'Publicado en la web', 'Desactívalo para retirarlo sin borrarlo.', draft.published)}
        ${toggle('featured', 'Destacado', 'Aparece en el grupo principal de la órbita.', draft.featured)}
        ${toggle('localOnly', 'Proyecto local', 'Sin repositorio publicado (código privado).', draft.localOnly)}
      </div>
      <div class="grid">
        ${select('status', 'Estado', [['development', 'En desarrollo'], ['built', 'Realizado']], draft.status)}
        ${select('visibility', 'Código', [['private', 'Privado'], ['public', 'Público']], draft.visibility)}
        ${renderField(field.text('repo', 'Repositorio en GitHub', {type: 'url', placeholder: 'https://github.com/usuario/proyecto', help: 'Obligatorio si el código es público.'}), draft)}
        ${renderField(field.text('demo', 'Web o demostración', {type: 'url', placeholder: 'https://…'}), draft)}
        ${select('visual', 'Ilustración si no hay imagen', VISUALS, draft.visual)}
        ${renderField(field.text('tags', 'Tecnologías', {help: 'Separadas por comas.'}), {...draft, tags: (draft.tags || []).join(', ')})}
      </div>
    </section>
    <section class="card">
      <h3>Textos</h3>
      <p class="card-note">Si el proyecto está publicado, todos los textos son obligatorios en los dos idiomas.</p>
      ${renderField(bilingual('category', 'Área', 'text'), draft)}
      ${renderField(bilingual('summary', 'Descripción breve', 'area', {rows: 2}), draft)}
      ${renderField(bilingual('idea', 'La idea', 'area', {rows: 4}), draft)}
      ${renderField(bilingual('built', 'Qué he construido', 'lines', {rows: 4, help: 'Una línea por punto.'}), draft)}
      ${renderField(bilingual('stage', 'Dónde está ahora', 'area', {rows: 3}), draft)}
    </section>
    <section class="card">
      <h3>Imágenes</h3>
      ${imageBlock('cover', 'Imagen principal', draft)}
      ${imageBlock('capture', 'Captura adicional', draft)}
    </section>
    <details class="card case"${caseOpen ? ' open' : ''}>
      <summary><h3>Caso de estudio <small>opcional</small></h3></summary>
      ${renderField(bilingual('caseStudy.problem', 'El reto', 'area', {rows: 3}), splitCase(draft))}
      ${renderField(bilingual('caseStudy.contribution', 'Mi aportación', 'area', {rows: 3}), splitCase(draft))}
      ${renderField(bilingual('caseStudy.flow', 'Componentes del sistema', 'lines', {rows: 3, help: 'Uno por línea, en orden.'}), splitCase(draft))}
      ${renderField(bilingual('caseStudy.focus', 'Enfoque', 'text'), splitCase(draft))}
    </details>
    <div class="actions">
      ${isNew ? '' : '<button type="button" class="danger-outline" id="delete-project">Eliminar proyecto</button>'}
      <span class="dirty" id="dirty-note" hidden>Cambios sin guardar</span>
      <a class="secondary" href="#/">Cancelar</a>
      <button type="submit" class="primary" id="save-project">${isNew ? 'Crear proyecto' : 'Guardar cambios'}</button>
    </div>`;
  updateDirty();
}
// The form groups case-study fields by field then language; the JSON stores them by language.
function splitCase(draft) {
  const study = draft.caseStudy || {};
  const view = {caseStudy: {}};
  for (const key of ['problem', 'contribution', 'flow', 'focus']) view.caseStudy[key] = {es: study.es?.[key], en: study.en?.[key]};
  return view;
}

function readInput(input) {
  const {path, kind} = input.dataset;
  const draft = state.editing.draft;
  let value;
  if (kind === 'bool') value = input.checked;
  else if (kind === 'lines') value = input.value.split('\n').map(line => line.trim()).filter(Boolean);
  else value = input.value;
  if (path === 'tags') value = input.value.split(',').map(tag => tag.trim()).filter(Boolean);
  if (path === 'order') value = input.value === '' ? undefined : Number(input.value);
  const caseMatch = path.match(/^caseStudy\.(problem|contribution|flow|focus)\.(es|en)$/);
  if (caseMatch) {
    draft.caseStudy ??= {es: {}, en: {}};
    draft.caseStudy[caseMatch[2]] ??= {};
    draft.caseStudy[caseMatch[2]][caseMatch[1]] = value;
  } else setPath(draft, path, value);
  if (path === 'name' && state.editing.isNew && !state.editing.idTouched) {
    draft.id = slugify(value);
    const idInput = $('#f-id'); if (idInput) idInput.value = draft.id;
  }
  if (path === 'id') { state.editing.idTouched = true; }
  if (path === 'name') $('#edit-title').textContent = value || 'Nuevo proyecto';
  if (path === 'localOnly' && value) { draft.visibility = 'private'; $('#f-visibility').value = 'private'; }
  updateDirty();
}

const isDirty = () => state.editing && JSON.stringify(state.editing.draft) !== state.editing.original;
function updateDirty() { const note = $('#dirty-note'); if (note) note.hidden = !isDirty(); }

// Remove empty optional values so the JSON stays tidy, then apply the build's validation.
function prepare(draft) {
  const project = clone(draft);
  for (const key of ['enName', 'shortName', 'repo', 'demo']) if (!String(project[key] ?? '').trim()) delete project[key];
  for (const key of ['cover', 'capture']) if (!project[key]) { delete project[key]; delete project[`${key}Alt`]; }
  if (project.year != null) project.year = String(project.year).trim();
  if (project.order === undefined || Number.isNaN(project.order)) delete project.order;
  for (const key of ['name', 'enName', 'shortName', 'repo', 'demo']) if (typeof project[key] === 'string') project[key] = project[key].trim();
  // Validate exactly like the build, but store the edited data rather than the
  // normalized copy so a one-field edit stays a one-field change in the JSON.
  const normalized = validateProject(project, `${project.id}.json`);
  if (!normalized.repo) delete project.repo;              // private code never keeps a link
  if (!normalized.caseStudy) delete project.caseStudy;    // an empty optional study is dropped
  return project;
}

async function saveProject() {
  if (state.busy) return;
  const editing = state.editing;
  const error = $('#editor-error');
  error.hidden = true;
  let project;
  try { project = prepare(editing.draft); }
  catch (problem) { error.textContent = friendly(problem.message); error.hidden = false; error.scrollIntoView({block: 'center', behavior: 'smooth'}); return; }
  if (editing.isNew && state.projects.some(item => item.id === project.id)) { error.textContent = 'Ya existe un proyecto con ese identificador.'; error.hidden = false; return; }
  const path = join(PROJECTS_DIR, `${project.id}.json`);
  const changes = {[path]: utf8.encode(JSON.stringify(project, null, 2) + '\n')};
  for (const key of ['cover', 'capture']) {
    const upload = project[key] && state.uploads.get(project[key]);
    if (upload) changes[join('public', project[key].slice(1))] = upload.bytes;
  }
  setBusy(true, editing.isNew ? 'Creando…' : 'Guardando…');
  try {
    const sha = await commitChanges(`${editing.isNew ? 'Añadir' : 'Actualizar'} proyecto ${project.id} desde el panel`, changes, {[path]: editing.isNew ? null : editing.sha});
    toast(editing.isNew ? 'Proyecto creado.' : 'Cambios guardados.', 'ok');
    state.editing = null;
    await loadCatalog();
    watchPublish(sha);
    location.hash = '#/';
    route();
  } catch (problem) {
    error.textContent = describe(problem); error.hidden = false;
  } finally { setBusy(false); }
}

async function deleteProject() {
  const editing = state.editing;
  const dialog = $('#confirm-delete'), input = $('#confirm-input'), confirmButton = $('#confirm-button');
  $('#confirm-id').textContent = editing.id; input.value = ''; confirmButton.disabled = true;
  input.oninput = () => { confirmButton.disabled = input.value.trim() !== editing.id; };
  dialog.showModal(); input.focus();
  const result = await new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue), {once: true}));
  if (result !== 'confirm') return;
  const changes = {[editing.path]: null};
  if ($('#confirm-images').checked) {
    const others = state.projects.filter(project => project.id !== editing.id).flatMap(project => [project.data.cover, project.data.capture]);
    for (const key of ['cover', 'capture']) {
      const value = editing.saved[key];
      if (value?.startsWith(IMAGE_URL_PREFIX) && !others.includes(value)) changes[join('public', value.slice(1))] = null;
    }
  }
  setBusy(true, 'Eliminando…');
  try {
    const sha = await commitChanges(`Eliminar proyecto ${editing.id} desde el panel`, changes, {[editing.path]: editing.sha});
    toast('Proyecto eliminado.', 'ok');
    state.editing = null;
    await loadCatalog();
    watchPublish(sha);
    location.hash = '#/';
    route();
  } catch (problem) { toast(describe(problem), 'error'); }
  finally { setBusy(false); }
}

// The shared validator speaks in field paths; translate them to the labels on screen.
const LABELS = {category: 'Área', summary: 'Descripción breve', idea: 'La idea', built: 'Qué he construido', stage: 'Dónde está ahora',
  coverAlt: 'Descripción de la imagen principal', captureAlt: 'Descripción de la captura adicional', reto: 'El reto del caso de estudio',
  'aportación': 'Mi aportación (caso de estudio)', componentes: 'Componentes del sistema (caso de estudio)', 'enfoque': 'Enfoque (caso de estudio)'};
const LANGS = {es: 'en español', en: 'en inglés'};
function friendly(message) {
  const text = message.replace(/^[^:]+\.json:\s*/, '');
  const match = text.match(/^Revisa (?:el campo|la lista) ([\wáéíóúñ]+)\.(es|en)\.$/);
  if (match && LABELS[match[1]]) return `Falta completar «${LABELS[match[1]]}» ${LANGS[match[2]]}. Al publicar, todos los textos son obligatorios en los dos idiomas.`;
  return text;
}

function describe(error) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'La sesión ha caducado o el token no es válido. Vuelve a entrar.';
    if (error.status === 403) return 'El token no tiene permiso de escritura (Contents: Read and write).';
    if (error.status === 404) return 'No se encuentra el repositorio o el token no tiene acceso a él.';
    if (error.status === 409 || error.status === 422) return error.message;
    return `GitHub respondió con un error (${error.status}): ${error.message}`;
  }
  return 'No se ha podido conectar con GitHub. Comprueba la conexión e inténtalo de nuevo.';
}

function setBusy(busy, label) {
  state.busy = busy;
  const save = $('#save-project');
  for (const button of document.querySelectorAll('#editor button, #editor input, #editor textarea, #editor select')) button.disabled = busy;
  if (save) save.textContent = busy ? label : (state.editing?.isNew ? 'Crear proyecto' : 'Guardar cambios');
  document.body.classList.toggle('is-busy', busy);
}

// Large photos are scaled down and re-encoded; small files are uploaded untouched.
async function prepareImage(file, baseName) {
  const types = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif'};
  if (!types[file.type]) throw new Error('Formato no admitido. Usa PNG, JPG, WebP o AVIF.');
  if (file.size > 25 * 1024 * 1024) throw new Error('La imagen es demasiado grande (máximo 25 MB).');
  let blob = file, ext = types[file.type];
  const bitmap = await createImageBitmap(file).catch(() => null);
  const maxWidth = 2000;
  if (bitmap && (bitmap.width > maxWidth || file.size > 1.2 * 1024 * 1024)) {
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const webp = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .86));
    if (webp && webp.type === 'image/webp') { blob = webp; ext = 'webp'; }
    else { blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .88)); ext = 'jpg'; }
  }
  bitmap?.close?.();
  const name = `${slugify(baseName) || 'proyecto'}-${Date.now().toString(36)}.${ext}`;
  return {url: IMAGE_URL_PREFIX + name, bytes: new Uint8Array(await blob.arrayBuffer()), preview: URL.createObjectURL(blob)};
}

// ---------- routing ----------
async function route() {
  if (!state.token) { showView('login'); return; }
  const hash = decodeURIComponent(location.hash.slice(1) || SLASH);
  if (state.editing && isDirty() && !hash.startsWith(`${SLASH}editar${SLASH}${state.editing.id}`) && !(hash === `${SLASH}nuevo` && state.editing.isNew)) {
    if (!confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
      history.replaceState(null, '', state.editing.isNew ? '#/nuevo' : `#/editar/${encodeURIComponent(state.editing.id)}`);
      return;
    }
  }
  if (hash === `${SLASH}nuevo`) {
    if (!state.editing?.isNew) {
      const draft = newProjectTemplate();
      state.editing = {id: '', isNew: true, path: null, sha: null, draft, original: JSON.stringify(draft), saved: {}};
    }
    renderEditor(); showView('edit'); $('#f-name')?.focus(); return;
  }
  const match = hash.match(/^\/editar\/([^/]+)$/);
  if (match) {
    const project = state.projects.find(item => item.id === match[1]);
    if (!project) { toast('No se encuentra ese proyecto.', 'error'); location.hash = '#/'; return; }
    if (state.editing?.id !== project.id) {
      const draft = clone(project.data);
      state.editing = {id: project.id, isNew: false, path: project.path, sha: project.sha, draft, original: JSON.stringify(draft), saved: clone(project.data)};
    }
    renderEditor(); showView('edit'); return;
  }
  state.editing = null;
  $('#editor').innerHTML = '';
  renderList(); showView('list');
}

async function signIn(token, remember) {
  state.token = token;
  const repo = await api(repoPath(''));
  if (!repo.permissions?.push) throw new ApiError(403, 'Sin permiso de escritura');
  try { state.user = await api(`${SLASH}user`); } catch { state.user = null; }
  storage.set(token, remember);
  $('#account').hidden = false;
  $('#account-login').textContent = state.user?.login || REPO.owner;
  if (state.user?.avatar_url) $('#account-avatar').src = state.user.avatar_url; else $('#account-avatar').hidden = true;
  showView('loading');
  await loadCatalog();
}

function signOut() {
  storage.clear();
  state.token = null; state.user = null; state.editing = null; state.projects = [];
  $('#account').hidden = true;
  $('#token').value = '';
  location.hash = '';
  showView('login');
}

// ---------- events ----------
$('#repo-name').textContent = REPO.name;
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const token = $('#token').value.trim(), error = $('#login-error');
  error.hidden = true;
  if (!token) { error.textContent = 'Pega el token de GitHub.'; error.hidden = false; return; }
  const button = event.submitter; button.disabled = true;
  try { await signIn(token, $('#remember').checked); route(); }
  catch (problem) { state.token = null; error.textContent = describe(problem); error.hidden = false; showView('login'); }
  finally { button.disabled = false; }
});
$('#logout').addEventListener('click', () => { if (!isDirty() || confirm('Tienes cambios sin guardar. ¿Cerrar sesión igualmente?')) signOut(); });
$('#search').addEventListener('input', event => { state.query = event.target.value; renderList(); });
for (const button of document.querySelectorAll('[data-filter]')) button.addEventListener('click', () => {
  state.filter = button.dataset.filter;
  for (const other of document.querySelectorAll('[data-filter]')) other.setAttribute('aria-pressed', String(other === button));
  renderList();
});
const editor = $('#editor');
editor.addEventListener('input', event => { if (event.target.dataset.path) readInput(event.target); });
editor.addEventListener('change', event => {
  const target = event.target;
  if (target.dataset.path && (target.type === 'checkbox' || target.tagName === 'SELECT')) readInput(target);
  if (target.dataset.upload) handleUpload(target);
});
editor.addEventListener('click', event => {
  const remove = event.target.closest('[data-remove-image]');
  if (remove) { const key = remove.dataset.removeImage; delete state.editing.draft[key]; delete state.editing.draft[`${key}Alt`]; rerenderKeepingScroll(); }
  if (event.target.closest('#delete-project')) deleteProject();
});
editor.addEventListener('submit', event => { event.preventDefault(); saveProject(); });

function rerenderKeepingScroll() { const y = scrollY; renderEditor(); scrollTo({top: y}); }
async function handleUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  const key = input.dataset.upload, draft = state.editing.draft;
  try {
    const image = await prepareImage(file, draft.id || draft.name);
    state.uploads.set(image.url, {bytes: image.bytes, preview: image.preview});
    draft[key] = image.url;
    draft[`${key}Alt`] ??= {es: '', en: ''};
    rerenderKeepingScroll();
    toast('Imagen lista. Se subirá al guardar.', 'ok');
  } catch (problem) { toast(problem.message, 'error'); }
}

window.addEventListener('hashchange', route);
window.addEventListener('beforeunload', event => { if (isDirty()) { event.preventDefault(); event.returnValue = ''; } });

// ---------- start ----------
(async () => {
  const saved = storage.get();
  if (!saved) { showView('login'); return; }
  showView('loading');
  try { await signIn(saved, (() => { try { return localStorage.getItem(TOKEN_KEY) === saved; } catch { return false; } })()); route(); }
  catch (problem) {
    if (problem instanceof ApiError && (problem.status === 401 || problem.status === 403)) storage.clear();
    state.token = null; showView('login');
    const error = $('#login-error'); error.textContent = describe(problem); error.hidden = false;
  }
})();
