import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {WordCycle} from '../public/hero-typing.js';
import {experienceHero} from '../src/hero.mjs';
import {homeContent} from '../src/home.mjs';

const words=['código y sensores.','IA local.','ajedrez ♟️.'];
const cycle=new WordCycle(words);
assert.equal(cycle.text,words[0],'A complete sentence is readable before animation starts');
for(let round=0;round<7;round++){
 const previous=cycle.index;
 assert.equal(cycle.phase,'hold');assert(cycle.delay>=2000,'Hold long enough to read');
 while(cycle.phase!=='gap'){
  const before=Array.from(cycle.text).length;cycle.step();
  assert.equal(Array.from(cycle.text).length,before-1,'Erase a single code point');
 }
 assert.equal(cycle.text,'');assert(cycle.delay>=200,'Keep a short gap between phrases');
 cycle.step();assert.equal(cycle.index,(previous+1)%words.length);
 while(cycle.phase!=='hold'){
  const before=Array.from(cycle.text).length;cycle.step();
  assert.equal(Array.from(cycle.text).length,before+1,'Write the next phrase progressively');
 }
 assert.equal(cycle.text,words[cycle.index]);
}
cycle.step();cycle.complete();assert.equal(cycle.text,words[cycle.index],'Pausing completes the current sentence');
assert.equal(cycle.phase,'hold');
for(const lang of ['es','en']){
 assert(!experienceHero(lang).includes("data-hero-typing"),"The opening only contains the centered tagline and links");
 const html=homeContent(lang).split('id="about"')[1].split('id="contact"')[0];
 assert.match(html,/class="typing-summary">[^<]+<\/p>/,'Assistive technology has an unchanging summary');
 assert.match(html,/class="typing-line" aria-hidden="true"/,'Letters are not announced on each update');
 assert.equal((html.match(/data-typing-phrase/g)||[]).length,4,'Every phrase is also a layout measurement');
 assert.match(html,/data-typing-toggle[^>]+ hidden>/,'The pause control is enhanced only with JavaScript');
 assert(!html.includes('aria-live'),'Typing must not interrupt a screen reader');
}
console.log('PASS: complete bilingual fallback, reading pauses, erase/write loop, pause completion and stable accessible summary.');

// Exercise the actual DOM controller from a clean entrance through About.
export function checkTypingController(source){
 function visit({reduced=false,search=''}={}){
  const events=new Map(),timers=new Map(),classes=new Set(),intro=new Set(['intro-pending']);
  const output={textContent:words[0]},button={hidden:true,dataset:{pause:'Pause text',resume:'Animate text'},setAttribute(name,value){this[name]=value;},addEventListener(name,fn){this[name]=fn;}};
  const root={querySelectorAll:()=>words.map(textContent=>({textContent})),querySelector:selector=>selector==='[data-typed-text]'?output:button,classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),toggle:(name,on)=>on?classes.add(name):classes.delete(name)}};
  const document={hidden:false,querySelector:()=>root,documentElement:{classList:{contains:name=>intro.has(name)}},addEventListener:(name,fn)=>events.set(name,fn)};
  let time=0,id=0,intersect;
  runInNewContext(source.replace('export class WordCycle','class WordCycle'),{
   document,window:{IntersectionObserver:true},IntersectionObserver:class{constructor(fn){intersect=fn;}observe(){}},
   location:{search},URLSearchParams,matchMedia:()=>({matches:reduced,addEventListener(){}}),performance:{now:()=>time},
   addEventListener:(name,fn)=>events.set(name,fn),setTimeout:(fn,delay)=>{timers.set(++id,{fn,due:time+delay});return id;},clearTimeout:key=>timers.delete(key),
  });
  return {output,button,timers,classes,document,events,intro,
   visible:value=>intersect([{isIntersecting:value}]),
   advance(ms){const until=time+ms;let steps=0;while(timers.size){const [key,timer]=[...timers].sort((a,b)=>a[1].due-b[1].due)[0];if(timer.due>until)break;assert(++steps<10000);time=timer.due;timers.delete(key);timer.fn();}time=until;},
  };
 }
 for(const reduced of [false,true]){
  const v=visit({reduced});
  assert(!v.button.hidden,'Pause remains available with either system preference');
  v.visible(true);v.advance(5000);
  assert.equal(v.output.textContent,words[0],'Do not type over the circuit entrance');
  v.visible(false);v.intro.clear();v.events.get('intro:end')();
  assert.equal(v.timers.size,0,'About waits until it enters the viewport');
  v.visible(true);v.advance(2500);
  assert.notEqual(v.output.textContent,words[0],'Typing starts when About becomes visible');
  v.advance(2000);assert.equal(v.output.textContent,words[1],'The next phrase is written in full');
  v.button.click();assert.equal(v.button['aria-label'],'Animate text');
  const paused=v.output.textContent;v.advance(10000);assert.equal(v.output.textContent,paused);
  v.visible(false);v.visible(true);assert.equal(v.timers.size,0,'Scrolling preserves an explicit pause');
  v.button.click();assert.equal(v.button['aria-label'],'Pause text');v.advance(2500);assert.notEqual(v.output.textContent,paused);
  v.document.hidden=true;v.events.get('visibilitychange')();assert.equal(v.timers.size,0);
  v.document.hidden=false;v.events.get('visibilitychange')();assert.equal(v.timers.size,1);
  v.events.get('pagehide')();assert.equal(v.timers.size,0);
  v.events.get('pageshow')();assert.equal(v.timers.size,1);
  v.visible(false);assert.equal(v.timers.size,0,'Offscreen text stops scheduling work');
  const off=visit({reduced,search:'?motion=off'});off.intro.clear();off.visible(true);off.advance(10000);
  assert.equal(off.output.textContent,words[0]);assert.equal(off.timers.size,0);assert(off.button.hidden);
 }
}
checkTypingController(await readFile(new URL('../public/hero-typing.js',import.meta.url),'utf8'));
console.log('PASS: typing after clean entrance and viewport entry with either OS preference, manual pause/resume, hidden tab, history and motion opt-out.');
