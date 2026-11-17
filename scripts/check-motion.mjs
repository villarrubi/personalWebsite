import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {heroEffects,pointerInfluence,signalValue} from '../public/hero-effects.js';

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

// The preview modes are distinct and react locally without unbounded amplitudes.
assert.deepEqual(heroEffects,['signals','code','pixels']);
assert.equal(pointerInfluence(100,100,{active:false,x:100,y:100}),0);
assert.equal(pointerInfluence(100,100,{active:true,x:100,y:100}),1);
assert.equal(pointerInfluence(500,500,{active:true,x:100,y:100}),0);
assert.equal(pointerInfluence(100,100,{active:true,x:100,y:100,strength:.5}),.5);
for(const time of [0,1,100,1000])for(const u of [0,.1,.5,1])for(const channel of [0,1,2])for(const influence of [0,.5,1]){
 const value=signalValue(u,time,channel,influence);
 assert(Number.isFinite(value)&&Math.abs(value)<=1.71);
}
assert.notEqual(signalValue(.1,0,0),signalValue(.1,0,1),'Analog and digital traces are different');
assert(Math.abs(signalValue(.1,0,0,1))>Math.abs(signalValue(.1,0,0,0)),'Pointer interaction amplifies a nearby signal');
console.log('PASS: three background choices, bounded signals, and local pointer response.');

// Exercise the real picker handlers with a canvas recorder, including while paused.
const effectSource=(await readFile(new URL('../public/hero-effects.js',import.meta.url),'utf8')).replaceAll('export ','');
const calls=[];
const context2d=new Proxy({}, {get:(_,name)=>name==='measureText'?text=>({width:text.length*8}):name.startsWith('create')?()=>({addColorStop(){}}):(...args)=>calls.push([name,...args]),set:()=>true});
const effectButtons=heroEffects.map(effect=>({dataset:{heroEffect:effect},attrs:{},setAttribute(name,value){this.attrs[name]=value;},addEventListener(type,handler){this[type]=handler;}}));
const picker={hidden:true,querySelectorAll:()=>effectButtons};
const hero={querySelector:()=>picker,getBoundingClientRect:()=>({width:1000,height:500,left:0,top:0}),addEventListener(){}};
const canvas={getContext:()=>context2d,closest:()=>hero};
runInNewContext(effectSource,{
 document:{querySelector:()=>canvas,documentElement:{classList:{contains:()=>false}},hidden:false,addEventListener(){}},
 window:{},devicePixelRatio:1,MutationObserver:class{observe(){}},addEventListener(){},cancelAnimationFrame(){},
});
assert.equal(picker.hidden,false);
assert.equal(calls.filter(call=>call[0]==='fillText').length,3,'Signals render three channels by default');
calls.length=0;effectButtons[1].click();
assert.equal(calls.filter(call=>call[0]==='fillText').length,8,'Code selection renders the snippet field');
assert.equal(effectButtons[1].attrs['aria-pressed'],'true');
calls.length=0;effectButtons[2].click();
assert.equal(calls.filter(call=>call[0]==='fillText').length,0);
assert(calls.filter(call=>call[0]==='fillRect').length>100,'Pixel selection replaces code with a grid');
assert.equal(effectButtons.filter(button=>button.attrs['aria-pressed']==='true').length,1);
console.log('PASS: background picker switches all renderers immediately, including while motion is paused.');
