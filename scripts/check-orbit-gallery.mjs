import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {publishedProjects} from '../src/content.mjs';
import {OrbitCarousel,carouselLayout,orbitCapacity,orbitDrift,wrapIndex,ORBIT_INTERVAL,ORBIT_TURN_DURATION} from '../public/solar-carousel.js';

for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 assert(html.includes('solar-system orbit-gallery orbit-carousel'));
 assert.deepEqual([...html.matchAll(/id="project-preview-([^"]+)"/g)].map(m=>m[1]).sort(),publishedProjects.map(p=>p.id).sort());
 for(const project of publishedProjects){
  const preview=html.split(`id="project-preview-${project.id}">`)[1].split('</template>')[0];
  assert(preview.includes(`/projects/${project.id}/`));assert(preview.includes('solar-preview-summary'));
 }
 assert(html.includes('class="solar-carousel-controls" hidden'),'Controls are enhanced only with JS');
 for(const direction of [-1,1])assert(html.includes(`data-carousel-step="${direction}" aria-label="`));
 assert(!html.includes('data-preview-step'));
 assert(!html.includes('data-map-group='),'There are no catalog filters');
}

assert.equal(ORBIT_INTERVAL,3500);assert.equal(ORBIT_TURN_DURATION,900);
const carousel=new OrbitCarousel(6);
carousel.tick(3499,{auto:true});assert.equal(carousel.position,0);assert(!carousel.moving);
carousel.tick(1,{auto:true});assert(carousel.moving);assert.equal(carousel.target,1);
carousel.tick(450,{auto:true});assert.equal(carousel.position,.5);
carousel.tick(450,{auto:true});assert.equal(carousel.position,1);assert(!carousel.moving);
carousel.tick(2600,{auto:true});assert.equal(carousel.target,2,'Turns begin every 3.5 seconds');
carousel.tick(300);const intermediate=carousel.position;
carousel.step(-1);assert.equal(carousel.position,intermediate,'Reversing a turn cannot jump');
carousel.tick(900);assert.equal(carousel.position,1);
carousel.select(5,false);assert.equal(carousel.index,5);const last=carousel.position;
carousel.step(1);assert.equal(carousel.target,last+1,'Last to first keeps the same direction');
carousel.tick(900);assert.equal(carousel.index,0);
carousel.step(-1);carousel.tick(900);assert.equal(carousel.index,5);
carousel.select(0,false);carousel.tick(3000,{auto:true});carousel.step(1,false);
carousel.tick(3499,{auto:true,animate:false});assert.equal(carousel.index,1,'Manual navigation restarts the timer');
carousel.tick(1,{auto:true,animate:false});assert.equal(carousel.index,2);
carousel.tick(3000,{auto:true});carousel.tick(100,{auto:false});
carousel.tick(1000,{auto:true});assert.equal(carousel.index,2,'Resume does not inherit an expired timer');
for(const count of [0,1]){const c=new OrbitCarousel(count);c.step(1);c.tick(10000,{auto:true});assert.equal(c.position,0);assert(!c.moving);}

for(const count of [1,2,3,6,7,13,20,100])for(const [width,height] of [[294,465],[366,465],[752,510],[1267,490]]){
 const items=Array.from({length:count},(_,i)=>({id:String(i)}));
 for(let position=0;position<count;position++){
  const layout=carouselLayout(items,width,height,position),front=layout[position],visible=layout.filter(p=>p.visible);
  assert.equal(front.x,width/2);assert.equal(front.foreground,1);
  assert.equal(visible.length,Math.min(count,orbitCapacity(width)));
  for(const p of visible){
   assert(p.x-p.size/2>=0&&p.x+p.size/2<=width,'Bodies stay in horizontal bounds');
   assert(p.bodyY-p.size/2>=0&&p.y+p.height/2<=height,'Bodies and labels fit in the stage');
   if(p!==front){assert(front.size>p.size*2.5,'A single project dominates the foreground');assert(front.depth>p.depth);}
  }
 }
 for(let step=0;step<40;step++){
  const layout=carouselLayout(items,width,height,step/40);
  for(const p of layout.filter(p=>p.visible))assert(Number.isFinite(p.x)&&Number.isFinite(p.size)&&p.opacity>=0&&p.opacity<=1);
 }
 const a=carouselLayout(items,width,height,-.01),b=carouselLayout(items,width,height,count-.01);
 a.forEach((p,i)=>assert(Math.abs(p.x-b[i].x)<1e-8&&Math.abs(p.size-b[i].size)<1e-8,'Wraparound positions are continuous'));
}

