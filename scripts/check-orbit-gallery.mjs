import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {publishedProjects} from '../src/content.mjs';
import {projectAccent} from '../public/project-presentation.js';
import {orbitCapacity} from '../public/solar-focus.js';

for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 assert(html.includes('solar-system orbit-gallery'));
 assert.deepEqual([...html.matchAll(/id="project-preview-([^"]+)"/g)].map(m=>m[1]).sort(),publishedProjects.map(p=>p.id).sort(),'Every published project has one preview');
 for(const project of publishedProjects){
  const preview=html.split(`id="project-preview-${project.id}">`)[1].split('</template>')[0];
  assert(preview.includes(`/projects/${project.id}/`),'Preview links to the full project');
  assert(preview.includes('solar-preview-summary'));
  if(project.cover)assert(preview.includes(project.cover));
 }
 assert(html.includes('class="solar-preview-controls" hidden'),'Nonfunctional controls stay hidden without JS');
}
assert.deepEqual([320,599,600,999,1000,1440].map(orbitCapacity),[3,3,4,4,6,6]);
assert.equal(projectAccent('unknown'),projectAccent('constructor'));

const source=(await readFile(new URL('../public/solar-focus.js',import.meta.url),'utf8')).replaceAll('export ','');
function gallery({reduced=false,paused=false}={}){
 const node=id=>({dataset:{project:id,accent:projectAccent(id)},events:new Map(),selected:false,classList:{toggle(_,on){this.owner.selected=on;}},addEventListener(name,fn){this.events.set(name,fn);}});
 const nodes=['chessbot','pipa','mapforge','phishing'].map(node);nodes.forEach(n=>n.classList.owner=n);
 let rendered=null,animations=0,notifications=0;
 const body={replaceChildren(content){rendered=content??null;},animate(){animations++;return {cancel(){}};}};
 const control=()=>({disabled:false,events:new Map(),addEventListener(name,fn){this.events.set(name,fn);}});
 const previous=control(),next=control(),count={},controls={hidden:true};
 const selectors={'.solar-preview-body':body,'.solar-preview-count':count,'[data-preview-step="-1"]':previous,'[data-preview-step="1"]':next,'.solar-preview-controls':controls};
 const root={dataset:{},style:{setProperty(){}},querySelector:s=>selectors[s],querySelectorAll:()=>nodes,dispatchEvent(){notifications++;}};
 const context={root,motion:{matches:paused},document:{getElementById:id=>({content:{cloneNode:()=>id}})},matchMedia:()=>({matches:reduced}),Event};
 runInNewContext(source+'\nglobalThis.focus=createOrbitFocus(root,motion);',context);
 return {focus:context.focus,nodes,root,count,controls,previous,next,get rendered(){return rendered;},get animations(){return animations;},get notifications(){return notifications;}};
}
const g=gallery();g.focus.update(g.nodes.slice(0,3));
assert.equal(g.root.dataset.focusProject,'chessbot');assert.equal(g.rendered,'project-preview-chessbot');assert.equal(g.count.textContent,'01 / 03');assert(!g.controls.hidden);
g.nodes[1].events.get('pointerenter')({pointerType:'mouse'});assert.equal(g.root.dataset.focusProject,'pipa');assert.equal(g.animations,1);
g.nodes[2].events.get('focus')();assert.equal(g.root.dataset.focusProject,'mapforge');assert.equal(g.count.textContent,'03 / 03');
g.next.events.get('click')();assert.equal(g.root.dataset.focusProject,'chessbot','Next wraps through the visible orbit');
g.previous.events.get('click')();assert.equal(g.root.dataset.focusProject,'mapforge');
g.nodes[0].events.get('pointerenter')({pointerType:'touch'});assert.equal(g.root.dataset.focusProject,'mapforge','Touch does not unexpectedly replace a preview');
g.nodes[3].events.get('focus')();assert.equal(g.root.dataset.focusProject,'mapforge','Hidden group cannot become selected');
const before=g.notifications;g.focus.update(g.nodes.slice(0,3));assert.equal(g.notifications,before,'Resize preserves an unchanged selection and link focus');
g.focus.update([g.nodes[3]]);assert.equal(g.root.dataset.focusProject,'phishing');assert(g.previous.disabled&&g.next.disabled);assert.equal(g.nodes.filter(n=>n.selected).length,1);
g.focus.update([]);assert.equal(g.rendered,null);assert.equal(g.root.dataset.focusProject,undefined);assert.equal(g.count.textContent,'00 / 00');
for(const options of [{reduced:true},{paused:true}]){
 const calm=gallery(options);calm.focus.update(calm.nodes);calm.next.events.get('click')();assert.equal(calm.animations,0);assert.equal(calm.root.dataset.focusProject,'pipa');
}
console.log('PASS: bilingual project previews, direct links, pointer/keyboard selection, page/group changes, wraparound, empty catalogs, and reduced-motion previews.');
