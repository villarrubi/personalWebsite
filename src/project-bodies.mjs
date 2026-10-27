import {projectSymbol} from '../public/project-symbols.js';

// The fallback uses the same recognisable project symbol, not a generic sculpture.
export function projectBody(project){
 const svg=projectSymbol(project.id),inner=svg.slice(svg.indexOf('>')+1,svg.lastIndexOf('</svg>'));
 const id=`fallback-${project.id}`;
 return `<svg class="project-planet" viewBox="0 0 240 230" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs><linearGradient id="${id}" x2=".9" y2="1"><stop stop-color="#f5f8ff"/><stop offset=".4" stop-color="#b5cbea"/><stop offset="1" stop-color="#637da7"/></linearGradient></defs><g transform="translate(29 18) scale(5.2)" stroke="#24344f" stroke-width="2">${inner}</g><g transform="translate(23 10) scale(5.2)" stroke="url(#${id})" stroke-width="1.5">${inner}</g></svg>`;
}
