// Flowing contour lines: a lightweight surface deformed locally by the pointer.
export function contourPoint(u,band,time,width,height,pointer){
 const x=u*width;
 let y=height*(.12+band*.76+Math.sin(u*Math.PI*2.1+time*.28+band*1.9)*.09+Math.sin(u*Math.PI*4-time*.17+band)*.025);
 if(pointer?.active){
  const dx=(x-pointer.x)/220,dy=(y-pointer.y)/160;
  const influence=Math.max(0,1-dx*dx-dy*dy);
  y-=influence*influence*42*(pointer.strength??1);
 }
 return {x:Math.max(0,Math.min(width,x)),y:Math.max(3,Math.min(height-3,y))};
}

const canvas=typeof document!=='undefined'?document.querySelector('.hero-contours'):null;
if(canvas){
 const hero=canvas.closest('.experience-hero');
 const context=canvas.getContext('2d');
 if(context){
  const root=document.documentElement;
  const pointer={x:0,y:0,tx:0,ty:0,active:false,strength:0};
  let width=0,height=0,bands=[],frame=0,last=0,time=0,visible=true;
  const running=()=>visible&&!document.hidden&&root.classList.contains('ambient-enabled');
  function draw(dt=0){
   time+=dt;
   context.clearRect(0,0,width,height);
   const blend=dt?Math.min(1,dt*7):1;
   pointer.x+=(pointer.tx-pointer.x)*blend;pointer.y+=(pointer.ty-pointer.y)*blend;
   pointer.strength+=((pointer.active?1:0)-pointer.strength)*blend;
   const influence={...pointer,active:pointer.strength>.001};
   const samples=Math.max(48,Math.min(120,Math.ceil(width/14)));
   for(const band of bands){
    context.strokeStyle=band.color;context.lineWidth=band.major?1.5:.8;context.beginPath();
    for(let sample=0;sample<=samples;sample++){
     const point=contourPoint(sample/samples,band.position,time,width,height,influence);
     if(sample===0)context.moveTo(point.x,point.y);else context.lineTo(point.x,point.y);
    }
    context.stroke();
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
   const count=width<600?14:22;
   bands=Array.from({length:count},(_,i)=>{
    const major=i%5===0,color=context.createLinearGradient(0,0,width,0);
    color.addColorStop(0,'rgba(92,156,214,.04)');
    color.addColorStop(.25,`rgba(110,180,222,${major?.5:.24})`);
    color.addColorStop(.7,`rgba(117,214,210,${major?.65:.3})`);
    color.addColorStop(1,`rgba(191,169,132,${major?.35:.12})`);
    return {position:i/(count-1),major,color};
   });
   draw();sync();
  }
  hero.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||!running())return;
   const bounds=hero.getBoundingClientRect();
   pointer.tx=event.clientX-bounds.left;pointer.ty=event.clientY-bounds.top;
   if(pointer.strength<.001){pointer.x=pointer.tx;pointer.y=pointer.ty;}
   pointer.active=true;
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
