// Capture only a colour/shape guide. The final pixels always belong to the live
// HTML below the effect, so font rendering and links never become a screenshot.
// Painted directly from computed styles: cloning the whole document (html2canvas)
// froze the main thread once the orbital WebGL scene was running.
export async function captureIntroPage(signal) {
 const width=innerWidth,height=innerHeight;
 try {
  await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,1200))]);
  if(signal.aborted)return null;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=getComputedStyle(document.body).backgroundColor;ctx.fillRect(0,0,width,height);
  paintPageBoxes(ctx,width,height);
  if(signal.aborted){canvas.width=canvas.height=1;return null;}
  paintPageText(canvas);
  return canvas;
 } catch {
  // Capture is decorative: a restricted browser still gets a clean entrance.
  return null;
 }
}

const transparent=color=>!color||color==='transparent'||/rgba\([^)]*,\s*0\)$/.test(color);
// Solid backgrounds, borders and images of what is on screen: enough for the code
// grid to take the shape of buttons, rules and the header before the page appears.
function paintPageBoxes(ctx,width,height){
 const skip='.chess-intro,script,style,canvas,svg,noscript,template,[hidden]';
 for(const element of document.body.querySelectorAll('*')){
  if(element.closest(skip))continue;
  const rect=element.getBoundingClientRect();
  if(!rect.width||!rect.height||rect.bottom<=0||rect.top>=height||rect.right<=0||rect.left>=width)continue;
  const style=getComputedStyle(element);
  if(style.visibility!=='visible'||style.display==='none'||Number(style.opacity)===0)continue;
  const radius=Math.min(parseFloat(style.borderTopLeftRadius)||0,rect.width/2,rect.height/2);
  ctx.globalAlpha=Number(style.opacity);
  if(!transparent(style.backgroundColor)){
   ctx.fillStyle=style.backgroundColor;ctx.beginPath();ctx.roundRect(rect.left,rect.top,rect.width,rect.height,radius);ctx.fill();
  }
  if(element instanceof HTMLImageElement&&element.complete&&element.naturalWidth){
   try{ctx.drawImage(element,rect.left,rect.top,rect.width,rect.height);}catch{}
  }
  const sides=[['Top',rect.left,rect.top,rect.width,'h'],['Bottom',rect.left,rect.bottom,rect.width,'h'],['Left',rect.left,rect.top,rect.height,'v'],['Right',rect.right,rect.top,rect.height,'v']];
  const uniform=['Top','Right','Bottom','Left'].every(side=>style[`border${side}Width`]===style.borderTopWidth&&style[`border${side}Color`]===style.borderTopColor&&style[`border${side}Style`]!=='none');
  if(uniform&&radius&&parseFloat(style.borderTopWidth)>0&&!transparent(style.borderTopColor)){
   const w=parseFloat(style.borderTopWidth);
   ctx.strokeStyle=style.borderTopColor;ctx.lineWidth=w;ctx.beginPath();ctx.roundRect(rect.left+w/2,rect.top+w/2,rect.width-w,rect.height-w,Math.max(0,radius-w/2));ctx.stroke();
  }else for(const [side,x,y,length,axis] of sides){
   const w=parseFloat(style[`border${side}Width`]);
   if(!w||style[`border${side}Style`]==='none'||transparent(style[`border${side}Color`]))continue;
   ctx.fillStyle=style[`border${side}Color`];
   if(axis==='h')ctx.fillRect(x,side==='Bottom'?y-w:y,length,w);else ctx.fillRect(side==='Right'?x-w:x,y,w,length);
  }
 }
 ctx.globalAlpha=1;
}

function paintPageText(canvas) {
 // DOM ranges give us the browser's actual wrapping/kerning and font baseline.
 // Measured per grapheme so wrapping and the serif's baseline stay exact.
 const ctx=canvas.getContext('2d'),walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const range=document.createRange(),metrics=new Map();
 const segmenter=new Intl.Segmenter(document.documentElement.lang,{granularity:'grapheme'});
 for(let node=walker.nextNode();node;node=walker.nextNode()){
  const parent=node.parentElement;
  if(!node.textContent.trim()||parent.closest('.chess-intro,script,style,canvas,svg,[hidden]'))continue;
  const style=getComputedStyle(parent);
  if(style.visibility!=='visible'||style.display==='none'||style.opacity==='0')continue;
  range.selectNodeContents(node);
  const bounds=range.getBoundingClientRect();
  if(bounds.bottom<=0||bounds.top>=canvas.height||!bounds.width)continue;
  ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if(!metrics.has(ctx.font))metrics.set(ctx.font,ctx.measureText('Mg').fontBoundingBoxAscent);
  ctx.fillStyle=style.color;ctx.globalAlpha=Number(style.opacity);ctx.textBaseline='alphabetic';
  const ascent=metrics.get(ctx.font);
  for(const {segment,index} of segmenter.segment(node.textContent)){
   if(!segment.trim())continue;
   range.setStart(node,index);range.setEnd(node,index+segment.length);
   const rect=range.getBoundingClientRect();
   if(rect.bottom<=0||rect.top>=canvas.height||!rect.width)continue;
   const text=style.textTransform==='uppercase'?segment.toUpperCase():style.textTransform==='lowercase'?segment.toLowerCase():segment;
   ctx.fillText(text,rect.left,rect.top+ascent);
  }
 }
}

// Keep thin strokes when reducing the page to the code grid. Averaging alone
// loses the serif title; a centre sample can miss it altogether.
export function pageCodeMap(canvas,columns,rows) {
 const map=document.createElement('canvas');map.width=columns;map.height=rows;
 const ctx=map.getContext('2d'),out=ctx.createImageData(columns,rows);
 const source=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data;
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
  const x0=Math.floor(x*canvas.width/columns),x1=Math.floor((x+1)*canvas.width/columns);
  const y0=Math.floor(y*canvas.height/rows),y1=Math.floor((y+1)*canvas.height/rows);
  let r=0,g=0,b=0,weight=0,ink=0;
  for(let sy=y0;sy<y1;sy++)for(let sx=x0;sx<x1;sx++){
   const i=(sy*canvas.width+sx)*4;
   const light=(source[i]*.2126+source[i+1]*.7152+source[i+2]*.0722)/255;
   const w=.025+Math.max(0,light-.14)**2;
   r+=source[i]*w;g+=source[i+1]*w;b+=source[i+2]*w;weight+=w;
   ink+=Math.max(0,light-.14);
  }
  const i=(y*columns+x)*4,count=Math.max(1,(x1-x0)*(y1-y0));
  out.data[i]=r/weight;out.data[i+1]=g/weight;out.data[i+2]=b/weight;
  out.data[i+3]=Math.min(255,ink/count*1100);
 }
 ctx.putImageData(out,0,0);return map;
}
