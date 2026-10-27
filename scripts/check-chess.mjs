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
assert.equal(introPose(0).pitch,introPose(600).pitch,'Hold the lateral view before moving');
assert(Math.abs(introPose(2200).pitch-.88)<1e-12,'Settle the camera before the code disperses');
assert.equal(introPose(2900).curtain,1);
assert.equal(introPose(0).appearance,0,'The board fades in without a first-frame flash');
assert.equal(introPose(2000).dissolve,0,'Show the complete board before dissolving');
assert(introPose(3500).dissolve>0&&introPose(3500).curtain<1,'Code and page share the transition');
assert.equal(introPose(INTRO_DURATION).dissolve,1,'All code has vanished before removing the overlay');
assert.equal(introPose(INTRO_DURATION).dock,0,'Do not shrink the board into the page');
assert.equal(introPose(INTRO_DURATION).curtain,0);
// A returning visitor must not get another blocking entrance, even in a new
// session. Keep deep links and OS motion preferences working independently.
const boot=await readFile(new URL('../public/intro-boot.js',import.meta.url),'utf8');
function entrancePending({persisted=false,session=false,hash='',search='',reduced=false,paused=false,storageBlocked=false}={}){
  const classes=new Set();
  runInNewContext(boot,{
    location:{pathname:'/es/',hash,search},URLSearchParams,
    localStorage:{getItem:()=>{if(storageBlocked)throw new Error('Unavailable');return persisted?'1':null;}},
    sessionStorage:{getItem:key=>key==='chess-opening-seen'?(session?'1':null):paused?'off':null},
    matchMedia:()=>({matches:reduced}),document:{documentElement:{classList:{add:name=>classes.add(name)}}},
    window:{},setTimeout:()=>1,
  });
  return classes.has('intro-pending');
}
assert(entrancePending(),'A first visit can show the entrance');
assert(!entrancePending({persisted:true}),'A new session retains the first-visit preference');
assert(!entrancePending({session:true}),'Existing visitors keep their session preference');
assert(!entrancePending({session:true,storageBlocked:true}),'Blocked persistent storage falls back to the session');
assert(!entrancePending({hash:'#projects'}),'Direct project navigation skips the entrance');
assert(!entrancePending({reduced:true}),'Automatic motion respects the OS');
assert(!entrancePending({paused:true}),'A paused scene skips automatic motion');
assert(entrancePending({persisted:true,reduced:true,search:'?intro=cinematic'}),'Explicit replay remains available');
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
  assert.match(html,/<img class="chess-poster"[^>]+staunton-poster.webp/,'Loading uses the rendered board');
  assert.match(html,/<link rel="preload" as="image" href="\/assets\/chess\/staunton-poster.webp"/);
  assert(!html.includes('chess-fallback'),'Never flash Unicode pieces during navigation');
}
for(const aspect of [320/844,390/844,768/1024,1440/900,2560/1080]){
  const camera=new PerspectiveCamera(32,aspect,.1,150);
  let previous=introPose(0);
  for(let time=0;time<=INTRO_DURATION;time+=16){
    const pose=introPose(time),frame=cameraFrame(pose.pitch,pose.yaw,aspect);
    assert(pose.pitch>=previous.pitch&&pose.dissolve>=previous.dissolve,'Camera and dissolve progress never reverse');
    assert(Math.abs(pose.pitch-previous.pitch)<.02,'No jumps between frames');
    camera.position.set(...frame.position);camera.up.set(...frame.up);camera.lookAt(...frame.target);camera.updateMatrixWorld();
    for(const x of [-4.45,4.45])for(const y of [-.14,1.85])for(const z of [-4.45,4.45]){
      const p=new Vector3(x,y,z).project(camera);
      assert(Math.abs(p.x)<.9&&Math.abs(p.y)<.87,`Entire set remains framed at ${aspect}, ${time}ms`);
    }
    previous=pose;
  }
}
console.log('PASS: 32 pieces, six valid Staunton meshes, correct starting position, continuous camera at five aspect ratios, and identical board posters preloaded in both languages.');
