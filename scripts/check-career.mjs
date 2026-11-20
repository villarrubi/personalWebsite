import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {careerDestination,initCareer} from '../public/career-motion.js';

for(const [key,index,expected] of [['ArrowLeft',0,0],['ArrowRight',6,6],['ArrowLeft',4,3],['ArrowRight',2,3],['Home',4,0],['End',1,6],['Tab',1,null]]){
 assert.equal(careerDestination(key,index,7),expected);
}
for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 const section=html.split('<section id="career"')[1].split('</section>')[0];
 assert.deepEqual([...section.matchAll(/datetime="([^"]+)"/g)].map(m=>m[1]),['2018','2019','2021','2024','2025-04','2025-10','2026-07']);
 assert.equal((section.match(/role="tab"/g)||[]).length,7);
 assert.equal((section.match(/<details /g)||[]).length,3);
 assert.equal((section.match(/data-career-ui hidden/g)||[]).length,2);
 for(let i=0;i<7;i++)assert(section.includes(`aria-controls="career-panel-${i}"`));
 assert(!section.includes('career-preview')&&!section.includes('career-deck'),'No duplicated preview content or scroll-pinned deck');
 assert(!section.includes('class="career-entry" hidden'),'All content remains available without JavaScript');
}
function element(){
 const events=new Map(),attrs=new Map(),classes=new Set();
 return {events,attrs,hidden:false,inert:false,disabled:false,
  classList:{add:name=>classes.add(name),toggle:(name,on)=>on?classes.add(name):classes.delete(name)},
  setAttribute:(name,value)=>attrs.set(name,value),addEventListener:(name,fn)=>events.set(name,fn),
  focus(){document.activeElement=this;},contains(node){return node===this;},
 };
}
for(const reduced of [false,true])for(const motionOff of [false,true]){
 let animations=0,cancellations=0;
 const preference={matches:reduced,addEventListener(){}};
 globalThis.matchMedia=()=>preference;
 globalThis.location={search:motionOff?'?motion=off':''};
 globalThis.scrollTo=()=>{throw Error('Stage selection must never scroll the page');};
 const panels=Array.from({length:7},(_,i)=>({...element(),querySelector:()=>({textContent:String(2018+i)}),animate(){animations++;return {cancel(){cancellations++;}};}}));
 const tabs=panels.map((_,i)=>({...element(),id:'career-tab-'+i,offsetLeft:i*110,offsetWidth:110}));
 const rail={...element(),scrollLeft:0,clientWidth:330};
 const previous=element(),next=element(),counter=element(),timeline={...element(),children:panels},ui=[element(),element()];
 const section={...element(),querySelector:selector=>({'.career-timeline':timeline,'.career-steps':rail,'[data-career-prev]':previous,'[data-career-next]':next,'[data-career-counter]':counter})[selector],querySelectorAll:selector=>selector==='[data-career-step]'?tabs:ui};
 globalThis.document={documentElement:{lang:'es'},activeElement:null,dispatchEvent(){}};
 initCareer(section);
 function selected(index){
  assert.equal(panels.filter(p=>!p.hidden).length,1,'Exactly one stage is visible');
  assert.equal(panels.filter(p=>!p.inert).length,1,'Only one stage accepts interaction');
  assert(!panels[index].hidden);
  assert.equal(tabs.filter(t=>t.tabIndex===0).length,1,'Only the selected tab is in the tab order');
  assert.equal(tabs[index].attrs.get('aria-selected'),'true');
  assert.equal(panels[index].attrs.get('aria-labelledby'),tabs[index].id);
 }
 selected(0);assert(previous.disabled&&!next.disabled);
 tabs[5].events.get('click')();selected(5);
 assert(rail.scrollLeft>0,'Selected tabs stay visible in a narrow rail');
 next.events.get('click')();selected(6);assert(next.disabled);
 previous.events.get('click')();selected(5);
 document.activeElement=panels[5];
 tabs[2].events.get('click')();selected(2);
 assert.equal(document.activeElement,tabs[2],'Focus never remains in a hidden panel');
 for(const [key,target] of [['End',6],['Home',0],['ArrowRight',1],['ArrowLeft',0]]){
  let prevented=false;
  rail.events.get('keydown')({key,target:document.activeElement,preventDefault(){prevented=true;}});
  assert(prevented);selected(target);assert.equal(document.activeElement,tabs[target]);
 }
 for(const i of [6,1,5,0,3,2])tabs[i].events.get('click')();
 selected(2);
 if(reduced||motionOff)assert.equal(animations,0,'Motion preferences suppress transitions, not interaction');
 else assert(animations>0&&cancellations>0,'Rapid selection cancels obsolete transitions');
}
delete globalThis.document;
console.log('PASS: bilingual timeline, single visible panel, click/keyboard navigation, focus, boundaries, rapid selection, reduced motion and static content.');