// Execute the controller with deterministic frames and minimal browser surfaces.
const controller=(await readFile(new URL('../public/solar-system.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
const focusSource=(await readFile(new URL('../public/solar-focus.js',import.meta.url),'utf8')).replace('export ','');
function visit({paused=false,reduced=false}={}){
 const element=(dataset={})=>{
  const classes=new Set(),events=new Map();
  return {dataset,events,hidden:false,style:{setProperty(){}},setAttribute(name,value){this[name]=value;},classList:{contains:n=>classes.has(n),add:n=>classes.add(n),remove:n=>classes.delete(n),toggle(n,on){on?classes.add(n):classes.delete(n);}},
   addEventListener(name,fn){events.set(name,fn);},dispatchEvent(event){events.get(event.type)?.(event);},querySelector(){},querySelectorAll(){return [];}};
 };
 const nodes=Array.from({length:6},(_,i)=>element({project:`project-${i}`,name:`Project ${i}`,accent:'#abcdef'}));
 const sideNodes=[element({project:'side',name:'Side',accent:'#abcdef'})];
 const controls=[-1,1].map(carouselStep=>element({carouselStep}));
 const motion=new EventTarget();motion.matches=paused;motion.setEnabled=value=>{motion.matches=!value;motion.dispatchEvent(new Event('change'));};
 const preference=new EventTarget();preference.matches=reduced;
 let rendered=null,animations=0,observer,visibility;
 const body={replaceChildren(value){rendered=value??null;},animate(){animations++;return {cancel(){}};}};
 const counter={},status={},controlBox={hidden:true},motionButton=element(),space={clientWidth:1100,clientHeight:490,getBoundingClientRect:()=>({width:1100,height:490,left:0,top:0})};
 motionButton.querySelector=()=>({});
 const root=element({cinematic:'fallback'});
 const selectors={'.solar-space':space,'.solar-status':status,'.solar-preview-body':body,'.solar-carousel-count':counter,'.solar-carousel-controls':controlBox,'.space-motion-toggle':motionButton};
 root.querySelector=s=>selectors[s];root.querySelectorAll=s=>s==='[data-carousel-step]'?controls:[...nodes,...sideNodes];
 root.contains=node=>[...nodes,...sideNodes,body].includes(node);
 const doc=element();doc.documentElement=element();doc.documentElement.lang='en';doc.hidden=false;doc.querySelector=()=>root;doc.activeElement=null;
 doc.getElementById=id=>({content:{cloneNode:()=>id}});
 let id=0,now=0;const frames=new Map();
 const io=class{constructor(fn){visibility=fn;}observe(){}};
 const context={sceneMotion:motion,OrbitCarousel,carouselLayout,wrapIndex,document:doc,location:{hash:''},matchMedia:()=>preference,Event,queueMicrotask,
  window:{IntersectionObserver:io,addEventListener(){}},IntersectionObserver:io,
  MutationObserver:class{constructor(fn){observer=fn;}observe(){}},
  requestAnimationFrame(fn){frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
 runInNewContext(focusSource+'\n'+controller,context);
 function advance(ms){for(let elapsed=0;elapsed<ms;elapsed+=50){now+=Math.min(50,ms-elapsed);const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(now));}}
 function click(element){const event={button:0,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}};element.events.get('click')(event);return event;}
 function show(value=true){visibility([{isIntersecting:value}]);}
 return {root,nodes,sideNodes,controls,motion,doc,status,counter,controlBox,advance,click,show,mutate:()=>observer(),get rendered(){return rendered;},get animations(){return animations;}};
}
const v=visit();assert.equal(v.counter.textContent,'01 / 07');assert(!v.controlBox.hidden);assert.equal(v.root.dataset.focusProject,'project-0');
v.advance(6000);assert.equal(v.root.dataset.focusProject,'project-0','Offscreen scenes do not rotate');
v.show();v.advance(4500);assert.equal(v.root.dataset.focusProject,'project-1');
v.click(v.controls[1]);assert(v.status.textContent.startsWith('Project 2'));v.advance(1000);
assert.equal(v.root.dataset.focusProject,'project-2');assert.equal(v.counter.textContent,'03 / 07');
assert.equal(v.rendered,'project-preview-project-2');
assert.equal(v.nodes.filter(n=>n.classList.contains('is-featured')).length,1);
assert(v.click(v.nodes[4]).defaultPrevented,'Clicking a rear project selects it before opening');v.advance(1000);
assert.equal(v.root.dataset.focusProject,'project-4');assert(!v.click(v.nodes[4]).defaultPrevented,'Foreground click reaches the dialog');
v.doc.documentElement.classList.add('project-dialog-open');v.mutate();v.advance(8000);
assert.equal(v.root.dataset.focusProject,'project-4','Open dialogs suspend automatic navigation');
v.doc.documentElement.classList.remove('project-dialog-open');v.mutate();v.advance(4500);assert.equal(v.root.dataset.focusProject,'project-5');
v.doc.hidden=true;v.doc.dispatchEvent(new Event('visibilitychange'));v.advance(8000);assert.equal(v.root.dataset.focusProject,'project-5');
v.doc.hidden=false;v.doc.dispatchEvent(new Event('visibilitychange'));
v.doc.activeElement={closest:()=>v.nodes[5]};v.root.dispatchEvent(new Event('focusin'));v.advance(8000);assert.equal(v.root.dataset.focusProject,'project-5','Keyboard focus pauses the orbit');
v.doc.activeElement=null;v.root.dispatchEvent(new Event('focusin'));v.advance(4500);assert.equal(v.root.dataset.focusProject,'side');
assert(!v.controls.some(b=>b.disabled),'All catalog entries remain reachable');
v.click(v.controls[1]);v.advance(1000);assert.equal(v.counter.textContent,'01 / 07');v.click(v.sideNodes[0]);v.advance(1000);assert.equal(v.counter.textContent,'07 / 07');v.click(v.controls[1]);v.advance(1000);assert.equal(v.root.dataset.focusProject,'project-0','All-project navigation wraps across both groups');
for(const options of [{paused:true},{reduced:true}]){
 const calm=visit(options);calm.show();calm.click(calm.controls[1]);
 assert.equal(calm.root.dataset.focusProject,'project-1','Manual navigation works without animation');assert.equal(calm.animations,0);
 if(options.paused){calm.advance(8000);assert.equal(calm.root.dataset.focusProject,'project-1');}
}
console.log('PASS: orbital timing, reversible turns, wraparound, single foreground, responsive bounds, bilingual previews, arrows, background selection, modal/visibility/focus pauses and reduced-motion controls.');

const allProjects=publishedProjects.map(p=>({id:p.id}));
for(const width of [1040,1126,1267,1600]){
 const layout=carouselLayout(allProjects,width,490,0);
 assert.equal(layout.filter(p=>p.visible).length,13,'All thirteen projects fit on a wide orbit');
 for(let i=0;i<layout.length;i++)for(let j=i+1;j<layout.length;j++)
  assert(Math.hypot(layout[i].x-layout[j].x,layout[i].bodyY-layout[j].bodyY)>(layout[i].size+layout[j].size)*.42,'Resting models remain separated');
}
for(let time=0;time<60;time+=.25){
 const drift=orbitDrift('chessbot',time,{x:.5,y:-.5},1);
 assert(Math.abs(drift.x)<=12&&Math.abs(drift.y)<=11&&Math.abs(drift.roll)<=1.4,'Ambient motion stays subtle and bounded');
}
const floating=visit();floating.show();floating.advance(100);
const firstPose=floating.root._orbitFrame.items[0].layout;
floating.advance(900);const secondPose=floating.root._orbitFrame.items[0].layout;
assert.equal(floating.root.dataset.focusProject,'project-0');assert.notEqual(firstPose.y,secondPose.y,'Projects float between carousel turns');
floating.motion.setEnabled(false);const frozen=floating.root._orbitFrame;
floating.advance(5000);assert.equal(floating.root._orbitFrame,frozen,'Pausing freezes ambient motion too');
const calm=visit({reduced:true});calm.show();calm.advance(1000);
assert.equal(calm.root._orbitFrame.items[0].layout.roll,0,'Reduced motion disables ambient tilt');
console.log('PASS: full-catalog view, capacity by viewport, separated models, cross-group navigation, subtle floating and paused/reduced-motion poses.');
