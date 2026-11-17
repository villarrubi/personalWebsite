import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {careerFrame,careerScrollStep,canUseViewer} from '../public/career-motion.js';

// Two adjacent pages overlap without a blank frame; one owns interaction.
assert.deepEqual([-1,0,.49,.5,1.49,1.5,6,100].map(value=>careerFrame(value,7).index),[0,0,0,1,1,2,6,6]);
assert.deepEqual([6,5.49,4.49,3.49,2.49,1.49,.49,0].map(value=>careerFrame(value,7).index),[6,5,4,3,2,1,0,0]);
for(let step=-100;step<=700;step++){
 const state=careerFrame(step/100,7);
 assert(Number.isInteger(state.index)&&state.index>=0&&state.index<7);
 assert(state.pages.length>=1&&state.pages.length<=2);
 assert(Math.abs(state.pages.reduce((sum,page)=>sum+page.opacity,0)-1)<1e-9,'No blank fade between stages');
 assert(state.pages.some(page=>page.index===state.index),'The active page remains visible');
 assert(state.pages.every(page=>page.index>=0&&page.index<7&&Math.abs(page.offset)<=96&&page.scale>=.955&&page.scale<=1));
 if(state.pages.length===2)assert.equal(state.pages[1].index,state.pages[0].index+1);
 assert(state.progress>=0&&state.progress<=1);
}
assert.equal(careerFrame(NaN,7).index,0);
assert.equal(careerFrame(4,1).index,0);
assert.equal(careerFrame(.2,7).pages.length,1,'Reading time before each transition');
assert.equal(careerFrame(.5,7).pages.length,2,'Outgoing and incoming cards overlap');
assert.equal(careerFrame(.8,7).pages.length,1,'Incoming card settles for reading');
for(const height of [320,600,900,1440])assert(careerScrollStep(height)>=460&&careerScrollStep(height)<=760);
assert(canUseViewer({height:520,availableHeight:700,reducedMotion:false}));
assert(canUseViewer({height:520,availableHeight:520,reducedMotion:false}));
assert(!canUseViewer({height:701,availableHeight:700,reducedMotion:false}));
assert(!canUseViewer({height:520,availableHeight:700,reducedMotion:true}));
for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 const section=html.split('<section id="career"')[1].split('</section>')[0];
 const rows=section.split('<li class="career-entry').slice(1);
 assert.deepEqual(rows.map(row=>row.match(/datetime="([^"]+)"/)[1]),['2018','2019','2021','2024','2025-04','2025-10','2026-07']);
 assert.equal((section.match(/class="career-page"/g)||[]).length,7);
 assert.equal((section.match(/<details /g)||[]).length,3);
 assert.equal((section.match(/data-career-step=/g)||[]).length,7);
 assert(section.includes('class="career-viewer"')&&section.includes('data-career-next-label'));
 assert(section.includes('class="career-controls" hidden'),'Controls do not appear without JavaScript');
 assert(!section.includes('inert')&&!section.includes('aria-hidden="true"><article'),'Content stays readable without enhancement');
}
console.log('PASS: overlapping reversible cards, reading pauses, slower scroll steps, responsive fallback, and seven bilingual navigation steps.');
