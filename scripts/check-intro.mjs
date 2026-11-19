import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {circuitPaths,circuitDetails} from '../public/intro-circuit.js';

const source=(await readFile(new URL('../public/intro.js',import.meta.url),'utf8')).replace("import {createCircuit} from './intro-circuit.js';",'');
function visit({search='',lang='es',reduced=false,home=true,hidden=false,canvas=true,renderFails=false,offscreen=false}={}){
 const classes=()=>{const values=new Set();return {add:(...names)=>names.forEach(n=>values.add(n)),remove:(...names)=>names.forEach(n=>values.delete(n)),contains:n=>values.has(n),toggle:(n,on)=>on?values.add(n):values.delete(n)};};
 const events=new Map(),windowEvents=new Map(),frames=new Map(),timers=new Map();
 let id=0,overlay=null,focus=null,ended=0,disposed=0;const renders=[];
 const element=()=>({style:{setProperty(name,value){this[name]=value;},removeProperty(name){delete this[name];}},dataset:{},classList:classes(),isConnected:true,inert:false,tagName:'MAIN',addEventListener(name,fn){this[name]=fn;},setAttribute(){},focus(){focus=this;},remove(){this.isConnected=false;}});
 const previous=element(),page=element(),alreadyInert=element(),name=element(),phrase=element();alreadyInert.inert=true;
 page.querySelector=selector=>selector==='.experience-name'?name:phrase;
 const root=element();root.lang=lang;root.classList.add('intro-pending');
 const body={children:[page,alreadyInert],style:{overflow:'auto'},append(el){overlay=el;}};
 const document={documentElement:root,body,activeElement:previous,hidden,
  querySelector:()=>home?page:null,querySelectorAll:()=>[],
  createElement(){const el=element(),parts=new Map(),lines=Array.from({length:3},element);el.querySelector=selector=>{if(!parts.has(selector))parts.set(selector,element());return parts.get(selector);};el.querySelectorAll=()=>lines;el.lines=lines;return el;},
  addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name),
  dispatchEvent:event=>{if(event.type==='intro:end')ended++;},
 };
 const window={addEventListener:(name,fn)=>windowEvents.set(name,fn),removeEventListener:name=>windowEvents.delete(name),cancelIntroBoot(){root.classList.remove('intro-pending');}};
 runInNewContext(source,{createCircuit:(_,targets)=>{assert.deepEqual(Array.from(targets),[name,phrase],'The renderer targets the existing hero nodes');return canvas?{render(time,reduced){if(offscreen)return false;if(renderFails)throw new Error('Canvas lost');renders.push({time,reduced});},dispose(){disposed++;}}:null;},document,window,location:{search},URLSearchParams,matchMedia:()=>({matches:reduced}),Event,scrollY:0,
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),
  setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key),
 });
 let time=0;
 return {document,page,alreadyInert,previous,root,body,events,windowEvents,frames,timers,renders,
  get disposed(){return disposed;},
  get overlay(){return overlay;},get focus(){return focus;},get ended(){return ended;},
  tick(ms=100){time+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));},
  visibility(value){document.hidden=value;events.get('visibilitychange')?.();},
  key(key,target){let prevented=false;events.get('keydown')?.({key,target,preventDefault(){prevented=true;}});return prevented;},
  scrollInput(type,overrides={}){const event={cancelable:true,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...overrides};windowEvents.get(type)?.(event);return event;},
  history(name){windowEvents.get(name)?.({persisted:true});},
 };
}
function released(v){
 assert(!v.overlay?.isConnected);assert(!v.root.classList.contains('intro-playing'));
 assert(!v.root.classList.contains('intro-pending'));assert.equal(v.body.style.overflow,'auto');
 assert(!v.page.inert);assert(v.alreadyInert.inert);assert.equal(v.frames.size,0);assert.equal(v.timers.size,0);
 assert.equal(v.events.size,0);assert.equal(v.focus,v.previous);
 assert(!v.windowEvents.has('wheel'));assert(!v.windowEvents.has('touchmove'));
 assert.equal(v.root.style['--intro-text'],undefined);assert.equal(v.root.style['--intro-rest'],undefined);
}
for(const lang of ['es','en']){
 const v=visit({lang});assert(v.overlay.innerHTML.includes(lang==='es'?'Saltar intro':'Skip intro'));
 assert(v.page.inert);assert.equal(v.body.style.overflow,'hidden');assert(v.key('Tab'));
 for(let i=0;i<19;i++)v.tick();assert.equal(v.overlay.dataset.phase,'form');
 for(let i=0;i<37;i++)v.tick();released(v);assert.equal(v.ended,1);assert.equal(v.disposed,1);
}
for(const action of ['skip','escape','watchdog']){
 const v=visit();
 if(action==='skip')v.overlay.querySelector('.intro-skip').click();
 if(action==='escape')v.key('Escape');
 if(action==='watchdog')[...v.timers.values()][0]();
 released(v);assert.equal(v.ended,1);
}
const paused=visit();paused.tick();paused.visibility(true);
assert.equal(paused.frames.size,0);assert.equal(paused.timers.size,0);
paused.tick(30000);paused.visibility(false);paused.tick();
assert.equal(paused.overlay.dataset.phase,'circuit','Hidden time must not consume the intro');
paused.key('Escape');released(paused);
const background=visit({hidden:true});assert.equal(background.timers.size,0);assert.equal(background.frames.size,0);
background.visibility(false);background.tick();assert.equal(background.overlay.dataset.phase,'circuit');background.key('Escape');released(background);
const history=visit();history.history('pagehide');released(history);history.history('pageshow');
assert(history.overlay.isConnected);history.key('Escape');released(history);
for(const search of ['?intro=off','?motion=off'])assert.equal(visit({search}).overlay,null);
assert.equal(visit({home:false}).overlay,null);
const entrance=visit({reduced:true});
for(let i=0;i<25;i++)entrance.tick();
assert(entrance.overlay.isConnected,'The complete entrance must not be replaced by a short fade');
assert(entrance.renders.every(frame=>!frame.reduced),'The circuit remains active when the site animation is enabled');
for(let i=0;i<25;i++)entrance.tick();released(entrance);

