import { mkdir, writeFile, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { copy, profile, projects, getName, getTagName } from '../src/content.mjs';
import { homeContent } from '../src/home.mjs';
import { projectCases, technicalFlow } from '../src/project-cases.mjs';
import {prepareDeployment} from './deploy-paths.mjs';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
await mkdir(out, { recursive: true });
await cp(resolve(root, 'public'), out, { recursive: true });
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const arrow = '<svg class="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.5"/></svg>';
const external = '<span aria-hidden="true">↗</span>';
function board() {
 const pieces = {0:'♜',4:'♚',7:'♜',9:'♟',10:'♟',11:'♟',14:'♟',15:'♟',18:'♞',21:'♞',27:'♟',28:'♙',34:'♗',42:'♘',45:'♘',48:'♙',49:'♙',50:'♙',53:'♙',54:'♙',55:'♙',56:'♖',59:'♕',62:'♔',63:'♖'};
 return `<div class="board" aria-hidden="true">${Array.from({length:64},(_,i)=>`<span class="square ${(Math.floor(i/8)+i)%2?'dark':''} ${i===34||i===27?'highlight':''}">${pieces[i]||''}</span>`).join('')}</div>`;
}
function productVisual(p,lang) {
 const isChess=p.id==='chessbot',isPipa=p.id==='pipa';
 const image=isChess?'chessbot-app.png':isPipa?'pipa-control.jpg':'mapforge.png';
 const subtitle=isChess?(lang==='es'?'Un motor propio. Jugada a jugada.':'An engine of my own. Move by move.'):isPipa?(lang==='es'?'Tu ordenador. Tu asistente.':'Your computer. Your assistant.'):(lang==='es'?'Herramientas para crear mundos.':'Tools for building worlds.');
 return `<div class="project-art product-art product-${p.id}" style="view-transition-name:art-${p.id}"><span class="art-label">${isChess?'C++20 / UCI':isPipa?'LOCAL FIRST / ESP32-S3':'TYPESCRIPT / CANVAS 2D'}</span><span class="product-wordmark" aria-hidden="true">${isPipa?'Pipα':p.name}</span><span class="product-caption">${subtitle}</span><img class="product-screen" src="/assets/images/${image}" alt="${copy[lang].realCapture}: ${getName(p,lang)}" loading="lazy" width="${isPipa?'1089':isChess?'1040':'1440'}" height="${isPipa?'485':isChess?'760':'960'}"><span class="art-index" aria-hidden="true">${isChess?'01':isPipa?'02':'03'}</span></div>`;
}
function visual(p, lang, detail=false) {
 if(['atlas-celular','phishing','club-palentino'].includes(p.id)){const image={'atlas-celular':'atlas-cell.webp',phishing:'phishing.png','club-palentino':'club-palentino.png'}[p.id];return `<div class="project-visual-capture ${p.id}"><img src="/assets/images/${image}" alt="${lang==='es'?'Vista del proyecto':'Project view'}: ${esc(getName(p,lang))}" loading="lazy"></div>`;}
 if(['chessbot','pipa','mapforge'].includes(p.id))return productVisual(p,lang);
 const c=copy[lang];
 if(p.visual==='chess') return `<div class="project-art chess-art" style="view-transition-name:art-${p.id}"><span class="art-label">${esc(p.name)} / ${lang==='es'?'ESTUDIO DE POSICIÓN':'POSITION STUDY'}</span><div class="board-paper">${board()}<span class="board-coords">a &nbsp; b &nbsp; c &nbsp; d &nbsp; e &nbsp; f &nbsp; g &nbsp; h</span></div><div class="notation">1. e4 &nbsp; e5<br>2. Nf3 &nbsp; Nc6<br><span>3. Bc4 &nbsp; …</span></div><span class="art-doodle">${c.chessNote}</span></div>`;
 return `<div class="project-art abstract-art ${p.visual}" style="view-transition-name:art-${p.id}"><span class="art-label">${esc(p.name)} / ${esc(p.year)}</span><div class="abstract-diagram"><span>{</span><div class="diagram-nodes"><i></i><i></i><i></i></div><span>}</span></div><span class="art-doodle">${esc(p.category[lang])}</span></div>`;
}
const urlFor=(lang,id)=>`/${lang}/${id?`projects/${id}/`:''}`;
function projectState(p,lang) {
 const c=copy[lang];
 return `<span class="project-state"><span class="status ${p.status}"><i></i>${p.status==='built'?c.built:c.inProgress}</span><span class="visibility ${p.visibility}">${p.visibility==='public'?c.publicCode:c.privateCode}</span></span>`;
}
function header(lang,id) {
 const c=copy[lang],other=lang==='es'?'en':'es';
 return `<a class="skip" href="#main">${c.skip}</a><header class="site-header"><div class="header-inner"><a class="brand" href="/${lang}/" aria-label="Alejandro Villarrubia — ${lang==='es'?'Inicio':'Home'}">av.</a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="${c.menu}"><span></span><span></span></button><nav id="main-nav" aria-label="${lang==='es'?'Principal':'Main'}"><a href="/${lang}/#top" ${id?'':'aria-current="page"'}>${lang==='es'?'Inicio':'Home'}</a><a href="/${lang}/#projects">${c.nav[0]}</a><a href="/${lang}/#about">${c.nav[1]}</a><a href="/${lang}/#contact">${c.nav[2]}</a></nav><span class="header-location">PALENCIA, ES</span><a class="language-switch" href="${urlFor(other,id)}" hreflang="${other}" lang="${other}" aria-label="${c.otherLabel}">${c.other}<span aria-hidden="true">↗</span></a></div></header>`;
}
function footer(lang) {
 const c=copy[lang];
 return `<footer class="site-footer container"><a class="footer-signature" href="/${lang}/">Alejandro Villarrubia</a><span>© ${new Date().getFullYear()} · ${lang==='es'?'Software, IA local y sistemas físicos.':'Software, local AI, and physical systems.'}</span><a href="/assets/credits.txt" target="_blank" rel="noopener">${lang==='es'?'Créditos':'Credits'}</a><a href="#top">${c.backTop} ↑</a></footer><div id="toast" role="status" aria-live="polite"></div>`;
}
function layout(lang,body,id) {
 const c=copy[lang],p=projects.find(p=>p.id===id),title=p?`${getName(p,lang)} — Alejandro Villarrubia`:c.title,description=p?p.summary[lang]:c.description;
 return `<!doctype html><html lang="${lang}" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#061327"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="alternate" hreflang="es" href="${urlFor('es',id)}"><link rel="alternate" hreflang="en" href="${urlFor('en',id)}"><style>@view-transition{navigation:auto}</style><script src="/intro-boot.js"></script><script src="/transitions.js"></script><link rel="preload" href="/assets/fonts/instrument-serif.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/night.css"><link rel="stylesheet" href="/engineering.css"><link rel="stylesheet" href="/impact.css"><script type="module" src="/app.js"></script></head><body data-lang="${lang}">${header(lang,id)}<main id="main">${body}</main>${footer(lang)}</body></html>`;
}
function home(lang) { return layout(lang,homeContent(lang)); }
function detail(lang,p) {
 const c=copy[lang],name=getName(p,lang),other=projects[(projects.indexOf(p)+1)%projects.length];
 return layout(lang,`<article class="detail-page container"><a class="back-link" href="/${lang}/#projects">← ${c.back}</a><header class="detail-heading"><div><p class="eyebrow">${esc(p.category[lang])}</p><h1>${esc(name)}</h1><p class="detail-summary">${esc(p.summary[lang])}</p></div>${projectState(p,lang)}</header><div class="detail-visual">${visual(p,lang,true)}</div><div class="detail-layout"><aside class="detail-sidebar"><div><span class="eyebrow">${c.year}</span><p>${p.year}</p></div><div><span class="eyebrow">${c.stack}</span><p>${p.tags.map(t=>esc(getTagName(t,lang))).join('<br>')}</p></div><div class="detail-links">${p.visibility==='public'&&p.repo?`<a class="button secondary" href="${p.repo}" target="_blank" rel="noopener noreferrer">${c.code}${external}</a>`:`<span class="private-label">${p.localOnly?c.localCodeNote:c.privateNote}</span>`}${p.demo?`<a class="button primary" href="${p.demo}" target="_blank" rel="noopener noreferrer">${c.live}${external}</a>`:''}</div></aside><div class="detail-body">${projectCases[p.id]?`<section class="case-context"><p class="eyebrow">${lang==='es'?'EL RETO / MI APORTACIÓN':'THE CHALLENGE / MY CONTRIBUTION'}</p><h2>${lang==='es'?'Del problema al sistema.':'From problem to system.'}</h2><p>${esc(projectCases[p.id][lang].problem)}</p><p>${esc(projectCases[p.id][lang].contribution)}</p>${technicalFlow(p.id,lang)}</section>`:''}<section><span class="eyebrow">01</span><h2>${c.overview}</h2><p>${esc(p.idea[lang])}</p></section><section><span class="eyebrow">02</span><h2>${c.implementation}</h2><ul>${p.built[lang].map(v=>`<li>${esc(v)}</li>`).join('')}</ul></section><section class="stage-note"><span class="eyebrow">03 / ${p.status==='built'?c.built:c.inProgress}</span><h2>${c.statusTitle}</h2><p>${esc(p.stage[lang])}</p></section></div></div>${p.capture?`<figure class="application-capture"><img src="${p.capture}" alt="${c.realCapture}: ${esc(name)}" loading="lazy"><figcaption>${c.realCapture} — ${esc(name)}</figcaption></figure>`:''}<div class="next-project"><span class="eyebrow">${c.next}</span><a href="${urlFor(lang,other.id)}">${esc(getName(other,lang))}${arrow}</a></div></article>`,p.id);
}
async function write(relative,html) {const file=resolve(out,relative);await mkdir(resolve(file,'..'),{recursive:true});await writeFile(file,html);}
for(const lang of ['es','en']) {
 await write(`${lang}/index.html`,home(lang));
 for(const p of projects) await write(`${lang}/projects/${p.id}/index.html`,detail(lang,p));
}
await write('index.html',home('en'));
await write('404.html',layout('en','<section class="container not-found"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>This page<br>is not here.</h1><a class="button primary" href="/en/">Back to home →</a></section>'));
await writeFile(resolve(out,'.nojekyll'),'');
await prepareDeployment(out);
console.log(`Built ${projects.length} project pages in each language. Output: ${out}`);
