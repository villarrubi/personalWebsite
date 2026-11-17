import {createCircuit} from './intro-circuit.js';

const home=document.querySelector('.experience-hero');
const es=document.documentElement.lang==='es';
const query=new URLSearchParams(location.search);
const disabled=query.get('intro')==='off'||query.get('motion')==='off';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const DURATION=4800;
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
    <canvas class="intro-canvas" aria-hidden="true"></canvas>
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
  const targets=[home.querySelector('.experience-name'),home.querySelector('.experience-intro')].filter(Boolean);
  const progress=overlay.querySelector('.intro-progress i');
  let scene=null;
  if(trigger&&scrollY>20)window.scrollTo({top:0,left:0,behavior:'instant'});
  try{scene=createCircuit(overlay.querySelector('.intro-canvas'),targets);}catch{ /* Reveal the live heading if canvas is restricted. */ }
  let raf=0,elapsed=0,last=null,finished=false,watchdog=0;
  const finish=()=>{
    if(finished)return;finished=true;
    cancelAnimationFrame(raf);clearTimeout(watchdog);
    document.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',visibility);
    window.removeEventListener('wheel',preventScroll,true);window.removeEventListener('touchmove',preventScroll,true);
    scene?.dispose();overlay.remove();document.body.style.overflow=previousOverflow;
    underlying.forEach((el,i)=>el.inert=inertStates[i]);
    root.classList.remove('intro-playing');
    root.style.removeProperty('--intro-text');root.style.removeProperty('--intro-rest');
    clearPending();active=null;
    if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
    document.dispatchEvent(new Event('intro:end'));
  };
  const key=event=>{
    if(event.key==='Escape')finish();
    if(event.key==='Tab'){event.preventDefault();skip.focus({preventScroll:true});}
    if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(event.key)||
      ([' ','Spacebar'].includes(event.key)&&event.target!==skip))event.preventDefault();
  };
  const preventScroll=event=>{
    // Keep browser zoom and the skip button available; block page travel only.
    if(event.ctrlKey||event.metaKey||event.touches?.length>1)return;
    if(event.cancelable)event.preventDefault();
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
    let simple=reduced.matches||!scene;
    try{if(scene?.render(elapsed,simple)===false){finish();return;}}catch{scene?.dispose();scene=null;simple=true;}
    // These are the actual hero nodes: reveal them once and leave them in place.
    root.style.setProperty('--intro-text',String(clamp((elapsed-(simple?150:2750))/(simple?650:600))));
    root.style.setProperty('--intro-rest',String(clamp((elapsed-(simple?850:3450))/(simple?700:1250))));
    overlay.style.opacity=String(1-clamp((elapsed-(simple?1250:4400))/400));
    progress.style.transform=`scaleX(${clamp(elapsed/(simple?1650:DURATION))})`;
    overlay.dataset.phase=elapsed<1000?'circuit':elapsed<3350?'form':'reveal';
    armWatchdog();
    if(elapsed>=(simple?1650:DURATION))finish();else raf=requestAnimationFrame(frame);
  }
  active={finish};
  skip.addEventListener('click',finish);document.addEventListener('keydown',key,true);
  window.addEventListener('wheel',preventScroll,{capture:true,passive:false});
  window.addEventListener('touchmove',preventScroll,{capture:true,passive:false});
  document.addEventListener('visibilitychange',visibility);
  skip.focus({preventScroll:true});clearPending();
  armWatchdog();if(!document.hidden)raf=requestAnimationFrame(frame);
}

if(home){
  document.querySelectorAll('[data-intro]').forEach(button=>button.addEventListener('click',()=>playIntro(button)));
  if(disabled){clearPending();document.documentElement.classList.add('hero-enter');}else playIntro();
  window.addEventListener('pagehide',event=>{active?.finish();if(!event.persisted)disposed=true;});
  window.addEventListener('pageshow',event=>{if(event.persisted&&!disabled)playIntro();});
}else clearPending();
