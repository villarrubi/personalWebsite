// An original, lightweight point field. Motion uses elapsed time, not frame count.
export function networkPoint(point,time,width,height,pointer){
 let x=point.u*width+Math.sin(time*.23+point.phase)*22;
 let y=point.v*height+Math.cos(time*.19+point.phase)*18;
 if(pointer?.active){
  const dx=x-pointer.x,dy=y-pointer.y,distance=Math.hypot(dx,dy);
  const force=Math.max(0,1-distance/170)*32;
  if(distance>0){x+=dx/distance*force;y+=dy/distance*force;}
 }
 return {x:Math.max(3,Math.min(width-3,x)),y:Math.max(3,Math.min(height-3,y))};
}

const canvas=typeof document!=='undefined'?document.querySelector('.hero-network'):null;
if(canvas){
 const hero=canvas.closest('.experience-hero');
 const context=canvas.getContext('2d');
 if(context){
  const root=document.documentElement;
  const pointer={x:0,y:0,active:false};
  let width=0,height=0,points=[],frame=0,last=0,time=0,visible=true;
  const running=()=>visible&&!document.hidden&&root.classList.contains('ambient-enabled');
  function draw(dt=0){
   time+=dt;
   context.clearRect(0,0,width,height);
   for(const point of points){
    const target=networkPoint(point,time,width,height,pointer);
    const blend=dt?Math.min(1,dt*8):1;
    point.x+=(target.x-point.x)*blend;point.y+=(target.y-point.y)*blend;
   }
   if(pointer.active){
    const glow=context.createRadialGradient(pointer.x,pointer.y,0,pointer.x,pointer.y,180);
    glow.addColorStop(0,'rgba(102,218,225,.16)');glow.addColorStop(1,'rgba(102,218,225,0)');
    context.fillStyle=glow;context.fillRect(0,0,width,height);
   }
   const reach=width<600?105:155;
   for(let i=0;i<points.length;i++){
    const a=points[i];
    for(let j=i+1;j<points.length;j++){
     const b=points[j],distance=Math.hypot(a.x-b.x,a.y-b.y);
     if(distance>=reach)continue;
     context.strokeStyle=`rgba(130,197,220,${(.36*(1-distance/reach)).toFixed(3)})`;
     context.lineWidth=.85;context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke();
    }
    const near=pointer.active?Math.max(0,1-Math.hypot(a.x-pointer.x,a.y-pointer.y)/170):0;
    if(near>0){
     context.strokeStyle=`rgba(139,229,231,${(near*.5).toFixed(3)})`;context.beginPath();context.moveTo(a.x,a.y);context.lineTo(pointer.x,pointer.y);context.stroke();
    }
    context.fillStyle=`rgba(177,226,239,${(.48+near*.5).toFixed(3)})`;
    context.beginPath();context.arc(a.x,a.y,1.5+near*1.6,0,Math.PI*2);context.fill();
   }
  }
  function tick(now){
   frame=0;
   if(!running())return;
   if(!last||now-last>=32){const dt=last?Math.min(.06,(now-last)/1000):0;last=now;draw(dt);}
   frame=requestAnimationFrame(tick);
  }
  function sync(){
   if(running()){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
   else{cancelAnimationFrame(frame);frame=0;last=0;pointer.active=false;}
  }
  function resize(){
   const bounds=hero.getBoundingClientRect();width=bounds.width;height=bounds.height;
   const ratio=Math.min(devicePixelRatio||1,1.5);
   canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
   context.setTransform(ratio,0,0,ratio,0,0);
   const count=Math.min(width<600?32:72,Math.max(20,Math.round(width*height/9500)));
   points=Array.from({length:count},(_,i)=>{
    const u=((i*.61803398875+.13)%1),v=((i*.38196601125+i*i*.037+.17)%1);
    return {u,v,phase:i*2.4,x:u*width,y:v*height};
   });
   draw();sync();
  }
  hero.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||!running())return;
   const bounds=hero.getBoundingClientRect();
   pointer.x=event.clientX-bounds.left;pointer.y=event.clientY-bounds.top;pointer.active=true;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.active=false;});
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(hero);else addEventListener('resize',resize,{passive:true});
  addEventListener('pageshow',sync);
  resize();
 }
}
