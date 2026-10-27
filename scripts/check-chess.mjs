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
// Every homepage visit and refresh can play the entrance, including browsers
// with old seen/pause flags and OS reduced motion. Explicit opt-outs still work.
const boot=await readFile(new URL('../public/intro-boot.js',import.meta.url),'utf8');
function entrancePending({persisted=false,session=false,hash='',search='',reduced=false,paused=false,enabled=false,storageBlocked=false,reload=false,pathname='/es/',script=boot}={}){
  const classes=new Set();
  runInNewContext(script,{
    location:{pathname,hash,search},URLSearchParams,
    performance:{getEntriesByType:()=>[{type:reload?'reload':'navigate'}]},
    localStorage:{getItem:()=>{if(storageBlocked)throw new Error('Unavailable');return persisted?'1':null;}},
    sessionStorage:{getItem:key=>{if(storageBlocked)throw new Error('Unavailable');return key==='chess-opening-seen'?(session?'1':null):paused?'off':enabled?'on':null;}},
    matchMedia:()=>({matches:reduced}),document:{documentElement:{classList:{add:name=>classes.add(name)}}},
    window:{},setTimeout:()=>1,
  });
  return classes.has('intro-pending');
}
assert(entrancePending(),'A first visit can show the entrance');
assert(entrancePending({persisted:true}),'An old persistent seen flag does not suppress the entrance');
assert(entrancePending({session:true,reload:true}),'Refreshing replays the entrance despite a session seen flag');
assert(entrancePending({session:true,storageBlocked:true}),'The entrance does not depend on persistent storage');
assert(entrancePending({hash:'#projects',reload:true}),'Refreshing a section URL also replays the entrance');
assert(!entrancePending({hash:'#projects'}),'Direct project navigation skips the entrance');
assert(entrancePending({reduced:true}),'A direct visit plays the opening even with OS reduced motion');
assert(entrancePending({paused:true}),'Pausing ambient motion does not suppress the opening');
assert(entrancePending({persisted:true,reduced:true,search:'?intro=cinematic'}),'Explicit replay remains available');
// A normal URL must play without special parameters or stored preferences,
// including a deployed subdirectory and direct index.html entry points.
const deployedBoot=await readFile(new URL('../dist/intro-boot.js',import.meta.url),'utf8');
for(const [script,prefix] of [[boot,''],[deployedBoot,basePath?`/${basePath}`:'']]){
 for(const route of ['/','/en/','/es/','/index.html','/en/index.html','/es/index.html']){
  const entry={script,pathname:prefix+route,reduced:true};
  assert(entrancePending(entry),'The opening plays automatically despite OS reduced motion');
  assert(entrancePending({...entry,paused:true}),'An old ambient pause cannot hide the opening');
  assert(entrancePending({...entry,storageBlocked:true}),'Storage is not required to play the opening');
  assert(entrancePending({...entry,hash:'#top'}),'A link to the top is still a homepage visit');
  assert(entrancePending({...entry,hash:'#home'}),'A link to the hero is still a homepage visit');
  assert(entrancePending({...entry,enabled:true}),'The saved motion-on choice overrides the OS');
  assert(entrancePending({...entry,search:'?motion=on'}),'An explicit motion-on URL overrides the OS');
  assert(entrancePending({...entry,paused:true,search:'?motion=on'}),'The URL overrides a saved pause');
  assert(!entrancePending({...entry,enabled:true,search:'?motion=off'}),'An explicit pause overrides the saved choice');
  assert(!entrancePending({...entry,search:'?intro=off'}),'An explicit intro opt-out skips the curtain');
  assert(entrancePending({...entry,search:'?intro=cinematic&motion=off'}),'An explicit replay overrides a motion opt-out');
  assert(!entrancePending({...entry,enabled:true,hash:'#projects'}),'Direct section links still skip the intro');
  assert(entrancePending({...entry,enabled:true,hash:'#projects',reload:true}),'Reloading a section honours motion-on');
 }
 assert(!entrancePending({script,pathname:`${prefix}/es/projects/chessbot/`,search:'?motion=on'}),'Detail pages never show the entrance curtain');
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
  assert.match(html,/data-intro="cinematic"/,'The hero keeps an explicit intro replay control');
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
