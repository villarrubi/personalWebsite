import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cardCover,canStackCards} from '../public/career-motion.js';

// Coverage is bounded, reversible, and increases as the next page rises.
for(const height of [176,260,420]){
 const values=[1000,600,400,250,100,0,-100].map(top=>cardCover(top,100,height));
 assert.equal(values[0],0);
 assert.equal(values.at(-1),1);
 assert(values.every((value,index)=>value>=0&&value<=1&&(!index||value>=values[index-1])));
}
assert.equal(cardCover(NaN,100,200),0);
assert.equal(cardCover(100,100,0),0);
const desktop={heights:Array(7).fill(176),top:98,gap:7,viewportHeight:800};
assert(canStackCards(desktop));
assert(canStackCards({...desktop,heights:Array(7).fill(280),top:84,gap:5,viewportHeight:640}));
for(const state of [{reducedMotion:true},{focused:true},{expanded:true},{viewportHeight:280},{heights:[176,900,176]}]){
 assert(!canStackCards({...desktop,...state}),'Unstack when motion, focus, disclosures, or available height require it');
}
for(const lang of ['es','en']){
 const html=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
 const section=html.split('<section id="career"')[1].split('</section>')[0];
 const rows=section.split('<li class="career-entry').slice(1);
 assert.deepEqual(rows.map(row=>row.match(/datetime="([^"]+)"/)[1]),['2018','2019','2021','2024','2025-04','2025-10','2026-07']);
 assert.equal((section.match(/class="career-page"/g)||[]).length,7);
 assert.equal((section.match(/<details /g)||[]).length,3);
 assert(!section.includes('inert')&&!section.includes('aria-hidden="true"><article'),'Content stays readable without enhancement');
}
console.log('PASS: reversible card coverage, short-screen/focus/motion fallbacks, and seven accessible chronological cards in both languages.');
