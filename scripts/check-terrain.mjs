import assert from 'node:assert/strict';
import {terrainHeight,terrainColor} from '../public/terrain.js';

for(const kind of ['islands','highlands'])for(const seed of [7,18,29,40,51,62]){
 let land=0,sea=0;
 for(let x=-6.5;x<=6.5;x+=.25)for(let z=-6.5;z<=6.5;z+=.25){
  const height=terrainHeight(x,z,seed,kind);
  assert(Number.isFinite(height)&&height>=-.25&&height<5,'Finite bounded terrain');
  assert.equal(terrainHeight(x,z,seed,kind),height,'A seed reproduces the same terrain');
  for(const c of terrainColor(height))assert(c>=0&&c<=1,'Valid surface colors');
  if(height>.025)land++;else sea++;
  if(Math.hypot(x,z)>=6.2)assert(height<0,'Terrain stays inside the water and framing rings');
 }
 assert(land>20&&sea>20,'Every landscape contains visible land and water');
}
const sample=(seed,kind)=>Array.from({length:100},(_,i)=>terrainHeight(i%10-5,Math.floor(i/10)-5,seed,kind));
assert.notDeepEqual(sample(7,'islands'),sample(18,'islands'),'Generate another produces a different landscape');
assert.notDeepEqual(sample(7,'islands'),sample(7,'highlands'),'Presets produce different landscapes');
console.log('PASS: reproducible landscapes, distinct seeds and presets, bounded geometry and submerged edges.');
