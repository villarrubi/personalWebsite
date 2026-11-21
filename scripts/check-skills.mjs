import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initSkills} from '../public/skills.js';

for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 assert(!html.includes('data-skill-motion'),'Scenes have no playback button');
 assert.equal((html.match(/data-skill="/g)||[]).length,4);
 for(const id of ['software','ai','hardware','interfaces']){
  assert(html.includes(`aria-controls="skill-panel-${id}"`));
  assert(html.includes(`id="skill-panel-${id}" style=`),'All descriptions are available before JS enhancement');
 }
 for(const tag of ['Python','C++','Java / Swing','C# / .NET','Canvas 2D','Ollama','ESP32-S3','PCL / Eigen','React','Godot / GDScript'])assert(html.includes(`<li>${tag}</li>`));
}
for(const reduced of [true,false])for(const off of [true,false])for(const observerAvailable of [true,false]){
 const animations=[],media={matches:reduced,addEventListener(_,fn){this.change=fn;}};
 let observe,focused=-1;
 globalThis.matchMedia=()=>media;globalThis.location={search:off?'?motion=off':''};
 globalThis.document={hidden:false,addEventListener(_,fn){this.visibility=fn;}};
 if(observerAvailable)globalThis.IntersectionObserver=class{constructor(fn){observe=fn;}observe(){}};
 else delete globalThis.IntersectionObserver;
 const element=()=>({hidden:false,attrs:{},events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,v){this.events[k]=v;},animate(frames,options){const animation={frames,options,cancelled:false,cancel(){this.cancelled=true;}};animations.push(animation);return animation;}});
 const choices=Array.from({length:4},element),panels=Array.from({length:4},element),selector=element();
 panels.forEach(panel=>panel.querySelectorAll=()=>[element()]);
 choices.forEach((choice,index)=>choice.focus=options=>{assert.equal(options?.preventScroll,true,'Keyboard selection must not scroll');focused=index;choice.events.focus();});
 const root={...element(),classList:{add(){},toggle(){}},querySelector:()=>selector,querySelectorAll:s=>s==='[data-skill]'?choices:s==='.skill-insight'?panels:[selector]};
 const activeAnimations=()=>animations.filter(a=>!a.cancelled);
 initSkills(root);
 assert.equal(panels.filter(panel=>!panel.hidden).length,1);assert(!panels[0].hidden);
 if(observe){assert.equal(animations.length,0,'Offscreen scenes wait until visible');observe([{isIntersecting:true}]);}
 if(off)assert.equal(animations.length,0);
 else{
  assert(activeAnimations().some(a=>a.options.iterations===Infinity),'Scenes automatically loop, including reduced motion');
  assert.equal(animations.some(a=>a.frames.some(f=>f.transform)),!reduced,'Reduced motion removes spatial animation');
 }
 const entered=animations.length;
 observe?.([{isIntersecting:true}]);assert.equal(animations.length,entered,'Repeated intersection does not restart');
 choices[1].events.pointerenter({pointerType:'touch'});assert(!panels[0].hidden);
 choices[1].events.pointerenter({pointerType:'mouse'});assert(!panels[1].hidden);
 const repeated=animations.length;choices[1].events.click();assert.equal(animations.length,repeated);
 choices[3].events.click();assert(!panels[3].hidden);
 choices[3].events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(focused,0);
 choices[0].events.keydown({key:'End',preventDefault(){}});assert.equal(focused,3);
 root.events.keydown({key:'Escape'});assert(!panels[0].hidden);
 assert.equal(panels.filter(panel=>!panel.hidden).length,1);
 assert.equal(choices[0].attrs['aria-expanded'],'true');assert(choices.slice(1).every(choice=>choice.attrs['aria-expanded']==='false'));
 if(!off)assert(animations.some(a=>a.cancelled),'Switching cancels old scene loops');
 document.hidden=true;document.visibility();assert.equal(activeAnimations().length,0,'Hidden tabs stop all animation');
 choices[2].events.click();assert.equal(activeAnimations().length,0);
 assert.equal(root.attrs['data-active-skill'],'2');
 document.hidden=false;document.visibility();assert.equal(activeAnimations().length>0,!off,'Returning resumes the selected scene');
 if(observe){observe([{isIntersecting:false}]);assert.equal(activeAnimations().length,0);observe([{isIntersecting:true}]);assert.equal(activeAnimations().length>0,!off);}
 media.matches=true;media.change();assert(activeAnimations().every(a=>a.frames.every(f=>!f.transform)));
 if(off)assert.equal(animations.length,0);
}
delete globalThis.IntersectionObserver;delete globalThis.document;
console.log('PASS: bilingual skills, automatic scene loops, offscreen/tab suspension, reduced motion, explicit motion opt-out and stable keyboard navigation.');

// Check the real mesh geometry and motion bounds independently of a GPU.
const {createSkillModel}=await import('../public/skill-studio.js');
const T=await import('../public/assets/vendor/three.module.js');
for(const kind of ['software','ai','hardware','interfaces']){
 const model=createSkillModel(kind);
 const meshes=[];model.root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 assert(meshes.length>20,`${kind}: detailed model`);
 for(const mesh of meshes)assert([...mesh.geometry.attributes.position.array].every(Number.isFinite));
 const bounds=new T.Box3();
 for(const reduced of [false,true])for(const time of [0,3,10,120]){
  model.update(time,reduced);bounds.setFromObject(model.root);
  assert(bounds.min.y>-.05&&bounds.max.y<3,'Models stay above the ground and inside the camera framing');
  assert(bounds.max.x-bounds.min.x<4&&bounds.max.z-bounds.min.z<4);
 }
 model.update(2,true);model.root.updateMatrixWorld(true);const structural=meshes.filter(o=>!o.material.emissive?.getHex());const reducedPose=structural.map(o=>o.matrixWorld.elements.slice());
 model.update(9,true);model.root.updateMatrixWorld(true);
 assert.deepEqual(structural.map(o=>o.matrixWorld.elements.slice()),reducedPose,'Reduced motion preserves the object pose');
 const geometry=new Set(meshes.map(m=>m.geometry)),materials=new Set(meshes.map(m=>m.material));geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
}
console.log('PASS: four physical skill models, finite geometry, bounded motion and reduced-motion poses.');
