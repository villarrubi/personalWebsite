import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
import { projects } from '../src/content.mjs';
const root=resolve(import.meta.dirname,'../dist');
const pages=[];
async function walk(dir){for(const file of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,file.name);if(file.isDirectory())await walk(path);else if(path.endsWith('.html'))pages.push(path);}}
await walk(root);
let links=0;
for(const path of pages){
 const html=await readFile(path,'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`One h1: ${path}`);
 assert.match(html,/<html lang="(es|en)"/);
 assert(!html.includes('Technical Sales Manager'),`Outdated role: ${path}`);
 for(const [,href] of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){
  if(/^(https?:|mailto:|data:)/.test(href))continue;
  const target=href.startsWith('/')?resolve(root,'.'+href):resolve(dirname(path),href);
  try{await stat(target);links++;}catch{throw new Error(`Broken local link: ${href} in ${path}`);}
 }
}
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);
for(const p of projects){
 assert(['public','private'].includes(p.visibility),`Explicit source visibility: ${p.id}`);
 if(p.visibility==='public')assert.match(p.repo||'',/^https:\/\/github\.com\/villarrubi\/[^/]+$/,`Public repository: ${p.id}`);
 else assert(!p.repo,`Private project must not expose a source link: ${p.id}`);
 if(p.localOnly)assert.equal(p.visibility,'private',`Local project visibility: ${p.id}`);
 for(const lang of ['es','en'])assert(p.summary[lang]&&p.idea[lang]&&p.built[lang].length&&p.stage[lang]);
}
console.log(`PASS: ${pages.length} HTML pages, ${links} local assets/links, ${projects.length} bilingual projects.`);
