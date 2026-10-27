import {writeFile} from 'node:fs/promises';
import {terrainHeight,terrainColor} from '../public/terrain.js';
const project=(x,h,z)=>[500+(x-z)*37,355+(x+z)*16-h*65];
const cells=[];
for(let x=-6.5;x<6.5;x+=.3)for(let z=-6.5;z<6.5;z+=.3){
 const corners=[[x,z],[x+.3,z],[x+.3,z+.3],[x,z+.3]];
 const heights=corners.map(([a,b])=>terrainHeight(a,b));if(Math.max(...heights)<.03)continue;
 const avg=heights.reduce((a,b)=>a+b)/4;
 const points=corners.map(([a,b],i)=>project(a,Math.max(.03,heights[i]),b).map(v=>v.toFixed(1)).join(',')).join(' ');
 const shade=Math.max(.65,Math.min(1.25,.9+(heights[0]-heights[2])*.6));
 const color=terrainColor(avg).map(c=>Math.round(Math.min(255,c*255*shade)));
 cells.push({depth:x+z,shape:`<polygon points="${points}" fill="rgb(${color.join(',')})" stroke="rgb(${color.join(',')})" stroke-width=".7"/>`});
}
cells.sort((a,b)=>a.depth-b.depth);
await writeFile('public/assets/hero-world.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="760" viewBox="0 0 1000 760"><defs><radialGradient id="water"><stop stop-color="#204c57"/><stop offset=".8" stop-color="#0e293a"/><stop offset="1" stop-color="#061327" stop-opacity="0"/></radialGradient></defs><ellipse cx="500" cy="390" rx="390" ry="190" fill="url(#water)"/><g fill="none" stroke="#90a9b8" stroke-opacity=".2" stroke-dasharray="3 5"><ellipse cx="500" cy="390" rx="365" ry="170"/><ellipse cx="500" cy="390" rx="410" ry="192"/></g>${cells.map(c=>c.shape).join('')}</svg>`);
