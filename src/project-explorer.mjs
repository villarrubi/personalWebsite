import {projectMaps,projectDialogs} from './project-map.mjs';

export function projectExplorer(lang){
 return `<div id="projects" class="project-explorer"><span id="archive" class="project-archive-anchor" aria-hidden="true"></span><div id="project-orbits">${projectMaps(lang)}</div>${projectDialogs(lang)}</div>`;
}
