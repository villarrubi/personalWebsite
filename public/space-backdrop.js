// Animated fog is drawn behind the opaque project sculptures. Dust stays in 3D.
export function createSpaceBackdrop(THREE,mobile){
 const group=new THREE.Group();
 const uniforms={time:{value:0},aspect:{value:1},pointer:{value:new THREE.Vector2()},palette:{value:0}};
 const fogMaterial=new THREE.ShaderMaterial({
  uniforms,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,transparent:false,
  vertexShader:`varying vec2 uvScreen;void main(){uvScreen=uv;gl_Position=vec4(position.xy,.99999,1.0);}`,
  fragmentShader:`
   varying vec2 uvScreen;uniform float time;uniform float aspect;uniform vec2 pointer;uniform float palette;
   float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
   float fbm(vec2 p){float f=0.,a=.5;for(int i=0;i<${mobile?3:4};i++){f+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(3.1,-1.7);a*=.5;}return f;}
   void main(){
    vec2 p=(uvScreen-.5)*vec2(aspect*1.55,1.55)+pointer*.08;
    float drift=time*.09;
    float flow=fbm(p*1.9+vec2(drift,-drift*.45));
    float density=fbm(p*3.1+vec2(flow*.65,-flow*.4)+vec2(-drift*.25,drift*.38));
    float ribbon=exp(-pow((p.y+.18*sin(p.x*1.5+time*.11)+flow*.35-.17)*2.8,2.));
    float cloud=smoothstep(.24,.78,density)*ribbon;
    float wisps=pow(smoothstep(.36,.79,flow),2.0)*exp(-length(p-vec2(.7,-.1))*.7);
    vec3 blue=mix(vec3(.025,.045,.085),vec3(.045,.062,.105),smoothstep(.22,.75,flow));
    vec3 silver=mix(vec3(.025,.05,.085),vec3(.055,.075,.10),flow);
    vec3 colour=mix(blue,silver,palette)*cloud*.65+vec3(.022,.034,.06)*wisps*.5;
    colour*=.65+.35*smoothstep(0.,.4,uvScreen.y);
    gl_FragColor=vec4(colour,1.);
    #include <colorspace_fragment>
   }`
 });
 const fog=new THREE.Mesh(new THREE.PlaneGeometry(2,2),fogMaterial);fog.frustumCulled=false;fog.renderOrder=-90;
 const fogScene=new THREE.Scene();fogScene.add(fog);
 const fogCamera=new THREE.Camera(),fogTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false,colorSpace:THREE.SRGBColorSpace});
 const screenFog=new THREE.Mesh(new THREE.PlaneGeometry(2,2),undefined);
 screenFog.material=new THREE.ShaderMaterial({uniforms:{map:{value:fogTarget.texture}},depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:fogMaterial.vertexShader,fragmentShader:'varying vec2 uvScreen;uniform sampler2D map;void main(){gl_FragColor=texture2D(map,uvScreen);\n#include <colorspace_fragment>\n}'});
 screenFog.frustumCulled=false;screenFog.renderOrder=-90;group.add(screenFog);
 let seed=63451;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const positions=[],phases=[],sizes=[];
 for(let i=0;i<(mobile?90:220);i++){positions.push((random()-.5)*65,(random()-.5)*45,-16+random()*38);phases.push(random()*Math.PI*2);sizes.push(.22+random()*.5);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('phase',new THREE.Float32BufferAttribute(phases,1));geometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));
 const dustUniforms={time:{value:0},pointer:{value:new THREE.Vector2()},moving:{value:1}};
 const dustMaterial=new THREE.ShaderMaterial({uniforms:dustUniforms,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,
  vertexShader:`attribute float phase;attribute float size;uniform float time;uniform vec2 pointer;uniform float moving;varying float light;void main(){vec3 p=position;p.x+=sin(time*.07+phase)*1.2*moving+pointer.x*.45;p.y+=cos(time*.045+phase*1.7)*.9*moving-pointer.y*.3;p.z=mod(position.z+time*.9*moving+16.,38.)-16.;vec4 v=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*v;gl_PointSize=clamp(size*150./max(1.,-v.z),.6,2.7);light=(.1+.12*(.5+.5*sin(time*.65+phase)))*smoothstep(0.,8.,-v.z);}`,
  fragmentShader:`varying float light;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.55,.7,1.,light*pow(1.-d*2.,2.));}`
 });
 const dust=new THREE.Points(geometry,dustMaterial);dust.frustumCulled=false;group.add(dust);
 let colourMix=0;const pointerTarget=new THREE.Vector2();
 return {group,renderFog(renderer,width,height){
  const w=Math.max(1,Math.round(width*.5)),h=Math.max(1,Math.round(height*.5));
  if(fogTarget.width!==w||fogTarget.height!==h)fogTarget.setSize(w,h);
  renderer.setRenderTarget(fogTarget);renderer.render(fogScene,fogCamera);renderer.setRenderTarget(null);
 },update(time,pointer,side,aspect,moving,dt=1/60){
  colourMix=moving?colourMix+(Number(side)-colourMix)*(1-Math.exp(-dt*2.14)):Number(side);
  uniforms.time.value=time;uniforms.aspect.value=aspect;uniforms.palette.value=colourMix;
  pointerTarget.set(moving?pointer.x:0,moving?pointer.y:0);
  if(moving)uniforms.pointer.value.lerp(pointerTarget,1-Math.exp(-dt*4.35));
  dustUniforms.time.value=time;dustUniforms.moving.value=1;dustUniforms.pointer.value.copy(uniforms.pointer.value);
 }};
}
