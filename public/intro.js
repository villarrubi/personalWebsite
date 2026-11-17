import {createCircuit} from './intro-circuit.js';

const home=document.querySelector('.experience-hero');
const es=document.documentElement.lang==='es';
const query=new URLSearchParams(location.search);
const disabled=query.get('intro')==='off'||query.get('motion')==='off';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const DURATION=5200;
let active=null,disposed=false;

function clearPending(){
  document.documentElement.classList.remove('intro-pending');
  window.cancelIntroBoot?.();
}

function playIntro(trigger){
  if(active||!home||disposed)return;
  const overlay=document.createElement('div');
  overlay.className='code-intro';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label',es?'Del código a las ideas. Animación de entrada.':'From code to ideas. Entrance animation.');
  overlay.innerHTML=`
    <div class="intro-atmosphere" aria-hidden="true"></div>
    <canvas class="intro-canvas" aria-hidden="true"></canvas>
    <div class="intro-meta" aria-hidden="true"><span>av.</span><span>SOFTWARE / ${es?'IA LOCAL':'LOCAL AI'} / HARDWARE</span></div>
    <div class="intro-signature" aria-hidden="true">
      <div class="intro-name"><span class="intro-name-line">Alejandro</span><em class="intro-name-line">Villarrubia</em></div>
      <span class="intro-tagline">${es?'LA CURIOSIDAD TOMA FORMA':'CURIOSITY TAKES SHAPE'}</span>
    </div>
    <div class="intro-caption" aria-hidden="true"><span class="intro-status-dot"></span><span>${es?'IDEAS CONECTADAS. POSIBILIDADES REALES.':'CONNECTED IDEAS. REAL POSSIBILITIES.'}</span></div>
    <div class="intro-progress" aria-hidden="true"><i></i></div>
    <button class="intro-skip" type="button">${es?'Saltar intro':'Skip intro'} <span aria-hidden="true">↗</span></button>`;
  const previousFocus=document.activeElement,previousOverflow=document.body.style.overflow;
  const underlying=[...document.body.children].filter(el=>el.tagName!=='SCRIPT');
  const inertStates=underlying.map(el=>el.inert);
  const root=document.documentElement;
  root.classList.remove('hero-enter');root.classList.add('intro-playing');
  document.body.style.overflow='hidden';
  document.body.append(overlay);underlying.forEach(el=>el.inert=true);
  const skip=overlay.querySelector('.intro-skip');
  const signature=overlay.querySelector('.intro-signature');
  const progress=overlay.querySelector('.intro-progress i');
  const tagline=overlay.querySelector('.intro-tagline');
  let scene=null;
  try{scene=createCircuit(overlay.querySelector('.intro-canvas'),signature);}catch{ /* Static signature remains available if canvas is restricted. */ }
  let raf=0,elapsed=0,last=null,finished=false,watchdog=0;
  const finish=()=>{
    if(finished)return;finished=true;
    cancelAnimationFrame(raf);clearTimeout(watchdog);
    document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);
    scene?.dispose();overlay.remove();document.body.style.overflow=previousOverflow;
    underlying.forEach((el,i)=>el.inert=inertStates[i]);
    root.classList.remove('intro-playing');clearPending();active=null;
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    document.dispatchEvent(new Event('intro:end'));
  };
  const key=event=>{
    if(event.key==='Escape')finish();
    if(event.key==='Tab'){event.preventDefault();skip.focus({preventScroll:true});}
  };
  const armWatchdog=()=>{clearTimeout(watchdog);if(!document.hidden)watchdog=setTimeout(finish,8000);};
  const visibility=()=>{
    last=null;cancelAnimationFrame(raf);armWatchdog();
    if(!document.hidden&&!finished)raf=requestAnimationFrame(frame);
  };
  const clamp=value=>Math.max(0,Math.min(1,value));
  function frame(now){
    if(finished||document.hidden)return;
    if(last!==null)elapsed+=Math.min(now-last,100);last=now;
    const simple=reduced.matches||!scene;
    try{scene?.render(elapsed,simple);}catch{scene?.dispose();scene=null;}
    const name=clamp((elapsed-(simple?250:3000))/(simple?700:750));
    signature.style.opacity=String(name);
    tagline.style.opacity=String(clamp((elapsed-(simple?450:3500))/500));
    overlay.style.opacity=String(1-clamp((elapsed-4400)/800));
    progress.style.transform=`scaleX(${clamp(elapsed/DURATION)})`;
    overlay.dataset.phase=elapsed<1650?'circuit':elapsed<3350?'form':elapsed<4400?'signature':'reveal';
    armWatchdog();
    if(elapsed>=DURATION)finish();else raf=requestAnimationFrame(frame);
  }
  active={finish};
  skip.addEventListener('click',finish);document.addEventListener('keydown',key);
  document.addEventListener('visibilitychange',visibility);
  skip.focus({preventScroll:true});clearPending();
  if(trigger&&scrollY>20)window.scrollTo({top:0,left:0,behavior:'instant'});
  armWatchdog();if(!document.hidden)raf=requestAnimationFrame(frame);
}

if(home){
  document.querySelectorAll('[data-intro]').forEach(button=>button.addEventListener('click',()=>playIntro(button)));
  if(disabled){clearPending();document.documentElement.classList.add('hero-enter');}else playIntro();
  window.addEventListener('pagehide',event=>{active?.finish();if(!event.persisted)disposed=true;});
  window.addEventListener('pageshow',event=>{if(event.persisted&&!disabled)playIntro();});
}else clearPending();
