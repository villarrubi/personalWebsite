import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
import { projects } from '../src/content.mjs';
import { layoutPlanets } from '../public/solar-layout.js';
import { createOrbitPaths, orbitPoint } from '../public/solar-motion.js';
import {basePath} from './deploy-paths.mjs';
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
  if(basePath&&href.startsWith('/'))assert(href.startsWith(`/${basePath}/`),`URL must include deployment prefix: ${href}`);
  const local=basePath&&href.startsWith(`/${basePath}/`)?href.slice(basePath.length+1):href;
  const target=local.startsWith('/')?resolve(root,'.'+local):resolve(dirname(path),local);
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
for(const count of [1,20,50,100])for(const [width,height,capacity] of [[338,443,6],[640,443,8],[1324,650,12]])for(const phase of [0,.8,1.6,3.1,4.8]){
 const items=Array.from({length:count},(_,i)=>({id:`planet-${i}`}));
 const seen=[];
 for(let offset=0;offset<count;offset+=capacity){
  const chunk=items.slice(offset,offset+capacity),nodes=layoutPlanets(chunk,width,height,true,phase);
  assert.equal(nodes.length,chunk.length,'Every planet is placed');
  assert.deepEqual(layoutPlanets(chunk,width,height,true,phase),nodes,'Layout is deterministic');
  for(const n of nodes){
   seen.push(n.id);
   assert(n.x-n.width/2>=0&&n.x+n.width/2<=width,`Horizontal bounds: ${n.id}`);
   assert(n.y-n.height/2>=0&&n.y+n.height/2<=height,`Vertical bounds: ${n.id}`);
  }
  for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j];
   assert(Math.abs(a.x-b.x)>=(a.width+b.width)/2||Math.abs(a.y-b.y)>=(a.height+b.height)/2,`Overlapping planets: ${a.id}/${b.id}`);
  }
 }
 assert.deepEqual(seen,items.map(item=>item.id),'Every project appears in a constellation');
}
// Follow several complete turns, including the loop seams and tight mobile layouts.
for(const [width,height,count] of [[338,443,4],[640,443,6],[1324,650,9],[1324,650,6]]){
 const paths=createOrbitPaths(layoutPlanets(Array.from({length:count},(_,id)=>({id})),width,height),width,height);
 for(const path of paths){
  const points=Array.from({length:120},(_,i)=>orbitPoint(path,path.period*i/120));
  assert(Math.min(...points.map(p=>p.x))<width/2&&Math.max(...points.map(p=>p.x))>width/2,'Each project orbits across both sides of the centre');
  assert(Math.min(...points.map(p=>p.y))<height/2&&Math.max(...points.map(p=>p.y))>height/2,'Each project completes the upper and lower orbit');
 }
 const velocities=paths.map(p=>{const a=orbitPoint(p,0),b=orbitPoint(p,.1);return {x:b.x-a.x,y:b.y-a.y};});
 assert(velocities.some(v=>v.x>0)&&velocities.some(v=>v.x<0),'Objects follow different directions around the centre instead of translating together');

 for(let frame=0;frame<=10800;frame+=6){
  const time=frame/60,nodes=paths.map(p=>orbitPoint(p,time));
  for(const [i,n]of nodes.entries()){
   assert(n.x-n.width/2>=0&&n.x+n.width/2<=width&&n.y-n.height/2>=0&&n.y+n.height/2<=height,'Moving object remains in bounds');
   const before=orbitPoint(paths[i],time-1/60),after=orbitPoint(paths[i],time+1/60);
   assert(Math.hypot(n.x-before.x,n.y-before.y)<.4,'No position jumps during orbit');
   assert(Math.hypot(after.x-2*n.x+before.x,after.y-2*n.y+before.y)<.002,'Continuous velocity through curves and loop seams');
   for(const b of nodes.slice(i+1))assert(Math.abs(n.x-b.x)>=(n.width+b.width)/2||Math.abs(n.y-b.y)>=(n.height+b.height)/2,'Moving objects remain separated');
  }
 }
}
console.log(`PASS: ${pages.length} HTML pages, ${links} local assets/links, ${projects.length} bilingual projects; responsive constellations up to 100 projects; continuous orbits over 180 seconds.`);
