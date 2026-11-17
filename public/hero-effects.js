export function pointerInfluence(x,y,pointer,radius=150){
 if(!pointer?.active||radius<=0)return 0;
 return Math.max(0,1-Math.hypot(x-pointer.x,y-pointer.y)/radius)*(pointer.strength??1);
}
export const codeSnippets=[
 'engine.search(depth);','score = evaluate(position);','sensor.read();','distance = lidar.measure();',
 'model.predict(input)','map.render(viewport);','for (auto move : moves)','return bestMove;',
 'auto moves = legalMoves();','board.makeMove(move);','alpha = max(alpha, score);','cache.find(position);',
 'samples = sensor.read();','point = scan.next();','device.connect();','Serial.println(value);',
 'X_train, X_test = split(X)','model.fit(X_train, y_train)','loss.backward()','optimizer.step()',
 'with torch.no_grad():','embeddings = encode(text)','for batch in dataset:','features = normalize(data)',
 'terrain.generate(seed);','height = noise(x, y);','mesh.computeNormals();','camera.lookAt(target);',
 'await fetchProjects();','return response.json();','SELECT * FROM projects;','git commit -m "Keep building"'
];
export function codeFrame(time,index,snippets=codeSnippets){
 const progress=time/7+index/8,cycle=Math.floor(progress),phase=progress-cycle;
 // An odd stride visits every snippet; staggered rows stay distinct.
 const snippet=snippets[(index+cycle*9)%snippets.length];
 const portion=phase<.45?phase/.45:phase<.72?1:Math.max(0,1-(phase-.72)/.22);
 return {snippet,text:snippet.slice(0,Math.floor(snippet.length*portion))};
}
const canvas=typeof document!=='undefined'?document.querySelector('.hero-effects'):null;
if(canvas){
 const ctx=canvas.getContext('2d');
 if(ctx){
  const hero=canvas.closest('.experience-hero'),root=document.documentElement;
  const pointer={x:0,y:0,tx:0,ty:0,active:false,strength:0};
  const snippets=[...codeSnippets];
  for(let i=snippets.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[snippets[i],snippets[j]]=[snippets[j],snippets[i]];}
  let width=0,height=0,time=0,frame=0,last=0,visible=true;
  const running=()=>visible&&!document.hidden&&root.classList.contains('ambient-enabled');
  const rgba=(opacity,warm=false)=>warm?`rgba(191,169,132,${opacity})`:`rgba(139,211,222,${opacity})`;
  function code(){
   ctx.font=`${width<600?12:14}px monospace`;
   for(let index=0;index<8;index++){
    const column=index%2,row=Math.floor(index/2);
    const x=width<600?(column?width*.43:14):(column?width*.69:28);
    const y=height*(.16+row*.22)+Math.sin(time*.45+index)*6;
    const {text}=codeFrame(time,index,snippets);
    const influence=pointerInfluence(x+70,y,pointer,180);
    ctx.fillStyle=rgba(.2+influence*.55,index%3===0);
    ctx.fillText(text,x,y);
    if(Math.sin(time*5+index)>0){ctx.fillStyle=rgba(.4+influence*.4);ctx.fillRect(x+ctx.measureText(text).width+4,y-10,5,12);}
   }
  }
  function draw(dt=0){
   time+=dt;
   const blend=dt?1-Math.exp(-dt*8):1;
   pointer.x+=(pointer.tx-pointer.x)*blend;pointer.y+=(pointer.ty-pointer.y)*blend;
   pointer.strength+=((pointer.active?1:0)-pointer.strength)*blend;
   const wasActive=pointer.active;pointer.active=pointer.strength>.001;
   ctx.clearRect(0,0,width,height);
   code();
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
  resize();
 }
}
