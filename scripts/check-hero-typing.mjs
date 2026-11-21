import assert from 'node:assert/strict';
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
