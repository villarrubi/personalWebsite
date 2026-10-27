import { publishedProjects } from './content.mjs';

export const projectCases = Object.fromEntries(publishedProjects.filter(project => project.caseStudy).map(project => [project.id, project.caseStudy]));
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function technicalFlow(id, lang) {
  const data = projectCases[id]?.[lang];
  if (!data) return '';
  return `<ol class="technical-flow" aria-label="${lang === 'es' ? 'Componentes del proyecto' : 'Project components'}">${data.flow.map(item => `<li>${esc(item)}</li>`).join('')}</ol>`;
}
