import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initSkills} from '../public/skills.js';

for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 assert.equal((html.match(/data-skill="/g)||[]).length,4);
 for(const id of ['software','ai','hardware','interfaces']){
  assert(html.includes(`aria-controls="skill-panel-${id}"`));
  assert(html.includes(`id="skill-panel-${id}" style=`),'All descriptions are available before JS enhancement');
 }
 for(const tag of ['Python','C++','Java','C#','TypeScript','Canvas 2D','Ollama','ESP32-S3','LiDAR'])assert(html.includes(`<li>${tag}</li>`));
}
for(const reduced of [true,false])for(const off of [true,false]){
 let animationCount=0,cancelled=0,observe;
 const media={matches:reduced,addEventListener(_,fn){this.change=fn;}};
 globalThis.matchMedia=()=>media;globalThis.location={search:off?'?motion=off':''};
 globalThis.IntersectionObserver=class{constructor(fn){observe=fn;}observe(){}disconnect(){}};
 const element=()=>({hidden:false,attrs:{},events:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,v){this.events[k]=v;},animate(){animationCount++;return {cancel(){cancelled++;}};}});
 const choices=Array.from({length:4},element),panels=Array.from({length:4},element),selector=element();
 let focused=-1;
 choices.forEach((choice,index)=>choice.focus=options=>{assert.equal(options?.preventScroll,true,'Keyboard selection must not scroll the page');focused=index;choice.events.focus();});
 const root={...element(),classList:{add(){},toggle(){}},querySelector:()=>selector,querySelectorAll:s=>s==='[data-skill]'?choices:s==='.skill-insight'?panels:[selector]};
 initSkills(root);
 assert(!panels[0].hidden);assert.equal(panels.filter(panel=>!panel.hidden).length,1,'A complete first discipline is visible immediately');
 observe([{isIntersecting:true}]);const entered=animationCount;
 observe([{isIntersecting:true}]);assert.equal(animationCount,entered,'The entrance runs once');
 choices[1].events.pointerenter({pointerType:'touch'});assert(!panels[0].hidden,'Touch does not select before tapping');
 choices[1].events.pointerenter({pointerType:'mouse'});assert(!panels[1].hidden);
 assert.equal(panels.filter(panel=>!panel.hidden).length,1);
 const repeated=animationCount;
 choices[1].events.click();assert.equal(animationCount,repeated,'Hover then click does not restart the information');
 choices[3].events.click();assert(!panels[3].hidden);
 choices[3].events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(focused,0);assert(!panels[0].hidden);
 choices[0].events.keydown({key:'End',preventDefault(){}});assert.equal(focused,3);
 root.events.keydown({key:'Escape'});assert(!panels[0].hidden);assert.equal(panels.filter(panel=>!panel.hidden).length,1,'A complete first discipline is visible immediately');
 assert.equal(choices[0].attrs['aria-expanded'],'true');assert(choices.slice(1).every(choice=>choice.attrs['aria-expanded']==='false'));
 if(reduced||off)assert.equal(animationCount,0,'Motion opt-outs preserve interaction without animation');
 else assert(animationCount>0&&cancelled>0,'Switching rapidly cancels obsolete animation');
 media.matches=true;media.change();const before=animationCount;
 choices[2].events.click();assert.equal(animationCount,before);assert(!panels[2].hidden);
}
delete globalThis.IntersectionObserver;
console.log('PASS: bilingual skill workbench, static fallback, hover/tap/focus, keyboard wrap, Escape, rapid changes and live reduced-motion preference.');
