// Light coordinates are independent of resolution; pointer motion eases in the renderer.
export function metalLight(x,y,time){
 const clamp=value=>Math.max(-1,Math.min(1,Number.isFinite(value)?value:0));
 return {x:clamp(x)*.85+Math.sin(time*.22)*.12,y:-clamp(y)*.65+Math.cos(time*.17)*.08};
}

const vertex=`attribute vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision mediump float;
uniform vec2 resolution;
uniform vec2 light;
uniform float clock;
float grain(vec2 p){return fract(sin(dot(p,vec2(.129898,.173233)))*43.7585453);}
void main(){
 vec2 uv=gl_FragCoord.xy/resolution;
 float aspect=resolution.x/resolution.y;
 vec2 p=(uv-.5)*vec2(aspect,1.);
 // Broad, stationary folds in a satin sheet. Only its lighting moves.
 float a=p.x*2.4+p.y*.8;
 float b=p.y*3.3-p.x*.5;
 float c=p.x*6.5+p.y*2.;
 float dx=.384*cos(a)+.04*sin(b)+.2275*cos(c);
 float dy=.128*cos(a)-.264*sin(b)+.07*cos(c);
 vec3 normal=normalize(vec3(-dx,-dy,1.));
 vec3 view=vec3(0.,0.,1.);
 vec3 lamp=normalize(vec3(light.x*aspect*1.5,light.y*1.4,1.8)-vec3(p,0.));
 vec3 rim=normalize(vec3(-aspect*.9+sin(clock*.12)*.2,.8,1.4)-vec3(p,0.));
 float broad=pow(max(dot(normal,normalize(lamp+view)),0.),12.);
 float specular=pow(max(dot(normal,normalize(lamp+view)),0.),65.);
 float warm=pow(max(dot(normal,normalize(rim+view)),0.),48.);
 float diffuse=max(dot(normal,lamp),0.);
 vec3 color=vec3(.018,.052,.085)+vec3(.025,.065,.075)*diffuse;
 color+=vec3(.055,.15,.19)*broad+vec3(.22,.44,.49)*specular;
 color+=vec3(.31,.20,.095)*warm;
 // Fine horizontal brushing, rather than visible contour lines.
 float texture=(grain(floor(uv*vec2(170.,1600.)))-.5)*.012;
 color+=texture;
 float edge=1.-smoothstep(.22,.85,length((uv-.5)*vec2(1.,1.3)));
 color*=.65+.35*edge;
 gl_FragColor=vec4(color,1.);
}`;

const canvas=typeof document!=='undefined'?document.querySelector('.hero-metal'):null;
if(canvas){
 const hero=canvas.closest('.experience-hero'),root=document.documentElement;
 let gl=null,program=null,uniforms=null,ready=false,frame=0,last=0,time=0,visible=true;
 const pointer={x:0,y:0,tx:0,ty:0};
 const running=()=>visible&&!document.hidden&&root.classList.contains('ambient-enabled');
 function initialise(){
  try{
   gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
   if(!gl)return false;
   const compile=(type,source)=>{
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Metal shader compilation failed');}
    return shader;
   };
   const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
   program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
   gl.deleteShader(vs);gl.deleteShader(fs);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Metal shader linking failed');
   gl.useProgram(program);
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
   const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
   uniforms={resolution:gl.getUniformLocation(program,'resolution'),light:gl.getUniformLocation(program,'light'),clock:gl.getUniformLocation(program,'clock')};
   return true;
  }catch{return false;}
 }
 function draw(dt=0){
  time+=dt;
  const blend=dt?1-Math.exp(-dt*5):1;
  pointer.x+=(pointer.tx-pointer.x)*blend;pointer.y+=(pointer.ty-pointer.y)*blend;
  const light=metalLight(pointer.x,pointer.y,time);
  if(ready){
   gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
   gl.uniform2f(uniforms.light,light.x,light.y);gl.uniform1f(uniforms.clock,time);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }else{
   // CSS reflections still respond on devices without WebGL.
   canvas.style.setProperty('--metal-x',`${50+light.x*35}%`);
   canvas.style.setProperty('--metal-y',`${50-light.y*35}%`);
  }
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
  const bounds=hero.getBoundingClientRect();
  const ratio=Math.min(devicePixelRatio||1,1,1200/Math.max(1,bounds.width));
  canvas.width=Math.max(1,Math.round(bounds.width*ratio));canvas.height=Math.max(1,Math.round(bounds.height*ratio));
  if(ready)gl.viewport(0,0,canvas.width,canvas.height);
  draw();sync();
 }
 hero.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||!running())return;
  const bounds=hero.getBoundingClientRect();
  pointer.tx=(event.clientX-bounds.left)/Math.max(1,bounds.width)*2-1;
  pointer.ty=(event.clientY-bounds.top)/Math.max(1,bounds.height)*2-1;
 },{passive:true});
 hero.addEventListener('pointerleave',()=>{pointer.tx=0;pointer.ty=0;});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;draw();sync();});
 canvas.addEventListener('webglcontextrestored',()=>{ready=initialise();resize();});
 document.addEventListener('visibilitychange',sync);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['class']});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(hero);else addEventListener('resize',resize,{passive:true});
 addEventListener('pageshow',sync);
 ready=initialise();resize();
}
