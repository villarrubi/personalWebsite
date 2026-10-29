import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, readdir, rm, realpath, lstat } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { validateProject } from '../src/project-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const config = JSON.parse(await readFile(join(root, '.pages.yml'), 'utf8'));
const collection = config.content.find(item => item.name === 'projects');
assert.equal(collection.path, 'content/projects');
assert.equal(collection.format, 'json');
assert.equal(collection.filename.template, '{fields.id}.json');
assert.equal(collection.operations.delete, true);
assert.equal(config.media[0].input, 'public/assets/images');
assert.equal(config.media[0].output, '/assets/images');
const fields = Object.fromEntries(collection.fields.map(field => [field.name, field]));
for (const key of ['name', 'id', 'published', 'featured', 'order', 'cover', 'coverAlt', 'capture', 'captureAlt', 'category', 'summary', 'idea', 'built', 'stage', 'caseStudy']) assert(fields[key], `CMS can edit ${key}`);
assert.equal(fields.published.default, false, 'New projects start hidden');

const sample = JSON.parse(await readFile(join(root, 'content/projects/pipa.json'), 'utf8'));
const rejects = patch => assert.throws(() => validateProject({ ...sample, ...patch }, 'pipa.json'));
rejects({ id: '../../escape' });
rejects({ id: 'another-id' });
rejects({ published: 'false' });
rejects({ demo: 'javascript:alert(1)' });
rejects({ demo: 'https://example.org/" onmouseover="alert(1)' });
rejects({ cover: '/assets/images/../../credentials.png' });
rejects({ cover: 'https://example.org/tracker.png' });
rejects({ coverAlt: undefined });
rejects({ coverAlt: { es: 'Solo un idioma' } });
rejects({ capture: '/assets/images/pipa-control.jpg', captureAlt: { es: 'Captura', en: '' } });
assert(validateProject({ ...sample, published: false, coverAlt: undefined }, 'pipa.json'), 'Drafts may have incomplete image descriptions');
rejects({ summary: { es: 'Solo un idioma' } });
assert(!validateProject({ ...sample, visibility: 'private', repo: 'https://github.com/villarrubi/example' }, 'pipa.json').repo, 'Private source is never rendered');
assert(!validateProject({ ...sample, published: false, caseStudy: { es: {}, en: {} } }, 'pipa.json').caseStudy, 'An empty optional case study is ignored');

// Exercise real builds in an isolated checkout, including stale-page cleanup.
const parent = await realpath(tmpdir());
const sandbox = await mkdtemp(join(parent, 'portfolio-cms-check-'));
assert(sandbox.startsWith(parent + sep));
try {
  for (const directory of ['src', 'scripts', 'public', 'content']) await cp(join(root, directory), join(sandbox, directory), { recursive: true });
  await cp(join(root, 'package.json'), join(sandbox, 'package.json'));
  const projectPath = join(sandbox, 'content/projects/cms-check.json');
  const newProject = { ...sample, id: 'cms-check', name: '<script>alert("test")</script>', enName: 'CMS "test"', featured: true, order: 0 };
  newProject.coverAlt={es:'Panel "local" <Pipa>',en:'Local "control" <Pipa>'};
  const build = () => {
    const result = spawnSync(process.execPath, ['scripts/build.mjs'], { cwd: sandbox, env: { ...process.env, SITE_BASE_PATH: '' }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  };
  const html = (lang = 'es') => readFile(join(sandbox, 'dist', lang, 'index.html'), 'utf8');
  const exists = path => lstat(path).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; });
  await writeFile(projectPath, JSON.stringify(newProject));
  build();
  for (const lang of ['es', 'en']) {
    assert((await html(lang)).includes('data-project="cms-check"'), 'A created project is in the orbit');
    const detail = await readFile(join(sandbox, 'dist', lang, 'projects/cms-check/index.html'), 'utf8');
    assert(detail.includes('/assets/images/pipa-control.jpg'), 'Uploaded image path reaches the detail page');
    assert(!detail.includes('<script>alert("test")</script>'), 'Editor content cannot inject HTML');
    const escapedAlt=newProject.coverAlt[lang].replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    assert(detail.includes(`alt="${escapedAlt}"`), 'Image descriptions are localized and escaped on detail pages');
    assert((await html(lang)).includes(`alt="${escapedAlt}"`), 'Image descriptions also reach project dialogs');
  }
  newProject.name = 'Proyecto actualizado';
  newProject.summary.es = 'Texto editado desde el gestor.';
  newProject.featured = false;
  await writeFile(projectPath, JSON.stringify(newProject));
  build();
  assert((await html()).includes('Texto editado desde el gestor.'), 'Edits reach the public dialog');
  assert.match(await html(), /data-map-world="side"[^]*data-project="cms-check"/, 'Grouping can be edited');
  newProject.published = false;
  await writeFile(projectPath, JSON.stringify(newProject));
  build();
  assert(!(await html()).includes('data-project="cms-check"'), 'Unpublishing removes the orbit');
  assert(!await exists(join(sandbox, 'dist/es/projects/cms-check')), 'Unpublishing removes old generated detail pages');
  await rm(projectPath);
  build();
  assert(!(await html()).includes('cms-check'), 'Deletion leaves no public reference');
  const draft = { id: 'draft', name: 'Borrador', status: 'development', visibility: 'private', visual: 'data' };
  await writeFile(join(sandbox, 'content/projects/draft.json'), JSON.stringify(draft));
  build();
  assert(!(await html()).includes('data-project="draft"'), 'Incomplete drafts stay hidden');
  for (const filename of await readdir(join(sandbox, 'content/projects'))) if (filename.endsWith('.json')) await rm(join(sandbox, 'content/projects', filename));
  build();
  assert(!(await html()).includes('data-project='), 'An empty catalog still builds');
  assert(await exists(join(sandbox, 'dist/admin/index.html')), 'The administration entry stays available');
} finally {
  // Delete only the regular temporary directory created by this test.
  assert((await realpath(sandbox)) === sandbox && sandbox.startsWith(parent + sep));
  await rm(sandbox, { recursive: true });
}
console.log('PASS: CMS create/edit/hide/delete, bilingual content, images, grouping, drafts, empty catalog, safe content and generated-page cleanup.');
