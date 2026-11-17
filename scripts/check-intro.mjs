import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const source=await readFile(new URL('../public/intro.js',import.meta.url),'utf8');
function visit({search='',lang='es',reduced=false,home=true,hidden=false}={}){
 const classes=()=>{const values=new Set();return {add:(...names)=>names.forEach(n=>values.add(n)),remove:(...names)=>names.forEach(n=>values.delete(n)),contains:n=>values.has(n),toggle:(n,on)=>on?values.add(n):values.delete(n)};};
 const events=new Map(),windowEvents=new Map(),frames=new Map(),timers=new Map();
 let id=0,overlay=null,focus=null,ended=0;
 const element=()=>({style:{},dataset:{},classList:classes(),isConnected:true,inert:false,tagName:'MAIN',addEventListener(name,fn){this[name]=fn;},setAttribute(){},focus(){focus=this;},remove(){this.isConnected=false;}});
 const previous=element(),page=element(),alreadyInert=element();alreadyInert.inert=true;
 const root=element();root.lang=lang;root.classList.add('intro-pending');
 const body={children:[page,alreadyInert],style:{overflow:'auto'},append(el){overlay=el;}};
 const document={documentElement:root,body,activeElement:previous,hidden,
  querySelector:()=>home?page:null,querySelectorAll:()=>[],
  createElement(){const el=element(),parts=new Map(),lines=Array.from({length:3},element);el.querySelector=selector=>{if(!parts.has(selector))parts.set(selector,element());return parts.get(selector);};el.querySelectorAll=()=>lines;el.lines=lines;return el;},
  addEventListener:(name,fn)=>events.set(name,fn),removeEventListener:name=>events.delete(name),
  dispatchEvent:event=>{if(event.type==='intro:end')ended++;},
 };
 const window={addEventListener:(name,fn)=>windowEvents.set(name,fn),cancelIntroBoot(){root.classList.remove('intro-pending');}};
 runInNewContext(source,{document,window,location:{search},URLSearchParams,matchMedia:()=>({matches:reduced}),Event,scrollY:0,
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:key=>frames.delete(key),
  setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:key=>timers.delete(key),
 });
 let time=0;
 return {document,page,alreadyInert,previous,root,body,events,frames,timers,
  get overlay(){return overlay;},get focus(){return focus;},get ended(){return ended;},
  tick(ms=100){time+=ms;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));},
  visibility(value){document.hidden=value;events.get('visibilitychange')?.();},
  key(key){let prevented=false;events.get('keydown')?.({key,preventDefault(){prevented=true;}});return prevented;},
  history(name){windowEvents.get(name)?.({persisted:true});},
 };
}
function released(v){
 assert(!v.overlay?.isConnected);assert(!v.root.classList.contains('intro-playing'));
 assert(!v.root.classList.contains('intro-pending'));assert.equal(v.body.style.overflow,'auto');
 assert(!v.page.inert);assert(v.alreadyInert.inert);assert.equal(v.frames.size,0);assert.equal(v.timers.size,0);
 assert.equal(v.events.size,0);assert.equal(v.focus,v.previous);
}
for(const lang of ['es','en']){
 const v=visit({lang});assert(v.overlay.innerHTML.includes(lang==='es'?'Saltar intro':'Skip intro'));
 assert(v.page.inert);assert.equal(v.body.style.overflow,'hidden');assert(v.key('Tab'));
 for(let i=0;i<16;i++)v.tick();assert(v.overlay.lines[2].textContent.includes('build'));
 for(let i=0;i<35;i++)v.tick();released(v);assert.equal(v.ended,1);
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
assert.equal(paused.overlay.dataset.phase,'code','Hidden time must not consume the intro');
paused.key('Escape');released(paused);
const background=visit({hidden:true});assert.equal(background.timers.size,0);assert.equal(background.frames.size,0);
background.visibility(false);background.tick();assert.equal(background.overlay.dataset.phase,'code');background.key('Escape');released(background);
const history=visit();history.history('pagehide');released(history);history.history('pageshow');
assert(history.overlay.isConnected);history.key('Escape');released(history);
for(const search of ['?intro=off','?motion=off'])assert.equal(visit({search}).overlay,null);
assert.equal(visit({home:false}).overlay,null);
const calm=visit({reduced:true});calm.tick();
assert.equal(calm.overlay.lines[0].textContent,'const idea = curiosity();');
assert.equal(calm.overlay.querySelector('.intro-workspace').style.transform,'none');calm.key('Escape');released(calm);
console.log('PASS: code intro completion, skip, Escape, focus/inert restoration, watchdog, hidden tabs, history, URL opt-outs, reduced motion and both languages.');
