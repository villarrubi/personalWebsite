// Light travels from independent circuit traces directly to the live hero text.
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,t)=>a+(b-a)*t;
const random=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n);};

export function circuitPaths(width,height,targets){
 if(!targets.length)return [];
 return Array.from({length:48},(_,i)=>{
  const target=targets[Math.floor(i*targets.length/48)],side=i%4,seed=random(i);
  // Each trace has its own destination on a letter, never a shared central hub.
  let points;
  if(side<2){
   const x=side===0?-24:width+24,y=height*(.08+seed*.78);
   const elbow=mix(x,target.x,.4+random(i+70)*.25);
   points=[{x,y},{x:elbow,y},{x:elbow,y:target.y},{x:target.x,y:target.y}];
  }else{
   const x=width*(.05+seed*.9),y=side===2?-24:height+24;
   const elbow=mix(y,target.y,.4+random(i+70)*.25);
   points=[{x,y},{x,y:elbow},{x:target.x,y:elbow},{x:target.x,y:target.y}];
  }
  const lengths=points.slice(1).map((p,j)=>Math.hypot(p.x-points[j].x,p.y-points[j].y));
  return {points,lengths,total:lengths.reduce((a,b)=>a+b,0)};
 });
}
function pointAt(path,t){
 let distance=clamp(t)*path.total;
 for(let i=0;i<path.lengths.length;i++){
  const length=path.lengths[i];
  if(distance<=length||i===path.lengths.length-1){
   const f=length?distance/length:0;
   return {x:mix(path.points[i].x,path.points[i+1].x,f),y:mix(path.points[i].y,path.points[i+1].y,f)};
  }
  distance-=length;
 }
}

// Read actual grapheme positions: line breaks, italics, punctuation, tracking and
// the translated phrase all come from the live DOM rather than a duplicate title.
function sampleText(targets,width,height){
 const stencil=document.createElement('canvas');stencil.width=width;stencil.height=height;
 const pen=stencil.getContext('2d',{willReadFrequently:true});
 if(!pen)return [];
 const range=document.createRange(),segmenter=new Intl.Segmenter(document.documentElement.lang,{granularity:'grapheme'});
 pen.textBaseline='alphabetic';pen.textAlign='left';
 for(const target of targets){
  const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
   if(!node.textContent.trim())continue;
   const style=getComputedStyle(node.parentElement);
   pen.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
   pen.fillStyle=style.color;
   const metrics=pen.measureText('Mg');
   const ascent=metrics.fontBoundingBoxAscent??metrics.actualBoundingBoxAscent;
   const descent=metrics.fontBoundingBoxDescent??metrics.actualBoundingBoxDescent;
   for(const {segment,index} of segmenter.segment(node.textContent)){
    if(!segment.trim())continue;
    range.setStart(node,index);range.setEnd(node,index+segment.length);
    const rect=range.getBoundingClientRect();
    if(!rect.width||rect.bottom<=0||rect.top>=height)continue;
    pen.fillText(segment,rect.left,rect.top+(rect.height+ascent-descent)/2);
   }
  }
 }
 const data=pen.getImageData(0,0,width,height).data,points=[],step=width<600?2:3;
 for(let y=0;y<height;y+=step)for(let x=0;x<width;x+=step){
  const index=(y*width+x)*4;
  if(data[index+3]>100)points.push({x,y,color:`${data[index]},${data[index+1]},${data[index+2]}`});
 }
 const stride=Math.max(1,Math.ceil(points.length/2200));
 return points.filter((_,i)=>i%stride===0);
}

export function createCircuit(canvas,targets){
 const ctx=canvas.getContext('2d');
 if(!ctx)return null;
 let width=0,height=0,paths=[],particles=[],disposed=false,fontsReady=false,geometry='';
 const geometryKey=()=>targets.map(el=>{const r=el.getBoundingClientRect();return `${r.x},${r.y},${r.width},${r.height}`;}).join('|');
 function resize(){
  width=canvas.clientWidth;height=canvas.clientHeight;geometry=geometryKey();
  const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const points=sampleText(targets,width,height);paths=circuitPaths(width,height,points);
  particles=points.map((target,i)=>({target,path:paths[i%paths.length],seed:random(i+100),size:.7+random(i+200)*.7}));
 }
 resize();
 document.fonts?.ready.then(()=>{if(!disposed)fontsReady=true;});
 function render(ms,reduced){
  if(disposed)return;
  if(width!==canvas.clientWidth||height!==canvas.clientHeight||fontsReady||geometry!==geometryKey()){fontsReady=false;resize();}
  ctx.clearRect(0,0,width,height);
  // An anchored/history visit below the hero keeps its position and opens directly.
  if(!particles.length)return false;
  if(reduced)return;
  const unit=Math.min(width,height),appear=smooth(ms/500),fade=1-smooth((ms-2750)/600);
  const traces=appear*(1-smooth((ms-1500)/1250));
  ctx.globalCompositeOperation='lighter';ctx.lineWidth=.65;
  for(let i=0;i<paths.length;i++){
   const path=paths[i];
   ctx.strokeStyle=`rgba(88,153,180,${traces*.14})`;ctx.beginPath();
   path.points.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
   const phase=clamp((ms-random(i)*500)/1700);
   for(let tail=0;tail<10;tail++){
    const p=pointAt(path,clamp(phase-tail*.012));
    ctx.fillStyle=`rgba(${i%6===0?'230,191,136':'130,221,230'},${traces*(1-tail/10)*.8})`;
    ctx.fillRect(p.x-1,p.y-1,tail===0?2.5:1.5,tail===0?2.5:1.5);
   }
  }
  for(let i=0;i<particles.length;i++){
   const p=particles[i],departure=450+p.seed*600,local=smooth((ms-departure)/1550);
   const start=pointAt(p.path,clamp((Math.min(ms,departure)+p.seed*350)/2100));
   const arc=Math.sin(local*Math.PI),angle=p.seed*Math.PI*2;
   const x=mix(start.x,p.target.x,local)+Math.cos(angle)*unit*.035*arc;
   const y=mix(start.y,p.target.y,local)+Math.sin(angle)*unit*.05*arc;
   const alpha=appear*fade*(.2+local*.8)*(.65+p.seed*.35);
   ctx.fillStyle=`rgba(${local>.85?p.target.color:i%11===0?'230,198,154':'164,218,232'},${alpha})`;
   ctx.fillRect(x,y,p.size+(1-local)*.5,p.size+(1-local)*.5);
  }
  ctx.globalCompositeOperation='source-over';
 }
 return {render,dispose(){disposed=true;particles=[];paths=[];canvas.width=canvas.height=1;}};
}
