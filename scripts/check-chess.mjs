import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {basePath} from './deploy-paths.mjs';
import {runInNewContext} from 'node:vm';
import * as THREE from '../public/assets/vendor/three.module.js';
import {parseStauntonGeometry} from '../public/staunton-assets.js';
import {startingPosition} from '../public/chess-model.js';
import {introPose,INTRO_DURATION,cameraFrame} from '../public/chess-timeline.js';
import {PerspectiveCamera,Vector3} from '../public/assets/vendor/three.module.js';

assert.equal(startingPosition.length,32);
assert.equal(new Set(startingPosition.map(p=>`${p.file},${p.row}`)).size,32);
for(const side of ['white','black']){
  const army=startingPosition.filter(p=>p.side===side);
  assert.equal(army.length,16);
  for(const [type,count] of Object.entries({pawn:8,rook:2,knight:2,bishop:2,queen:1,king:1}))assert.equal(army.filter(p=>p.type===type).length,count);
  const queen=army.find(p=>p.type==='queen'),king=army.find(p=>p.type==='king');
  assert.equal(queen.file,3);assert.equal(king.file,4);
  assert.equal(queen.row,side==='white'?7:0);
}
assert.equal(INTRO_DURATION,8300);
assert.equal(introPose(0).pitch,introPose(400).pitch,'Hold the lateral view before moving');
assert(Math.abs(introPose(2200).pitch-.88)<1e-12,'Settle the camera before the code disperses');
assert.equal(introPose(2900).curtain,1);
assert.equal(introPose(0).appearance,0,'The board fades in without a first-frame flash');
assert.equal(introPose(1550).dissolve,0,'The camera has settled before any code front expands');
assert(introPose(2400).dissolve>0&&introPose(2400).dissolve<1,'Keep the transformation in progress longer than the old conversion');
assert(introPose(3200).dissolve<1,'The slower expansion is still travelling near the edges');
assert.equal(introPose(3500).dissolve,1,'Hold the fully reconstructed code chessboard');
assert.equal(introPose(3500).matrix,0,'The background waits until the code board is readable');
assert.equal(introPose(3500).assemble,0,'Keep the white code chessboard readable first');
assert.equal(introPose(3500).curtain,1,'Keep the page covered during the board transformation');
assert.equal(introPose(4900).matrix,1,'The whole background becomes code');
assert(introPose(4900).assemble>0,'The background and the page-shaped code overlap');
assert.equal(introPose(4900).reveal,0,'Form the page in code before exposing the HTML');
assert.equal(introPose(5800).reveal,0,'No separate wipe or early scene switch');
assert.equal(introPose(6200).assemble,1,'The destination is recognisable before cells resolve');
assert(introPose(6200).reveal>0,'The last phase turns the characters into the live page');
assert.equal(introPose(INTRO_DURATION).dissolve,1,'All code has vanished before removing the overlay');
assert.equal(introPose(INTRO_DURATION).dock,0,'Do not shrink the board into the page');
assert.equal(introPose(INTRO_DURATION).curtain,0);
assert.equal(introPose(INTRO_DURATION).reveal,1,'Resolve every cell before removing the overlay');
// Homepage visits respect reduced motion and explicit URL overrides.
const boot=await readFile(new URL('../public/intro-boot.js',import.meta.url),'utf8');
function entrancePending({persisted=false,session=false,hash='',search='',reduced=false,paused=false,enabled=false,storageBlocked=false,reload=false,history=false,hidden=false,pathname='/es/',script=boot,preloads=[],timers=[]}={}){
  const classes=new Set();
  runInNewContext(script,{
    location:{pathname,hash,search},URLSearchParams,
    performance:{getEntriesByType:()=>[{type:reload?'reload':history?'back_forward':'navigate'}]},Date,
    localStorage:{getItem:()=>{if(storageBlocked)throw new Error('Unavailable');return persisted?'1':null;}},
    sessionStorage:{getItem:key=>{if(storageBlocked)throw new Error('Unavailable');return key==='chess-opening-seen'?(session?'1':null):paused?'off':enabled?'on':null;}},
    matchMedia:()=>({matches:reduced}),
    document:{hidden,documentElement:{classList:{add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)}},
     createElement:()=>({}),head:{append:link=>preloads.push(link)},addEventListener(){},removeEventListener(){}},
    window:{},setTimeout:(callback,delay)=>{timers.push(delay);return 1;},clearTimeout(){},
  });
  return classes.has('intro-pending');
}
for(const options of [{},{persisted:true},{session:true,reload:true},{storageBlocked:true},{hash:'#projects'},{hash:'#contact',reload:true},{history:true},{reduced:true},{reduced:true,reload:true},{reduced:true,hash:'#about'},{paused:true},{hidden:true}])
  assert(entrancePending(options),`Every open and refresh covers the page for the entrance: ${JSON.stringify(options)}`);
{
  const preloads=[],timers=[];
  assert(entrancePending({preloads,timers}),'A fresh visit covers the page');
  assert.equal(preloads.length,0,'The code entrance needs no 3D assets or extra preloads');
  assert.deepEqual(timers,[12000],'The curtain fails open after 12 visible seconds');
  const hiddenTimers=[];
  assert(entrancePending({hidden:true,timers:hiddenTimers}),'A background tab keeps the curtain for when it is shown');
  assert.equal(hiddenTimers.length,0,'Hidden time does not use up the curtain budget');
}
const deployedBoot=await readFile(new URL('../dist/intro-boot.js',import.meta.url),'utf8');
for(const [script,prefix] of [[boot,''],[deployedBoot,basePath?`/${basePath}`:'']]){
 for(const route of ['/','/en/','/es/','/index.html','/en/index.html','/es/index.html']){
  const entry={script,pathname:prefix+route};
  for(const extra of [{},{reload:true},{history:true},{reduced:true},{hash:'#top'},{hash:'#projects'},{reduced:true,hash:'#projects',reload:true}])
   assert(entrancePending({...entry,...extra}),`The opening plays on ${route} ${JSON.stringify(extra)}`);
  assert(!entrancePending({...entry,search:'?motion=off'}),'Explicit motion opt-out skips the curtain');
  assert(!entrancePending({...entry,search:'?intro=off'}),'Explicit intro opt-out skips the curtain');
 }
 assert(!entrancePending({script,pathname:`${prefix}/es/projects/chessbot/`}),'Detail pages never show the entrance curtain');
}
// Validate the actual imported assets against the camera's framing envelope.
const packed=await readFile(new URL('../public/assets/chess/staunton.bin',import.meta.url));
const geometries=parseStauntonGeometry(THREE,packed.buffer.slice(packed.byteOffset,packed.byteOffset+packed.byteLength));
for(const [name,geometry] of Object.entries(geometries)){
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox;
  assert(bounds.min.y>=-.001&&bounds.max.y+.225<1.85,`${name} fits vertically`);
  assert(bounds.min.x>=-.4&&bounds.max.x<=.4&&bounds.min.z>=-.4&&bounds.max.z<=.4,`${name} fits its square`);
  assert(geometry.index.array.every(index=>index<geometry.attributes.position.count),`${name} has valid indices`);
  assert(geometry.attributes.position.array.every(Number.isFinite),`${name} has finite positions`);
  geometry.dispose();
}
for(const lang of ['es','en']){
  const built=await readFile(new URL(`../dist/${lang}/index.html`,import.meta.url),'utf8');
  const html=basePath?built.replaceAll(`/${basePath}/`,'/'):built;
  assert(!html.includes('personal-opening')&&!html.includes('data-chess-stage'),'The small biography chess block is removed');
  assert(!html.includes('staunton-poster.webp'),'The removed biography image is not loaded');
  assert(!html.includes('experience-footer')&&!html.includes('data-intro='),'The hero no longer shows the scroll cue or the replay button');
  assert(!/class="button primary" href="#projects"/.test(html),'The hero no longer shows the explore button');
  assert(!html.includes('chess-fallback'),'Never flash Unicode pieces during navigation');
}
for(const aspect of [320/844,390/844,768/1024,1440/900,2560/1080]){
  const camera=new PerspectiveCamera(32,aspect,.1,150);
  let previous=introPose(0);
  for(let time=0;time<=INTRO_DURATION;time+=16){
    const pose=introPose(time),frame=cameraFrame(pose.pitch,pose.yaw,aspect);
    assert(pose.pitch>=previous.pitch&&pose.dissolve>=previous.dissolve&&pose.assemble>=previous.assemble&&pose.reveal>=previous.reveal,'Camera and transformation progress never reverse');
    assert(Math.abs(pose.pitch-previous.pitch)<.025,'No jumps between frames');
    camera.position.set(...frame.position);camera.up.set(...frame.up);camera.lookAt(...frame.target);camera.updateMatrixWorld();
    for(const x of [-4.45,4.45])for(const y of [-.14,1.85])for(const z of [-4.45,4.45]){
      const p=new Vector3(x,y,z).project(camera);
      assert(Math.abs(p.x)<.9&&Math.abs(p.y)<.87,`Entire set remains framed at ${aspect}, ${time}ms`);
    }
    previous=pose;
  }
}
console.log('PASS: 32 pieces, six valid Staunton meshes, correct starting position, continuous camera at five aspect ratios, and intro controls without the biography chess block in both languages.');
