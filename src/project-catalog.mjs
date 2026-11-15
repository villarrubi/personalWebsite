import { readdir, readFile } from 'node:fs/promises';
import { validateProject } from '../public/admin/project-schema.js';

export { validateProject };

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
