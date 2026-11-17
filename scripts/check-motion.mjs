import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {metalLight} from '../public/hero-metal.js';

const source=(await readFile(new URL('../public/scene-motion.js',import.meta.url),'utf8'))
 .replace('export const sceneMotion=', 'const sceneMotion=globalThis.motion=');
function visit({reduced=false,saved='off',search=''}={}){
 const preference=new EventTarget();preference.matches=reduced;
 const listeners=new Map(),context={
  location:{search},URLSearchParams,EventTarget,Event,
  matchMedia:()=>preference,
  sessionStorage:{getItem:()=>saved,setItem(){}},
  window:{addEventListener:(type,listener)=>listeners.set(type,listener)},
 };
 runInNewContext(source,context);
 return {motion:context.motion,restore:()=>listeners.get('pageshow')?.({persisted:true}),changePreference:value=>{preference.matches=value;preference.dispatchEvent(new Event('change'));}};
}
for(const reduced of [false,true])for(const saved of [null,'on','off']){
 const {motion,restore,changePreference}=visit({reduced,saved});
 assert.equal(motion.matches,false,'Project motion always starts on, whatever the OS or an old saved choice says');
 let changes=0;motion.addEventListener('change',()=>changes++);
 motion.setEnabled(false);
 assert.equal(motion.matches,true,'Visitors can pause the current page');
 motion.setEnabled(true);
 assert.equal(motion.matches,false,'Visitors can resume the current page');
 assert.equal(changes,2,'Controls and renderer are notified of both changes');
 changePreference(!reduced);
 assert.equal(motion.matches,false,'Changing the OS preference does not stop the projects');
 motion.setEnabled(false);restore();
 assert.equal(motion.matches,false,'Returning from history starts moving again');
}
const optOut=visit({search:'?motion=off'});
assert.equal(optOut.motion.matches,true,'An explicit URL opt-out remains available');
optOut.motion.setEnabled(true);optOut.restore();
assert.equal(optOut.motion.matches,true,'Restoring an explicit opt-out preserves that URL');
assert.equal(visit({reduced:true,search:'?motion=on'}).motion.matches,false,'motion=on still works');
console.log('PASS: project motion on by default for every visit, reload, history return and OS preference; manual pause and ?motion=off.');

// Decorative backgrounds have an independent, accessible pause control.
const ambientSource=await readFile(new URL('../public/ambient-motion.js',import.meta.url),'utf8');
function ambientVisit({reduced=false,search=''}={}){
 const classes=new Set(),events=new Map(),preference=new EventTarget();preference.matches=reduced;
 const control={dataset:{pause:'Pause background',resume:'Animate background'},addEventListener:(_,fn)=>{control.click=fn;}};
 const root={classList:{toggle:(name,on)=>on?classes.add(name):classes.delete(name)}};
 const doc={documentElement:root,hidden:false,querySelectorAll:()=>[{classList:{add(){}}}],querySelector:()=>control,addEventListener:(name,fn)=>events.set(name,fn)};
 runInNewContext(ambientSource,{document:doc,window:{},location:{search},URLSearchParams,matchMedia:()=>preference,addEventListener:(name,fn)=>events.set(name,fn)});
 return {classes,control,preference,doc,events};
}
const ambient=ambientVisit();
assert(ambient.classes.has('ambient-enabled'));
ambient.control.click();assert(!ambient.classes.has('ambient-enabled'));assert.equal(ambient.control.textContent,'Animate background');
ambient.control.click();assert(ambient.classes.has('ambient-enabled'));
ambient.doc.hidden=true;ambient.events.get('visibilitychange')();assert(!ambient.classes.has('ambient-enabled'));
ambient.doc.hidden=false;ambient.events.get('visibilitychange')();assert(ambient.classes.has('ambient-enabled'));
ambient.preference.matches=true;ambient.preference.dispatchEvent(new Event('change'));
assert(!ambient.classes.has('ambient-enabled'));assert(ambient.control.hidden);
assert(!ambientVisit({reduced:true}).classes.has('ambient-enabled'));
assert(!ambientVisit({search:'?motion=off'}).classes.has('ambient-enabled'));
console.log('PASS: background pause/resume, hidden-tab suspension, reduced motion, and explicit motion opt-out.');

// Reflections follow the pointer while ambient drift stays inside safe bounds.
for(const time of [0,1,30,1000])for(const x of [-100,-1,0,1,100,NaN])for(const y of [-100,-1,0,1,100,NaN]){
 const light=metalLight(x,y,time);
 assert(Number.isFinite(light.x)&&Number.isFinite(light.y));
 assert(Math.abs(light.x)<=.98&&Math.abs(light.y)<=.74);
}
const left=metalLight(-1,0,0),right=metalLight(1,0,0);
assert(right.x-left.x>1.6,'Moving across the hero sweeps the reflected light across the metal');
assert(metalLight(0,-1,0).y>metalLight(0,1,0).y,'Screen Y maps to the shader lighting axis');
assert.deepEqual(metalLight(100,100,0),metalLight(1,1,0),'Out-of-bounds pointers cannot overshoot');
assert.notDeepEqual(metalLight(0,0,0),metalLight(0,0,5),'Reflections also drift without pointer input');
console.log('PASS: metal reflections follow the pointer, drift over time, and remain bounded.');
