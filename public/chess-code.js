// The code is emitted from the rendered board's silhouette, in one GPU draw call.
// The same dissolve wave removes the wood and reveals the corresponding glyphs.
export function createChessCode(T,renderer){
 const target=new T.WebGLRenderTarget(1,1,{type:renderer.extensions.has('EXT_color_buffer_float')?T.HalfFloatType:T.UnsignedByteType,depthBuffer:true});
 const scene=new T.Scene(),camera=new T.Camera();
 const atlasCanvas=document.createElement('canvas');atlasCanvas.width=atlasCanvas.height=256;
 const ctx=atlasCanvas.getContext('2d'),symbols='01{}<>/=;+[]fn()';
 ctx.fillStyle='#fff';ctx.font='500 45px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 for(let i=0;i<16;i++)ctx.fillText(symbols[i],(i%4)*64+32,Math.floor(i/4)*64+33);
 const atlas=new T.CanvasTexture(atlasCanvas);atlas.minFilter=T.LinearFilter;atlas.generateMipmaps=false;
 const uniforms={board:{value:target.texture},atlas:{value:atlas},progress:{value:0},appearance:{value:1},grid:{value:new T.Vector2(1,1)}};
 const wave=`
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float ageAt(vec2 cell){
   vec2 source=(cell+.5)/grid;
   float start=.08+source.x*.38+(1.-source.y)*.22+hash(cell)*.12;
   return clamp((progress*1.5-start)/(1.5-start),0.,1.);
  }
 `;
 const boardMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D board;uniform float progress;uniform float appearance;uniform vec2 grid;varying vec2 vUv;
   ${wave}
   void main(){
    vec4 colour=texture2D(board,vUv);
    float age=ageAt(floor(vUv*grid));
    float erase=smoothstep(0.,.20,age);
    colour.rgb=mix(colour.rgb,vec3(.35,.78,.85),erase*.35);
    gl_FragColor=vec4(colour.rgb,colour.a*(1.-erase)*appearance);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
 const plane=new T.Mesh(new T.PlaneGeometry(2,2),boardMaterial);plane.frustumCulled=false;scene.add(plane);
 const glyphMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
  vertexShader:`attribute vec2 origin;attribute float symbol;uniform sampler2D board;uniform float progress;uniform float appearance;uniform vec2 grid;
   varying vec2 vUv;varying float vAlpha;varying float vSymbol;varying float vLight;
   ${wave}
   void main(){
    vec2 cell=floor(origin*grid);float seed=hash(cell),age=ageAt(cell);
    vec4 sampleColour=texture2D(board,origin);
    float departure=smoothstep(.12,1.,age);
    vec2 drift=vec2((.07+seed*.17)*departure, (.1+seed*.16)*departure);
    drift.x+=sin(age*4.+seed*6.28)*.025*departure;
    vec2 centre=origin+drift;
    vec2 extent=vec2(.8,1.05)/grid;
    gl_Position=vec4(centre*2.-1.+position.xy*extent*2.,0.,1.);
    vUv=uv;vSymbol=symbol;vLight=seed;
    vAlpha=smoothstep(.15,.8,sampleColour.a)*smoothstep(0.,.16,age)*(1.-smoothstep(.38,1.,age))*appearance;
   }`,
  fragmentShader:`uniform sampler2D atlas;varying vec2 vUv;varying float vAlpha;varying float vSymbol;varying float vLight;
   void main(){
    vec2 tile=vec2(mod(vSymbol,4.),3.-floor(vSymbol/4.));
    float ink=texture2D(atlas,(tile+vUv)/4.).a;
    gl_FragColor=vec4(mix(vec3(.25,.62,.7),vec3(.83,.94,.93),vLight),ink*vAlpha);
    #include <colorspace_fragment>
   }`});
 const glyphs=new T.Mesh(new T.InstancedBufferGeometry(),glyphMaterial);glyphs.frustumCulled=false;glyphs.renderOrder=2;scene.add(glyphs);
 let width=0,height=0,sourcePose='';
 function resize(w,h){
  if(w===width&&h===height)return;width=w;height=h;sourcePose='';
  const ratio=renderer.getPixelRatio();target.setSize(Math.round(w*ratio),Math.round(h*ratio));
  const columns=Math.ceil(w/(w<700?13:16)),rows=Math.ceil(h/20);uniforms.grid.value.set(columns,rows);
  const quad=new T.PlaneGeometry(1,1),geometry=new T.InstancedBufferGeometry();
  geometry.index=quad.index;geometry.attributes.position=quad.attributes.position;geometry.attributes.uv=quad.attributes.uv;
  const origins=[],indices=[];
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){origins.push((x+.5)/columns,(y+.5)/rows);indices.push((x*7+y*11)%16);}
  geometry.setAttribute('origin',new T.InstancedBufferAttribute(new Float32Array(origins),2));
  geometry.setAttribute('symbol',new T.InstancedBufferAttribute(new Float32Array(indices),1));geometry.instanceCount=indices.length;
  glyphs.geometry.dispose();glyphs.geometry=geometry;
 }
 return {
  render(boardScene,boardCamera,pose,w,h){
   resize(w,h);uniforms.progress.value=pose.dissolve||0;uniforms.appearance.value=pose.appearance??1;
   const currentPose=`${pose.pitch}/${pose.yaw}`;
   // Once the camera settles, the board image is fixed. Only animate the code.
   if(currentPose!==sourcePose){renderer.setRenderTarget(target);renderer.render(boardScene,boardCamera);sourcePose=currentPose;}
   renderer.setRenderTarget(null);renderer.render(scene,camera);
  },
  dispose(){target.dispose();atlas.dispose();plane.geometry.dispose();boardMaterial.dispose();glyphs.geometry.dispose();glyphMaterial.dispose();}
 };
}
