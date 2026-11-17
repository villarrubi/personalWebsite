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

export function circuitDetails(paths,width,height){
 const unit=Math.min(width,height);
 return paths.flatMap((path,i)=>[.24,.57].map((t,j)=>{
  const anchor=pointAt(path,t),next=pointAt(path,t+.008);
  const horizontal=Math.abs(next.x-anchor.x)>Math.abs(next.y-anchor.y);
  const sign=(i+j)%2?1:-1,length=unit*(.025+random(i*3+j)*.055);
  const elbow={x:anchor.x+(horizontal?0:sign*length),y:anchor.y+(horizontal?sign*length:0)};
  const tip={x:elbow.x+(horizontal?length*.65:0),y:elbow.y+(horizontal?0:length*.65)};
  return {points:[anchor,elbow,tip],delay:200+random(i+j*91)*750,kind:(i+j)%3};
 }));
}

// Slightly rounded bends and small components read as etched circuitry.
function drawTrace(ctx,points){
 ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);
 for(let i=1;i<points.length-1;i++){
  const previous=points[i-1],p=points[i],next=points[i+1];
  const before=Math.hypot(p.x-previous.x,p.y-previous.y),after=Math.hypot(next.x-p.x,next.y-p.y);
  const radius=Math.min(6,before/2,after/2);
  const a=before?radius/before:0,b=after?radius/after:0;
  ctx.lineTo(mix(p.x,previous.x,a),mix(p.y,previous.y,a));
  ctx.quadraticCurveTo(p.x,p.y,mix(p.x,next.x,b),mix(p.y,next.y,b));
 }
 ctx.lineTo(points.at(-1).x,points.at(-1).y);ctx.stroke();
}

