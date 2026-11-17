export const heroEffects=['signals','code','pixels'];
export function pointerInfluence(x,y,pointer,radius=150){
 if(!pointer?.active||radius<=0)return 0;
 return Math.max(0,1-Math.hypot(x-pointer.x,y-pointer.y)/radius)*(pointer.strength??1);
}
export function signalValue(u,time,channel,influence=0){
 const phase=u*Math.PI*(channel===1?10:6)-time*(channel===2?2:1.4);
 const base=channel===1?Math.tanh(Math.sin(phase)*8):Math.sin(phase)*.65+Math.sin(phase*2.3)*.2;
 return base*(1+Math.max(0,Math.min(1,influence))*.7);
}

const canvas=typeof document!=='undefined'?document.querySelector('.hero-effects'):null;
if(canvas){
 const ctx=canvas.getContext('2d');
 if(ctx){
  const hero=canvas.closest('.experience-hero'),root=document.documentElement;
  const picker=hero.querySelector('.hero-effect-picker');
  const buttons=[...picker.querySelectorAll('[data-hero-effect]')];
  const pointer={x:0,y:0,tx:0,ty:0,active:false,strength:0};
  let width=0,height=0,mode='signals',time=0,frame=0,last=0,visible=true;
  const running=()=>visible&&!document.hidden&&root.classList.contains('ambient-enabled');
  const rgba=(opacity,warm=false)=>warm?`rgba(191,169,132,${opacity})`:`rgba(139,211,222,${opacity})`;
  function grid(spacing){
   ctx.strokeStyle=rgba(.07);ctx.lineWidth=.5;ctx.beginPath();
   for(let x=0;x<width;x+=spacing){ctx.moveTo(x,0);ctx.lineTo(x,height);}
   for(let y=0;y<height;y+=spacing){ctx.moveTo(0,y);ctx.lineTo(width,y);}
   ctx.stroke();
  }
  function signals(){
   grid(36);
   const labels=['ESP32 / RX','C++ / DATA','LiDAR / RANGE'];
   for(let channel=0;channel<3;channel++){
    const baseline=height*(.23+channel*.28),amplitude=Math.min(28,height*.055);
    ctx.strokeStyle=rgba(channel===1?.38:.52,channel===2);ctx.lineWidth=channel===1?1.2:1.7;ctx.beginPath();
    const samples=Math.ceil(width/5);
    for(let sample=0;sample<=samples;sample++){
     const x=sample/samples*width;
     const y=baseline+signalValue(x/Math.max(width,1),time,channel,pointerInfluence(x,baseline,pointer,200))*amplitude;
     if(!sample)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();ctx.font='10px monospace';ctx.fillStyle=rgba(.65,channel===2);ctx.fillText(labels[channel],20,baseline-amplitude-13);
   }
   const sweep=(time*65)%(width+100)-50;
   const light=ctx.createLinearGradient(sweep-65,0,sweep+2,0);light.addColorStop(0,rgba(0));light.addColorStop(1,rgba(.14));
   ctx.fillStyle=light;ctx.fillRect(sweep-65,0,67,height);
  }
  function code(){
   const snippets=['engine.search(depth);','score = evaluate(position);','sensor.read();','distance = lidar.measure();','model.predict(input)','map.render(viewport);','for (auto move : moves)','return bestMove;'];
   ctx.font=`${width<600?12:14}px monospace`;
   snippets.forEach((snippet,index)=>{
    const column=index%2,row=Math.floor(index/2);
    const x=width<600?(column?width*.43:14):(column?width*.69:28);
    const y=height*(.16+row*.22)+Math.sin(time*.45+index)*6;
    const phase=(time*.2+index*.17)%1,count=Math.max(2,Math.min(snippet.length,Math.floor(phase*snippet.length*1.5)));
    const influence=pointerInfluence(x+70,y,pointer,180);
    ctx.fillStyle=rgba(.2+influence*.55,index%3===0);
    ctx.fillText(snippet.slice(0,count),x,y);
    if(Math.sin(time*5+index)>0){ctx.fillStyle=rgba(.4+influence*.4);ctx.fillRect(x+ctx.measureText(snippet.slice(0,count)).width+4,y-10,5,12);}
   });
  }
  function pixels(){
   const size=width<600?26:34;
   for(let row=0,y=10;y<height;row++,y+=size)for(let col=0,x=10;x<width;col++,x+=size){
    const field=Math.sin(col*.55-time*.7)+Math.cos(row*.7+time*.5);
    const influence=pointerInfluence(x,y,pointer,160);
    const lit=Math.max(0,(field-1.05)/.95);
    const opacity=.035+lit*.35+influence*.48;
    const extent=4+lit*8+influence*10;
    ctx.fillStyle=rgba(Math.min(.8,opacity),(row+col)%9===0);
    ctx.fillRect(x+(size-extent)/2,y+(size-extent)/2,extent,extent);
    if(influence>.35){ctx.strokeStyle=rgba(influence*.25);ctx.lineWidth=.7;ctx.strokeRect(x+2,y+2,size-4,size-4);}
   }
  }
  function draw(dt=0){
   time+=dt;
   const blend=dt?1-Math.exp(-dt*8):1;
   pointer.x+=(pointer.tx-pointer.x)*blend;pointer.y+=(pointer.ty-pointer.y)*blend;
   pointer.strength+=((pointer.active?1:0)-pointer.strength)*blend;
   const wasActive=pointer.active;pointer.active=pointer.strength>.001;
   ctx.clearRect(0,0,width,height);
   if(mode==='signals')signals();else if(mode==='code')code();else pixels();
   pointer.active=wasActive;
   // Keep the name legible while preserving the effects around it.
   ctx.globalCompositeOperation='destination-out';
   const mask=ctx.createRadialGradient(width*.5,height*.45,0,width*.5,height*.45,Math.max(width*.28,height*.4));
   mask.addColorStop(0,'rgba(0,0,0,.5)');mask.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=mask;ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='source-over';
  }
  function tick(now){
   frame=0;if(!running())return;
   if(!last||now-last>=32){draw(last?Math.min(.06,(now-last)/1000):0);last=now;}
   frame=requestAnimationFrame(tick);
  }
  function sync(){
   if(running()){if(!frame){last=0;frame=requestAnimationFrame(tick);}}
   else{cancelAnimationFrame(frame);frame=0;last=0;}
  }
  function resize(){
   const bounds=hero.getBoundingClientRect();width=bounds.width;height=bounds.height;
   const ratio=Math.min(devicePixelRatio||1,1.5,1600/Math.max(width,1));
   canvas.width=Math.max(1,Math.round(width*ratio));canvas.height=Math.max(1,Math.round(height*ratio));ctx.setTransform(ratio,0,0,ratio,0,0);
   draw();sync();
  }
  buttons.forEach(button=>button.addEventListener('click',()=>{
   if(!heroEffects.includes(button.dataset.heroEffect))return;
   mode=button.dataset.heroEffect;
   buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
   draw();
  }));
  hero.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||!running())return;
   const bounds=hero.getBoundingClientRect();pointer.tx=event.clientX-bounds.left;pointer.ty=event.clientY-bounds.top;
   if(pointer.strength<.001){pointer.x=pointer.tx;pointer.y=pointer.ty;}
   pointer.active=true;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{pointer.active=false;});
  document.addEventListener('visibilitychange',sync);
  new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
  if('ResizeObserver'in window)new ResizeObserver(resize).observe(hero);else addEventListener('resize',resize,{passive:true});
  addEventListener('pageshow',sync);
  picker.hidden=false;resize();
 }
}
