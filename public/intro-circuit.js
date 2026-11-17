// Canvas-only circuit: no model downloads, WebGL context or external assets.
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,t)=>a+(b-a)*t;
const random=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};

export function circuitPaths(width,height){
 const cx=width/2,cy=height*.49,unit=Math.min(width,height);
 return Array.from({length:48},(_,i)=>{
  const side=i%4,lane=Math.floor(i/4),offset=(lane-5.5)*unit*.026;
  const reach=unit*(.25+random(i)*.19),bend=unit*(.08+random(i+90)*.12);
  const local=[[unit*.065,offset*.4],[bend,offset*.4],[bend+Math.abs(offset)*.6,offset],[reach,offset],[reach+unit*.13,offset+Math.sign(offset)*unit*.13]];
  return local.map(([x,y])=>{
   if(side===1)[x,y]=[-y,x];else if(side===2)[x,y]=[-x,-y];else if(side===3)[x,y]=[y,-x];
   return {x:cx+x,y:cy+y*.69};
  });
 });
}
function pointAt(path,t){
 const lengths=path.slice(1).map((p,i)=>Math.hypot(p.x-path[i].x,p.y-path[i].y));
 let distance=clamp(t)*lengths.reduce((a,b)=>a+b,0);
 for(let i=0;i<lengths.length;i++){
  if(distance<=lengths[i]||i===lengths.length-1){const f=lengths[i]?distance/lengths[i]:0;return {x:mix(path[i].x,path[i+1].x,f),y:mix(path[i].y,path[i+1].y,f)};}
  distance-=lengths[i];
 }
}

export function createCircuit(canvas,signature){
 const ctx=canvas.getContext('2d');
 if(!ctx)return null;
 let width=0,height=0,paths=[],particles=[],disposed=false,fontsReady=false;
 const spans=[...signature.querySelectorAll('.intro-name-line')];
 function resize(){
  width=canvas.clientWidth;height=canvas.clientHeight;
  const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  paths=circuitPaths(width,height);
  const stencil=document.createElement('canvas');stencil.width=Math.ceil(width);stencil.height=Math.ceil(height);
  const pen=stencil.getContext('2d',{willReadFrequently:true});
  if(!pen){particles=[];return;}
  pen.fillStyle='#fff';pen.textBaseline='alphabetic';
  for(const span of spans){
   const rect=span.getBoundingClientRect(),style=getComputedStyle(span);
   pen.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
   pen.textAlign='center';
   const metrics=pen.measureText(span.textContent);
   // Match the browser's baseline, including the font's internal ascender space.
   const ascent=metrics.fontBoundingBoxAscent??metrics.actualBoundingBoxAscent;
   const descent=metrics.fontBoundingBoxDescent??metrics.actualBoundingBoxDescent;
   const baseline=rect.top+(rect.height+ascent-descent)/2;
   pen.fillText(span.textContent,rect.left+rect.width/2,baseline);
  }
  const data=pen.getImageData(0,0,stencil.width,stencil.height).data;
  const points=[],step=width<600?3:4;
  for(let y=0;y<height;y+=step)for(let x=0;x<width;x+=step){
   if(data[(y*stencil.width+x)*4+3]>100)points.push({x,y});
  }
  const stride=Math.max(1,Math.ceil(points.length/1700));
  particles=points.filter((_,i)=>i%stride===0).map((target,i)=>({target,path:paths[i%paths.length],seed:random(i+100),size:.7+random(i+200)*.8}));
 }
 resize();
 document.fonts?.ready.then(()=>{if(!disposed)fontsReady=true;});
 function render(ms,reduced){
  if(disposed)return;
  if(width!==canvas.clientWidth||height!==canvas.clientHeight||fontsReady){fontsReady=false;resize();}
  ctx.clearRect(0,0,width,height);
  if(reduced)return;
  const cx=width/2,cy=height*.49,unit=Math.min(width,height);
  const appear=smooth(ms/700),fade=1-smooth((ms-3350)/600);
  const board=appear*(1-smooth((ms-1800)/1300));
  ctx.globalCompositeOperation='lighter';
  // Wide, dim halo gives the circuit depth without a full-screen flash.
  const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,unit*.58);
  halo.addColorStop(0,`rgba(43,177,201,${board*.12})`);halo.addColorStop(.45,`rgba(48,113,167,${board*.055})`);halo.addColorStop(1,'rgba(20,60,100,0)');
  ctx.fillStyle=halo;ctx.fillRect(0,0,width,height);
  ctx.lineWidth=.7;
  for(let i=0;i<paths.length;i++){
   const path=paths[i];
   ctx.strokeStyle=`rgba(88,153,180,${board*.22})`;ctx.beginPath();
   path.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
   const end=path.at(-1);ctx.strokeStyle=`rgba(101,183,198,${board*.45})`;
   ctx.beginPath();ctx.arc(end.x,end.y,2.2,0,Math.PI*2);ctx.stroke();
   const phase=(ms/1700+random(i))%1;
   for(let tail=0;tail<12;tail++){
    const p=pointAt(path,1-clamp(phase-tail*.009));
    ctx.fillStyle=`rgba(${i%6===0?'230,191,136':'130,221,230'},${board*(1-tail/12)*.8})`;
    ctx.fillRect(p.x-1,p.y-1,tail===0?2.5:1.5,tail===0?2.5:1.5);
   }
  }
  // A small luminous core powers up before its light unfolds into the name.
  const core=unit*.057;
  ctx.save();ctx.translate(cx,cy);ctx.scale(1,.74);ctx.rotate(Math.PI/4);
  ctx.strokeStyle=`rgba(139,220,230,${board*.72})`;ctx.lineWidth=1;
  ctx.shadowColor='#7bdde8';ctx.shadowBlur=18*board;
  ctx.strokeRect(-core,-core,core*2,core*2);ctx.shadowBlur=0;
  ctx.strokeStyle=`rgba(139,220,230,${board*.22})`;ctx.strokeRect(-core*1.24,-core*1.24,core*2.48,core*2.48);ctx.restore();
  ctx.fillStyle=`rgba(191,234,238,${board*.8})`;ctx.font=`${Math.max(16,unit*.028)}px Consolas,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('av',cx,cy);
  // The same light packets leave the traces and settle into the letterforms.
  for(let i=0;i<particles.length;i++){
   const p=particles[i],departure=1450+p.seed*420,local=smooth((ms-departure)/1450);
   const start=pointAt(p.path,1-((Math.min(ms,departure)/2300+p.seed)%1));
   const arc=Math.sin(local*Math.PI),angle=p.seed*Math.PI*2;
   const x=mix(start.x,p.target.x,local)+Math.cos(angle)*unit*.13*arc;
   const y=mix(start.y,p.target.y,local)+Math.sin(angle)*unit*.18*arc;
   const alpha=appear*fade*(.2+local*.7)*(.65+p.seed*.35);
   ctx.fillStyle=`rgba(${i%11===0?'230,198,154':'164,218,232'},${alpha})`;
   ctx.fillRect(x,y,p.size+(1-local)*.5,p.size+(1-local)*.5);
  }
  ctx.globalCompositeOperation='source-over';
 }
 return {render,dispose(){disposed=true;particles=[];paths=[];canvas.width=canvas.height=1;}};
}
