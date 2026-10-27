// Deterministic terrain shared by the live study and its static poster.
const fract=n=>n-Math.floor(n);
const smooth=n=>n*n*(3-2*n);
const mix=(a,b,t)=>a+(b-a)*t;
function noise(x,z,seed){
 const ix=Math.floor(x),iz=Math.floor(z),fx=smooth(x-ix),fz=smooth(z-iz);
 const hash=(a,b)=>fract(Math.sin(a*127.1+b*311.7+seed*74.7)*43758.5453);
 return mix(mix(hash(ix,iz),hash(ix+1,iz),fx),mix(hash(ix,iz+1),hash(ix+1,iz+1),fx),fz);
}
export function terrainHeight(x,z,seed=7,kind='islands'){
 let n=0,amplitude=.56,frequency=.43;
 for(let i=0;i<5;i++){n+=noise(x*frequency+13,z*frequency-8,seed)*amplitude;frequency*=2.03;amplitude*=.48;}
 const radius=Math.hypot(x*.95,z*1.08)/5.7;
 const edge=Math.pow(radius,2.15);
 const islands=.95*Math.exp(-((x+2)**2/3.2+(z-.8)**2/3.6))
  +.82*Math.exp(-((x-2.1)**2/2.2+(z+1.6)**2/2.5))
  +.61*Math.exp(-((x+.5)**2/1.1+(z+3.4)**2/1.7));
 const height=kind==='highlands'?(n*.95+.30-edge)*3.6:(islands-.23+(n-.5)*1.2)*3.7;
 const coast=Math.max(0,Math.min(1,(1-radius)/.28));
 return Math.max(-.25,height*coast-.25*(1-coast));
}
export function terrainColor(height){
 const stops=[[0,[.63,.62,.49]],[.14,[.43,.58,.51]],[.48,[.18,.39,.37]],[1.1,[.30,.45,.42]],[1.65,[.55,.61,.54]],[2.25,[.82,.82,.73]],[3.4,[.92,.9,.82]]];
 for(let i=1;i<stops.length;i++)if(height<=stops[i][0]){
  const t=Math.max(0,(height-stops[i-1][0])/(stops[i][0]-stops[i-1][0]));
  return stops[i][1].map((v,j)=>mix(stops[i-1][1][j],v,t));
 }
 return stops.at(-1)[1];
}
