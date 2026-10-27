import { readdir, readFile } from 'node:fs/promises';

const languages = ['es', 'en'];
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const visuals = new Set(['chess', 'pipa', 'map', 'planning', 'science', 'data', 'security']);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const hasContent = value => isObject(value) || Array.isArray(value) ? Object.values(value).some(hasContent) : typeof value === 'string' ? !!value.trim() : value != null;

export function validateProject(input, filename) {
  const fail = message => { throw new Error(`${filename}: ${message}`); };
  if (!isObject(input)) fail('El proyecto debe ser un objeto JSON.');
  const project = structuredClone(input);
  if (typeof project.id !== 'string' || !slug.test(project.id) || project.id.length > 80)
    fail('El identificador debe contener minúsculas, números y guiones.');
  if (filename !== `${project.id}.json`) fail('El identificador debe coincidir con el nombre del archivo.');
  const text = (value, field, required = true, max = 8000) => {
    if ((value === undefined || value === null || value === '') && !required) return '';
    if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`Revisa el campo ${field}.`);
    return value;
  };
  const list = (value, field, required = true) => {
    if (value == null && !required) return [];
    if (!Array.isArray(value) || (required && !value.length) || value.length > 100) fail(`Revisa la lista ${field}.`);
    value.forEach(item => text(item, field));
    return value;
  };
  for (const key of ['published', 'featured', 'localOnly']) {
    if (project[key] != null && typeof project[key] !== 'boolean') fail(`${key} debe ser sí o no.`);
    project[key] = project[key] === true;
  }
  text(project.name, 'nombre', true, 180);
  text(project.enName, 'nombre en inglés', false, 180);
  text(project.shortName, 'nombre corto en órbita', false, 80);
  if (project.year != null) project.year = String(project.year);
  text(project.year, 'año', project.published, 40);
  if (!['built', 'development'].includes(project.status)) fail('Selecciona un estado válido.');
  if (!['public', 'private'].includes(project.visibility)) fail('Selecciona la visibilidad del código.');
  if (project.localOnly && project.visibility !== 'private') fail('Un proyecto local debe tener código privado.');
  if (!visuals.has(project.visual)) fail('Selecciona una ilustración válida.');
  project.order ??= 1000;
  if (!Number.isInteger(project.order) || project.order < 0 || project.order > 100000) fail('El orden debe ser un entero entre 0 y 100000.');
  project.tags = list(project.tags, 'herramientas', false);
  for (const field of ['category', 'summary', 'idea', 'built', 'stage']) {
    project[field] ??= {};
    if (!isObject(project[field])) fail(`Revisa ${field} en español e inglés.`);
    for (const lang of languages) {
      if (field === 'built') project[field][lang] = list(project[field][lang], `${field}.${lang}`, project.published);
      else project[field][lang] = text(project[field][lang], `${field}.${lang}`, project.published);
    }
  }
  for (const key of ['repo', 'demo']) {
    const value = text(project[key], key, false, 2048);
    if (!value) { delete project[key]; continue; }
    let url;
    try { url = new URL(value); } catch { fail(`El enlace ${key} no es válido.`); }
    if (url.protocol !== 'https:' || url.username || url.password || /[\s<>"\\]/.test(value)) fail(`El enlace ${key} debe usar HTTPS.`);
    if (key === 'repo' && (url.hostname !== 'github.com' || !/^\/[\w.-]+\/[\w.-]+\/?$/.test(url.pathname) || url.search || url.hash))
      fail('El repositorio debe ser una dirección de proyecto en GitHub.');
  }
  // A previously public source link must never leak after switching to private.
  if (project.visibility === 'private') delete project.repo;
  else if (project.published && !project.repo) fail('Indica el repositorio del código público.');
  for (const key of ['cover', 'capture']) {
    const value = text(project[key], key, false, 500);
    if (!value) { delete project[key]; continue; }
    if (!/^\/assets\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|avif)$/i.test(value))
      fail(`Selecciona una imagen de la biblioteca para ${key}.`);
  }
  if (!hasContent(project.caseStudy)) delete project.caseStudy;
  if (project.caseStudy != null) {
    if (!isObject(project.caseStudy)) fail('Revisa el caso de estudio.');
    for (const lang of languages) {
      const study = project.caseStudy[lang] ??= {};
      if (!isObject(study)) fail(`Falta el caso de estudio en ${lang}.`);
      text(study.problem, `reto.${lang}`, project.published);
      text(study.contribution, `aportación.${lang}`, project.published);
      list(study.flow, `componentes.${lang}`, project.published);
      text(study.focus, `enfoque.${lang}`, false);
    }
  }
  return project;
}

export async function loadProjectCatalog(directory = new URL('../content/projects/', import.meta.url)) {
  const entries = await readdir(directory, { withFileTypes: true });
  const projects = [];
  for (const entry of entries) {
    if (!entry.name.endsWith('.json')) continue;
    if (!entry.isFile()) throw new Error(`El proyecto ${entry.name} debe ser un archivo regular.`);
    const raw = await readFile(new URL(entry.name, directory), 'utf8');
    let input;
    try { input = JSON.parse(raw); } catch { throw new Error(`${entry.name}: JSON no válido.`); }
    projects.push(validateProject(input, entry.name));
  }
  return projects.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}
