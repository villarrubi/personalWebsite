const names=['pawn','rook','knight','bishop','queen','king'];
export async function loadStauntonGeometry(T){
  const response=await fetch('/assets/chess/staunton.bin');
  if(!response.ok)throw new Error(`Staunton geometry: HTTP ${response.status}`);
  return parseStauntonGeometry(T,await response.arrayBuffer());
}
export function parseStauntonGeometry(T,bytes){
  const view=new DataView(bytes);
  if(view.getUint32(0,true)!==0x314e5453||view.getUint32(4,true)!==6)throw new Error('Invalid Staunton geometry');
  const geometries={};let offset=8;
  const align=()=>{offset=(offset+3)&~3;};
  for(const name of names){
    const vertices=view.getUint32(offset,true),indices=view.getUint32(offset+4,true);offset+=8;
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(bytes,offset,vertices*3),3));offset+=vertices*12;
    geometry.setAttribute('normal',new T.BufferAttribute(new Int8Array(bytes,offset,vertices*3),3,true));offset+=vertices*3;align();
    geometry.setIndex(new T.BufferAttribute(new Uint16Array(bytes,offset,indices),1));offset+=indices*2;align();
    geometry.computeBoundingSphere();geometries[name]=geometry;
  }
  return geometries;
}

// Volumetric grain follows the carved surfaces, including the end grain on top.
// Linear colour uniforms are used inside Three's physically based shader.
export function woodMaterial(T,light,dark,{board=false,roughness=.4}={}){
  const material=new T.MeshPhysicalMaterial({color:0xffffff,metalness:0,roughness,
    clearcoat:.16,clearcoatRoughness:.32,envMapIntensity:.65});
  material.onBeforeCompile=shader=>{
    shader.uniforms.woodLight={value:new T.Color(light)};
    shader.uniforms.woodDark={value:new T.Color(dark)};
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWoodPosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWoodPosition=(modelMatrix*vec4(position,1.0)).xyz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vWoodPosition;uniform vec3 woodLight;uniform vec3 woodDark;
      float grainHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
      float grainNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
        return mix(mix(mix(grainHash(i),grainHash(i+vec3(1,0,0)),f.x),mix(grainHash(i+vec3(0,1,0)),grainHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(grainHash(i+vec3(0,0,1)),grainHash(i+vec3(1,0,1)),f.x),mix(grainHash(i+vec3(0,1,1)),grainHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float woodGrain(vec3 point){
        vec3 p=${board?'point.xzy':'point'};p.y*=.065;
        float warp=grainNoise(p*3.5)*.13+grainNoise(p*8.)*.025;
        float ring=length(p.xz+vec2(1.7,.3))+warp;
        float growth=sin(ring*155.);
        float pores=grainNoise(p*vec3(180.,12.,180.));
        float latewood=smoothstep(.35,.94,growth);
        return clamp(.2+latewood*.1+pores*.06+grainNoise(p*2.)*.16,0.,1.);
      }`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float grain=woodGrain(vWoodPosition);diffuseColor.rgb*=mix(woodLight,woodDark,grain);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(grain-.5)*.09,.25,.6);');
  };
  material.customProgramCacheKey=()=>`staunton-wood-v1-${board?'board':'piece'}`;
  return material;
}