for(const options of [{canvas:false},{renderFails:true}]){
 const fallback=visit(options);for(let i=0;i<15;i++)fallback.tick();
 assert.equal(fallback.root.style['--intro-text'],'1','A restricted or lost canvas reveals the original hero text');
 fallback.key('Escape');released(fallback);
}

const continuous=visit();
assert(!/intro-signature|intro-name|intro-tagline|Alejandro|Villarrubia/.test(continuous.overlay.innerHTML),'The overlay contains no second heading or phrase');
for(let i=0;i<35;i++)continuous.tick();
assert.equal(continuous.root.style['--intro-text'],'1','The live heading finishes forming before the rest appears');
assert.equal(continuous.root.style['--intro-rest'],'0');
for(let i=0;i<10;i++){
 continuous.tick();assert.equal(continuous.root.style['--intro-text'],'1','The original heading never fades away during the page reveal');
}
assert(Number(continuous.root.style['--intro-rest'])>0);
continuous.key('Escape');released(continuous);
const anchored=visit({offscreen:true});anchored.tick();released(anchored);
const locked=visit();
for(const ticks of [1,23,22]){
 for(let i=0;i<ticks;i++)locked.tick();
 assert(locked.overlay.isConnected);
 assert(locked.scrollInput('wheel').defaultPrevented,'Wheel is blocked throughout the intro, including the final fade');
 assert(locked.scrollInput('touchmove',{touches:[{}]}).defaultPrevented,'Single-finger page gestures are blocked');
 for(const key of ['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '])assert(locked.key(key));
 assert(!locked.key(' ',locked.overlay.querySelector('.intro-skip')),'Space can still activate the skip button');
 assert(!locked.scrollInput('wheel',{ctrlKey:true}).defaultPrevented,'Trackpad zoom stays available');
 assert(!locked.scrollInput('touchmove',{touches:[{},{}]}).defaultPrevented,'Pinch zoom stays available');
}
locked.key('Escape');released(locked);
assert(!locked.scrollInput('wheel').defaultPrevented,'Scrolling is released immediately after skipping');
assert(!locked.scrollInput('touchmove',{touches:[{}]}).defaultPrevented);
assert(!locked.key('PageDown'));
for(const [width,height] of [[320,568],[390,844],[844,390],[1440,900]]){
 const targets=Array.from({length:96},(_,i)=>({x:width*(.15+.7*(i%12)/11),y:height*(.2+.3*Math.floor(i/12)/7)}));
 const paths=circuitPaths(width,height,targets);
 const details=circuitDetails(paths,width,height);
 assert.equal(details.length,96,'Each main trace has two secondary branches');
 assert(details.every(detail=>detail.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))));
 assert.equal(paths.length,48);
 assert(new Set(paths.map(p=>`${p.points.at(-1).x},${p.points.at(-1).y}`)).size>24,'Traces end at distributed letters, not a shared hub');
 for(const path of paths){
  assert(Number.isFinite(path.total)&&path.total>0);
  assert(path.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
  assert(targets.some(p=>p.x===path.points.at(-1).x&&p.y===path.points.at(-1).y));
 }
}
assert.deepEqual(circuitPaths(320,568,[]),[]);
console.log('PASS: circuit intro lifecycle, live heading continuity, distributed traces at four viewport sizes, anchored visits, canvas fallback, focus and full entrance with either OS motion preference.');
