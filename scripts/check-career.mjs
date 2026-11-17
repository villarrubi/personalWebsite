import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {activeCardIndex,canStackCards} from '../public/career-motion.js';

// Only one index is selected at every threshold, in either scroll direction.
const offsets=[0,188,376,564,752,940,1128];
assert.deepEqual([-100,0,187,188,375,376,1128,2000].map(value=>activeCardIndex(offsets,value)),[0,0,0,1,1,2,6,6]);
assert.deepEqual([2000,1127,939,751,563,375,187,-100].map(value=>activeCardIndex(offsets,value)),[6,5,4,3,2,1,0,0]);
for(let progress=-50;progress<1500;progress++){
 const index=activeCardIndex(offsets,progress);
 assert(Number.isInteger(index)&&index>=0&&index<offsets.length);
}
assert.equal(activeCardIndex([],100),0);
assert.equal(activeCardIndex(offsets,NaN),0);
const desktop={heights:Array(7).fill(176),top:98,viewportHeight:800};
assert(canStackCards(desktop));
assert(canStackCards({...desktop,heights:Array(7).fill(280),top:84,viewportHeight:640}));
// Expanded content still shows one card if it fits; otherwise all text is readable.
assert(canStackCards({...desktop,heights:[176,176,440]}));
for(const state of [{reducedMotion:true},{viewportHeight:280},{heights:[176,900,176]}]){
 assert(!canStackCards({...desktop,...state}),'Fallback when movement or available height requires it');
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
console.log('PASS: single-card selection in both scroll directions and short-screen/motion fallbacks, and seven accessible chronological cards in both languages.');