function glowSprite(color){
 const sprite=document.createElement('canvas');sprite.width=sprite.height=48;
 const pen=sprite.getContext('2d');
 if(!pen)return null;
 const gradient=pen.createRadialGradient(24,24,0,24,24,24);
 gradient.addColorStop(0,`rgba(${color},.8)`);gradient.addColorStop(.18,`rgba(${color},.25)`);gradient.addColorStop(1,`rgba(${color},0)`);
 pen.fillStyle=gradient;pen.fillRect(0,0,48,48);return sprite;
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
 let width=0,height=0,paths=[],details=[],dust=[],particles=[],disposed=false,fontsReady=false,geometry='',bounds=null;
 const cyanGlow=glowSprite('113,216,234'),amberGlow=glowSprite('230,191,136');
 const geometryKey=()=>targets.map(el=>{const r=el.getBoundingClientRect();return `${r.x},${r.y},${r.width},${r.height}`;}).join('|');
 function resize(){
  width=canvas.clientWidth;height=canvas.clientHeight;geometry=geometryKey();
  const dpr=Math.min(devicePixelRatio||1,1.5);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const points=sampleText(targets,width,height);paths=circuitPaths(width,height,points);
  details=circuitDetails(paths,width,height);
  dust=Array.from({length:width<600?44:90},(_,i)=>({x:random(i+700)*width,y:random(i+900)*height,depth:.3+random(i+1200)*.7}));
  bounds=points.length?{left:Math.min(...points.map(p=>p.x))-18,right:Math.max(...points.map(p=>p.x))+18,top:Math.min(...points.map(p=>p.y))-20,bottom:Math.max(...points.map(p=>p.y))+20}:null;
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
  const detailFade=appear*(1-smooth((ms-2350)/950));
  ctx.globalCompositeOperation='lighter';ctx.lineWidth=.65;
  const light=(x,y,size,alpha,amber=false)=>{
   const sprite=amber?amberGlow:cyanGlow;if(!sprite)return;
   ctx.globalAlpha=alpha;ctx.drawImage(sprite,x-size/2,y-size/2,size,size);ctx.globalAlpha=1;
  };
  // A quiet rear layer gives the denser network breathing room and depth.
  for(let i=0;i<dust.length;i++){
   const p=dust[i],y=p.y-ms*.002*p.depth;
   ctx.fillStyle=`rgba(128,190,210,${detailFade*p.depth*.28})`;
   ctx.fillRect(p.x,y,p.depth*1.4,p.depth*1.4);
   if(i%7===0){ctx.fillRect(p.x-3,y,7,.5);ctx.fillRect(p.x,y-3,.5,7);}
  }
  for(let i=0;i<details.length;i++){
   const branch=details[i],power=smooth((ms-branch.delay)/550),alpha=detailFade*power;
   ctx.strokeStyle=`rgba(87,150,175,${alpha*.23})`;drawTrace(ctx,branch.points);
   const end=branch.points.at(-1),joint=branch.points[0];
   ctx.strokeStyle=`rgba(142,203,215,${alpha*.55})`;ctx.lineWidth=.7;
   ctx.beginPath();ctx.arc(joint.x,joint.y,1.7,0,Math.PI*2);ctx.stroke();
   if(branch.kind===0){
    ctx.beginPath();ctx.arc(end.x,end.y,3.2,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=`rgba(167,222,230,${alpha*.6})`;ctx.fillRect(end.x-.7,end.y-.7,1.4,1.4);
   }else if(branch.kind===1){
    ctx.strokeRect(end.x-4,end.y-2,8,4);
    ctx.beginPath();ctx.moveTo(end.x-1,end.y-2);ctx.lineTo(end.x-1,end.y+2);ctx.moveTo(end.x+1,end.y-2);ctx.lineTo(end.x+1,end.y+2);ctx.stroke();
   }else{
    ctx.beginPath();ctx.moveTo(end.x-3,end.y-3);ctx.lineTo(end.x+3,end.y+3);ctx.moveTo(end.x+3,end.y-3);ctx.lineTo(end.x-3,end.y+3);ctx.stroke();
   }
   const ring=clamp((ms-branch.delay-350)/650);
   if(ring>0&&ring<1){
    ctx.strokeStyle=`rgba(132,219,230,${alpha*(1-ring)*.45})`;
    ctx.beginPath();ctx.arc(end.x,end.y,3+ring*13,0,Math.PI*2);ctx.stroke();
    light(end.x,end.y,22,alpha*(1-ring)*.55,i%9===0);
   }
  }
  // Fine registration marks sit around the actual text, then withdraw as it resolves.
  if(bounds){
   const bracket=detailFade*(1-smooth((ms-2200)/750));
   ctx.strokeStyle=`rgba(131,189,208,${bracket*.5})`;ctx.lineWidth=.75;
   for(const [x,y,sx,sy] of [[bounds.left,bounds.top,1,1],[bounds.right,bounds.top,-1,1],[bounds.left,bounds.bottom,1,-1],[bounds.right,bounds.bottom,-1,-1]]){
    ctx.beginPath();ctx.moveTo(x,y+sy*12);ctx.lineTo(x,y);ctx.lineTo(x+sx*18,y);ctx.stroke();
    ctx.fillStyle=`rgba(131,189,208,${bracket*.35})`;ctx.fillRect(x+sx*23,y,2,2);
   }
  }
  for(let i=0;i<paths.length;i++){
   const path=paths[i];
   ctx.lineWidth=i%3===0?.9:.55;ctx.strokeStyle=`rgba(88,153,180,${traces*.22})`;drawTrace(ctx,path.points);
   for(let packet=0;packet<2;packet++){
    const travel=(ms-random(i)*400-packet*480)/1700;
    if(travel<0||travel>1.15)continue;
    const phase=clamp(travel),head=pointAt(path,phase),power=traces*(1-smooth((travel-1)/.15));
    light(head.x,head.y,packet?13:22,power*.7,i%6===0);
    for(let tail=0;tail<12;tail++){
     const p=pointAt(path,clamp(phase-tail*.009));
     ctx.fillStyle=`rgba(${i%6===0?'230,191,136':'148,232,240'},${power*(1-tail/12)*.9})`;
     ctx.fillRect(p.x-1,p.y-1,tail===0?2.7:1.4,tail===0?2.7:1.4);
    }
   }
  }
  for(let i=0;i<particles.length;i++){
   const p=particles[i],departure=450+p.seed*600,local=smooth((ms-departure)/1550);
   const start=pointAt(p.path,clamp((Math.min(ms,departure)+p.seed*350)/2100));
   const arc=Math.sin(local*Math.PI),angle=p.seed*Math.PI*2;
   const x=mix(start.x,p.target.x,local)+Math.cos(angle)*unit*.035*arc;
   const y=mix(start.y,p.target.y,local)+Math.sin(angle)*unit*.05*arc;
   const alpha=appear*fade*(.2+local*.8)*(.65+p.seed*.35);
   if(i%9===0&&local>.05&&local<.9){
    const streak=(1-local)*7;
    ctx.strokeStyle=`rgba(134,207,227,${alpha*.35})`;ctx.lineWidth=.6;
    ctx.beginPath();ctx.moveTo(x-Math.cos(angle)*streak,y-Math.sin(angle)*streak);ctx.lineTo(x,y);ctx.stroke();
   }
   ctx.fillStyle=`rgba(${local>.85?p.target.color:i%11===0?'230,198,154':'164,218,232'},${alpha})`;
   ctx.fillRect(x,y,p.size+(1-local)*.5,p.size+(1-local)*.5);
  }
  ctx.globalCompositeOperation='source-over';
 }
 return {render,dispose(){disposed=true;particles=[];paths=[];details=[];dust=[];canvas.width=canvas.height=1;if(cyanGlow)cyanGlow.width=cyanGlow.height=1;if(amberGlow)amberGlow.width=amberGlow.height=1;}};
}
