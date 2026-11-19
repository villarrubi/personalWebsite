import {projectSymbol} from '../public/project-symbols.js';

// The no-WebGL icon keeps the same rounded tile, palette and symbol proportions.
export function projectBody(project){
 const svg=projectSymbol(project.id),inner=svg.slice(svg.indexOf('>')+1,svg.lastIndexOf('</svg>'));
 const id=`fallback-${project.id}`;
 return `<svg class="project-planet" viewBox="0 0 240 240" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#3e6482"/><stop offset="1" stop-color="#203b55"/></linearGradient></defs><rect x="19" y="23" width="202" height="202" rx="37" fill="#162c43"/><rect x="19" y="16" width="202" height="202" rx="37" fill="url(#${id})" stroke="#7898b4" stroke-width="1.5"/><g transform="translate(59 53) scale(3.6)" stroke="#e5edf5" stroke-width="1.5">${inner}</g></svg>`;
}
