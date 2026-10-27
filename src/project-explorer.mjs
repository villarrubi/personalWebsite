import {projects,getName,getTagName,copy} from './content.mjs';
import {projectMaps,projectDialogs} from './project-map.mjs';
import {caseOrder,projectCases,technicalFlow} from './project-cases.mjs';

const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function state(p,lang){const c=copy[lang];return `<span class="case-state"><i class="${p.status}"></i>${p.status==='built'?c.built:c.inProgress}<span>·</span>${p.visibility==='public'?c.publicCode:c.privateCode}</span>`;}
function caseCard(p,lang,index){
 const es=lang==='es',item=projectCases[p.id],data=item[lang],name=getName(p,lang);
 return `<article class="case-card"><a class="case-image" href="/${lang}/projects/${p.id}/" aria-label="${es?'Ver proyecto':'View project'}: ${esc(name)}"><div class="case-image-label"><span>0${index+1} / ${esc(data.focus)}</span><span aria-hidden="true">↗</span></div><img src="/assets/images/${item.image}" alt="${copy[lang].realCapture}: ${esc(name)}" width="${item.width}" height="${item.height}" loading="lazy"></a><div class="case-copy"><div class="case-title"><h3><a href="/${lang}/projects/${p.id}/">${esc(name)}</a></h3><span>${p.year}</span></div>${state(p,lang)}<dl class="case-brief"><div><dt>${es?'EL RETO':'THE CHALLENGE'}</dt><dd>${esc(data.problem)}</dd></div><div><dt>${es?'QUÉ HE CONSTRUIDO':'WHAT I BUILT'}</dt><dd>${esc(data.contribution)}</dd></div></dl>${technicalFlow(p.id,lang)}<a class="case-link" href="/${lang}/projects/${p.id}/">${es?'Ver el proyecto':'Explore project'} <span aria-hidden="true">↗</span></a></div></article>`;
}
function compactCard(p,lang){
 return `<article class="archive-card"><p class="eyebrow">${esc(p.category[lang])}</p><h3><a href="/${lang}/projects/${p.id}/" data-project="${p.id}" aria-haspopup="dialog">${esc(getName(p,lang))}<span aria-hidden="true">↗</span></a></h3><p class="archive-summary">${esc(p.summary[lang])}</p><p class="archive-tech">${p.tags.map(tag=>esc(getTagName(tag,lang))).join(' · ')}</p>${state(p,lang)}</article>`;
}
export function projectExplorer(lang){
 const es=lang==='es';
 return `<section id="projects" class="project-explorer" aria-labelledby="projects-title"><div class="container"><div class="project-explorer-heading"><div><p class="eyebrow">01 / ${es?'PROYECTOS':'PROJECTS'}</p><h2 id="projects-title">${es?'Ideas que se pueden usar.':'Ideas you can use.'}</h2><p>${es?'Aplicaciones, algoritmos y dispositivos. Del problema al código que lo resuelve.':'Applications, algorithms, and devices. From a problem to the code that solves it.'}</p></div><div class="project-view-controls" role="group" aria-label="${es?'Vista de proyectos':'Project view'}" hidden><button type="button" data-project-view="cards" aria-pressed="true" aria-controls="project-cards">${es?'Tarjetas':'Cards'}</button><button type="button" data-project-view="orbits" aria-pressed="false" aria-controls="project-orbits">${es?'Órbitas':'Orbits'}</button></div></div></div>
 <div id="project-cards" class="container"><div class="case-grid">${caseOrder.map((id,index)=>caseCard(projects.find(p=>p.id===id),lang,index)).join('')}</div><div class="archive-heading" id="archive"><h3>${es?'Más proyectos y experimentos':'More projects and experiments'}</h3><span>${projects.length-caseOrder.length} ${es?'proyectos':'projects'}</span></div><div class="archive-grid">${projects.filter(p=>!caseOrder.includes(p.id)).map(p=>compactCard(p,lang)).join('')}</div></div>
 <div id="project-orbits" hidden>${projectMaps(lang)}</div>${projectDialogs(lang)}</section>`;
}
