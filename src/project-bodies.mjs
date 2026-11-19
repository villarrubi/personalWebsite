import {projectSymbol} from '../public/project-symbols.js';
import {projectTheme} from '../public/project-presentation.js';

// The no-WebGL icon keeps the same rounded tile, palette and symbol proportions.
export function projectBody(project){
 const svg=projectSymbol(project.id),inner=svg.slice(svg.indexOf('>')+1,svg.lastIndexOf('</svg>'));
 const id=`fallback-${project.id}`;
 const theme=projectTheme(project.id);
 return `<svg class="project-planet" viewBox="0 0 240 240" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${theme.face}"/><stop offset="1" stop-color="${theme.edge}"/></linearGradient></defs><rect x="19" y="23" width="202" height="202" rx="37" fill="${theme.edge}"/><rect x="19" y="16" width="202" height="202" rx="37" fill="url(#${id})" stroke="${theme.detail}" stroke-width="1.5"/><g transform="translate(59 53) scale(3.6)" stroke="#e5edf5" stroke-width="1.5">${inner}</g></svg>`;
}
