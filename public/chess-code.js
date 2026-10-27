import {pageCodeMap} from './intro-page.js';

// One persistent grid: chess sculpture → white code → the actual page in code.
// Each cell resolves independently into the live DOM at its own coordinates.
export function createChessCode(T,renderer){
 const target=new T.WebGLRenderTarget(1,1,{type:renderer.extensions.has('EXT_color_buffer_float')?T.HalfFloatType:T.UnsignedByteType,depthBuffer:true});
 target.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
 const scene=new T.Scene(),camera=new T.Camera();
 const atlasCanvas=document.createElement('canvas');atlasCanvas.width=atlasCanvas.height=256;
 const ctx=atlasCanvas.getContext('2d'),symbols='01{}<>/=;+[]fn()';
 ctx.fillStyle='#fff';ctx.font='700 51px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
 for(let i=0;i<16;i++)ctx.fillText(symbols[i],(i%4)*64+32,Math.floor(i/4)*64+33);
 const atlas=new T.CanvasTexture(atlasCanvas);atlas.minFilter=T.LinearFilter;atlas.generateMipmaps=false;
 let pageTexture=new T.DataTexture(new Uint8Array([6,19,39,0]),1,1);pageTexture.needsUpdate=true;
 const uniforms={board:{value:target.texture},boardDepth:{value:target.depthTexture},sourceInverse:{value:new T.Matrix4()},sourceWorld:{value:new T.Matrix4()},atlas:{value:atlas},pageMap:{value:pageTexture},pageReady:{value:0},assemble:{value:0},progress:{value:0},appearance:{value:1},background:{value:0},reveal:{value:0},time:{value:0},grid:{value:new T.Vector2(1,1)}};
 const common=`
  uniform sampler2D board;uniform sampler2D atlas;uniform sampler2D pageMap;
  uniform sampler2D boardDepth;uniform mat4 sourceInverse;uniform mat4 sourceWorld;
  uniform float progress;uniform float appearance;uniform float background;uniform float assemble;uniform float pageReady;uniform float reveal;uniform float time;uniform vec2 grid;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float heightAt(vec2 source){vec4 view=sourceInverse*vec4(source*2.-1.,texture2D(boardDepth,source).x*2.-1.,1.);return (sourceWorld*(view/view.w)).y;}
  float conversion(vec2 cell){
   vec2 source=(cell+.5)/grid;
   float start=.08+source.x*.38+(1.-source.y)*.22+hash(cell)*.12;
   return smoothstep(start-.13,start+.13,progress*1.3-.15);
  }
  float assembly(vec2 cell){float seed=hash(cell+31.);return smoothstep(.02+seed*.12,.83+seed*.12,assemble)*pageReady;}
  float resolved(vec2 cell){
   float detail=texture2D(pageMap,(cell+.5)/grid).a;
   // Empty spaces dissolve first. Text/image cells keep their characters longer.
   float start=.10+hash(cell+17.)*.32+detail*.24;
   return smoothstep(start,start+.28,reveal);
  }
  float remaining(vec2 source){
   return 1.-resolved(floor(source*grid));
  }
 `;
 const screenVertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 // Background cells adopt the page palette as the same glyphs find its shapes.
 const fieldMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
  vertexShader:screenVertex,fragmentShader:`${common} varying vec2 vUv;
   void main(){
    // Keep the page's midnight blue throughout, including the scrollbar gutter.
    gl_FragColor=vec4(vec3(.00182,.00651,.02029),remaining(vUv));
    #include <colorspace_fragment>
   }`});
 const field=new T.Mesh(new T.PlaneGeometry(2,2),fieldMaterial);field.frustumCulled=false;field.renderOrder=-1;scene.add(field);
 const boardMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,
  vertexShader:screenVertex,fragmentShader:`${common} varying vec2 vUv;
   void main(){
    vec4 colour=texture2D(board,vUv);float converted=conversion(floor(vUv*grid));
    float light=dot(colour.rgb,vec3(.2126,.7152,.0722));light=light/(1.+light);
    float piece=smoothstep(.25,.36,heightAt(vUv));
    // A faint neutral volume keeps the piece contours between white glyphs.
    vec3 codedSurface=vec3(.17)*(.3+light);
    colour.rgb=mix(colour.rgb,codedSurface,converted);
    float opacity=mix(1.,.07+piece*.20,converted);
    gl_FragColor=vec4(colour.rgb,colour.a*opacity*appearance*remaining(vUv)*pow(1.-assemble,2.));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
 const plane=new T.Mesh(new T.PlaneGeometry(2,2),boardMaterial);plane.frustumCulled=false;scene.add(plane);
 const glyphMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
  vertexShader:`attribute vec2 origin;${common}
   varying vec2 vUv;varying float vAlpha;varying float vSymbol;varying vec3 vColour;
   void main(){
    vec2 cell=floor(origin*grid);float seed=hash(cell),columnSeed=hash(vec2(cell.x,91.));
    vec4 surface=texture2D(board,origin);
    float mask=smoothstep(.2,.85,surface.a),converted=conversion(cell);
    float luminance=dot(surface.rgb,vec3(.2126,.7152,.0722));
    vec3 neighbour=texture2D(board,origin+vec2(1.,0.)/grid).rgb;
    float edge=min(1.,length(surface.rgb-neighbour)*2.);
    float tone=luminance/(1.+luminance);
    float shading=clamp(smoothstep(.12,.72,tone)+edge*.15,0.,1.);
    float elevation=heightAt(origin);
    float piece=smoothstep(.25,.36,elevation)*mask;
    float contour=clamp((elevation-.225)/1.6,0.,1.);
    float form=mix(.035+shading*.72,.28+pow(max(tone,0.),.55)*.65+contour*.13+edge*.1,piece);
    float radius=length((origin-.5)*vec2(1.15,1.));
    float spread=smoothstep(radius-.10,radius+.10,background*1.2-.15-columnSeed*.06);
    float distance=fract(time*(.13+columnSeed*.12)+columnSeed-(1.-origin.y));
    float rain=exp(-distance*9.);
    float foreground=mask*converted;
    float ambient=(1.-mask)*spread;
    float strength=foreground+ambient;
    float brightness=mix(.025+rain*.58,form*(.9+rain*.1),foreground/max(strength,.001));
    vec4 destination=texture2D(pageMap,origin);
    float morph=assembly(cell),detail=smoothstep(.015,.18,destination.a);
    // The chess glyphs take on the destination's ink and colours. Stray symbols
    // vanish; the surviving field already describes the page before HTML shows.
    vec3 white=vec3(.015+brightness*1.45);
    vColour=mix(white,destination.rgb*mix(.3,1.65,detail),morph);
    float presence=mix(strength,detail,morph);
    // Slow the character substitutions as they settle, without reversing time.
    float ticking=min(time,5.8)+max(0.,time-5.8)*.12;
    float tick=floor(ticking*(4.+seed*5.)+columnSeed*13.);
    vSymbol=floor(hash(cell+vec2(tick,0.))*16.);
    vAlpha=presence*appearance*remaining(origin);vUv=uv;
    float settle=sin(morph*3.14159265);
    vec2 drift=vec2(seed-.5,hash(cell+8.)-.5)*settle*.65/grid;
    gl_Position=vec4((origin+drift)*2.-1.+position.xy*vec2(1.,1.12)/grid*2.,0.,1.);
   }`,
  fragmentShader:`uniform sampler2D atlas;varying vec2 vUv;varying float vAlpha;varying float vSymbol;varying vec3 vColour;
   void main(){
    vec2 tile=vec2(mod(vSymbol,4.),3.-floor(vSymbol/4.));
    float ink=texture2D(atlas,(tile+vUv)/4.).a;
    gl_FragColor=vec4(vColour,ink*vAlpha);
    #include <colorspace_fragment>
   }`});
 const glyphs=new T.Mesh(new T.InstancedBufferGeometry(),glyphMaterial);glyphs.frustumCulled=false;glyphs.renderOrder=2;scene.add(glyphs);
 let width=0,height=0,sourcePose='',guideSource;
 function resize(w,h,guide){
  if(w===width&&h===height)return;width=w;height=h;sourcePose='';
  const ratio=renderer.getPixelRatio();target.setSize(Math.round(w*ratio),Math.round(h*ratio));
  const columns=Math.ceil(w/(w<700?6:7)),rows=Math.ceil(h/(w<700?9:10));uniforms.grid.value.set(columns,rows);
  // A rotated/resized viewport must not use a stretched copy of the old layout.
  const validGuide=guide&&guide.width===w&&guide.height===h;
  uniforms.pageReady.value=validGuide?1:0;guideSource=guide;
  if(validGuide){
   pageTexture.dispose();pageTexture=new T.CanvasTexture(pageCodeMap(guide,columns,rows));
   pageTexture.colorSpace=T.SRGBColorSpace;pageTexture.minFilter=pageTexture.magFilter=T.NearestFilter;pageTexture.generateMipmaps=false;
   uniforms.pageMap.value=pageTexture;
  }
  const quad=new T.PlaneGeometry(1,1),geometry=new T.InstancedBufferGeometry();
  geometry.index=quad.index;geometry.attributes.position=quad.attributes.position;geometry.attributes.uv=quad.attributes.uv;
  const origins=[];
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)origins.push((x+.5)/columns,(y+.5)/rows);
  geometry.setAttribute('origin',new T.InstancedBufferAttribute(new Float32Array(origins),2));geometry.instanceCount=origins.length/2;
  glyphs.geometry.dispose();glyphs.geometry=geometry;
 }
 return {
  render(boardScene,boardCamera,pose,w,h,guide){
   if(guide!==guideSource)width=0;
   resize(w,h,guide);uniforms.progress.value=pose.dissolve||0;uniforms.appearance.value=pose.appearance??1;
   uniforms.assemble.value=pose.assemble||0;
   uniforms.background.value=pose.matrix||0;uniforms.reveal.value=pose.reveal||0;uniforms.time.value=pose.time||0;
   const currentPose=`${pose.pitch}/${pose.yaw}`;
   if(currentPose!==sourcePose){renderer.setRenderTarget(target);renderer.render(boardScene,boardCamera);uniforms.sourceInverse.value.copy(boardCamera.projectionMatrixInverse);uniforms.sourceWorld.value.copy(boardCamera.matrixWorld);sourcePose=currentPose;}
   renderer.setRenderTarget(null);renderer.render(scene,camera);
  },
  dispose(){target.dispose();atlas.dispose();pageTexture.dispose();field.geometry.dispose();fieldMaterial.dispose();plane.geometry.dispose();boardMaterial.dispose();glyphs.geometry.dispose();glyphMaterial.dispose();}
 };
}
