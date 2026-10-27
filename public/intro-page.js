// Capture only a colour/shape guide. The final pixels always belong to the live
// HTML below the effect, so font rendering and links never become a screenshot.
export async function captureIntroPage(signal) {
 const width=innerWidth,height=innerHeight;
 let cloneFrame;
 try {
  const [{default:html2canvas}]=await Promise.all([
   import('./assets/vendor/html2canvas.js'),document.fonts.ready,
   ...[...document.querySelectorAll('.hero img')].map(image=>image.decode().catch(()=>{})),
  ]);
  if(signal.aborted)return null;
  const canvas=await html2canvas(document.body,{
   backgroundColor:getComputedStyle(document.body).backgroundColor,
   width,height,x:scrollX,y:scrollY,scrollX,scrollY,windowWidth:width,windowHeight:height,
   scale:1,logging:false,imageTimeout:1800,
   ignoreElements:element=>{
    if(element.matches('.chess-intro,canvas,script,iframe'))return true;
    if(element.matches('section,.site-footer')){
     const rect=element.getBoundingClientRect();return rect.top>=height||rect.bottom<=0;
    }
    return false;
   },
   onclone:doc=>{
    cloneFrame=doc.defaultView.frameElement;
    doc.documentElement.classList.remove('intro-pending');
    const style=doc.createElement('style');
    style.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;color:transparent!important;text-shadow:none!important}';
    doc.head.append(style);
   },
  });
  if(signal.aborted){canvas.width=canvas.height=1;return null;}
  paintPageText(canvas);
  return canvas;
 } catch {
  // Capture is decorative: a restricted browser still gets a clean entrance.
  return null;
 } finally {
  cloneFrame?.remove();
 }
}

function paintPageText(canvas) {
 // DOM ranges give us the browser's actual wrapping/kerning and font baseline.
 // html2canvas's line-box baseline drifts noticeably with Instrument Serif.
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
