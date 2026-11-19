export function pointerInfluence(x,y,pointer,radius=150){
 if(!pointer?.active||radius<=0)return 0;
 return Math.max(0,1-Math.hypot(x-pointer.x,y-pointer.y)/radius)*(pointer.strength??1);
}
export const codeSnippets=[
 'engine.search(depth);','score = evaluate(position);\nalpha = max(alpha, score);','sensor.read();','distance = lidar.measure();',
 'model.predict(input)','map.render(viewport);','for (auto move : moves)','return bestMove;',
 'auto moves = legalMoves();\nfor (auto move : moves) {\n  board.makeMove(move);\n}','board.makeMove(move);','alpha = max(alpha, score);','cache.find(position);',
 'samples = sensor.read();','point = scan.next();','device.connect();','Serial.println(value);',
 'X_train, X_test = split(X)','model.fit(X_train, y_train)','loss.backward()\noptimizer.step()','optimizer.step()',
 'with torch.no_grad():\n  output = model(inputs)','embeddings = encode(text)','for batch in dataset:\n  prediction = model(batch)\n  loss.backward()','features = normalize(data)',
 'terrain.generate(seed);','height = noise(x, y);\nmesh.computeNormals();','mesh.computeNormals();','camera.lookAt(target);',
 'const response = await fetchProjects();\nreturn response.json();','return response.json();','SELECT name, language\nFROM projects\nWHERE published = true;','git commit -m "Keep building"'
];
// Seeded, best-candidate placement keeps the field scattered and stable on resize.
// Short blocks share the space with single lines; no fixed rows or columns.
export function codeLayout(width,height,snippets=codeSnippets,seed=1){
 let state=seed>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const count=width<600?14:width<1100?24:30,items=[];
 for(let index=0;index<count;index++){
  const size=(width<600?10:11)+random()*3;
  const blockWidth=Math.min(width-32,Math.max(...snippets[index%snippets.length].split('\n').map(line=>line.length))*size*.61);
  const blockHeight=size*1.55*(snippets[index%snippets.length].split('\n').length+1);
  let best,score=-Infinity;
  for(let attempt=0;attempt<40;attempt++){
   const x=16+random()*Math.max(0,width-blockWidth-32);
   const y=height*.09+random()*Math.max(0,height*.82-blockHeight);
   const clearance=items.reduce((gap,item)=>Math.min(gap,Math.hypot((x+blockWidth/2-item.x-item.blockWidth/2)/((blockWidth+item.blockWidth)/2+16),(y-item.y)/((blockHeight+item.blockHeight)/2+12))),Infinity);
   if(clearance>score){score=clearance;best={x,y};}
  }
  items.push({...best,blockWidth,blockHeight,size,opacity:(width<600?.14:.19)+random()*.14,speed:.72+random()*.65,phase:random()*7,drift:random()*Math.PI*2});
 }
 return items;
}
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
  const seed=Math.floor(Math.random()*4294967296);
  let width=0,height=0,time=0,frame=0,last=0,visible=true,layout=[];
  const running=()=>visible&&!document.hidden&&root.classList.contains('ambient-enabled');
  const rgba=(opacity,warm=false)=>warm?`rgba(191,169,132,${opacity})`:`rgba(139,211,222,${opacity})`;
  function code(){
   for(const [index,item] of layout.entries()){
    const {snippet,text}=codeFrame(time*item.speed+item.phase,index,snippets);
    let {size}=item;
    ctx.font=`${size}px monospace`;
    const fullLines=snippet.split('\n');
    const fullWidth=Math.max(...fullLines.map(line=>ctx.measureText(line).width));
    const fit=Math.min(1,(width-32)/Math.max(1,fullWidth));
    size*=fit;
    const x=Math.max(12,Math.min(width-fullWidth*fit-12,item.x+Math.sin(time*.12+item.drift)*5));
    const y=Math.max(size,Math.min(height-size*1.55*fullLines.length,item.y+Math.sin(time*.18+item.drift)*7));
    const influence=pointerInfluence(x+70,y,pointer,180);
    const opacity=item.opacity+influence*.35;
    ctx.font=`${size}px monospace`;
    const lines=text.split('\n');
    for(const [lineIndex,line] of lines.entries()){
     // Lightweight syntax colour, drawn inline without HTML or extra layers.
     let offset=0;
     for(const token of line.split(/(\b(?:const|auto|for|return|await|with|in|SELECT|FROM|WHERE|true)\b|"[^"]*"|\b\d+\b|[{}();:])/g)){
      ctx.fillStyle=/^(const|auto|for|return|await|with|in|SELECT|FROM|WHERE|true)$/.test(token)?`rgba(178,157,230,${opacity})`:/^["\d]/.test(token)?rgba(opacity,true):rgba(opacity);
      ctx.fillText(token,x+offset,y+lineIndex*size*1.55);
      offset+=ctx.measureText(token).width;
     }
    }
    if(text&&index%3===0&&Math.sin(time*4+item.phase)>0){ctx.fillStyle=rgba(opacity+.12);ctx.fillRect(x+ctx.measureText(lines.at(-1)).width+3,y+(lines.length-1)*size*1.55-size+2,2,size);}
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
   mask.addColorStop(0,`rgba(0,0,0,${width<600?.76:.6})`);mask.addColorStop(1,'rgba(0,0,0,0)');
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
   layout=codeLayout(width,height,snippets,seed);
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
