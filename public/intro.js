import {introPose, INTRO_DURATION} from './chess-timeline.js';
import {sceneMotion} from './scene-motion.js';
import {captureIntroPage} from './intro-page.js';

const host=document.querySelector('[data-chess-stage]');
const es=document.documentElement.lang==='es';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const requested=new URLSearchParams(location.search).get('intro');
const forced=['cinematic','squares','knight'].includes(requested);
const controls=[...document.querySelectorAll('[data-intro]')];
let scene,loading,active,disposed=false;

function clearPending(){document.documentElement.classList.remove('intro-pending');clearTimeout(window.chessIntroWatchdog);}
async function getScene(){
  if(scene)return scene;
  if(!loading)loading=import('./chess-scene.js').then(module=>module.createChessScene(document.querySelector('.chess-canvas'))).then(result=>{
    if(disposed){result.dispose();return null;}
    scene=result;host.classList.add('chess-ready');
    if(!active)scene.render({pitch:Math.PI/2,yaw:0,dock:1});
    return scene;
  }).catch(error=>{
    host.dataset.render='fallback';
    console.warn('Chess scene unavailable; static board retained.',error);
    return null;
  });
  return loading;
}
function seen(){try{if(localStorage.getItem('chess-opening-seen')==='1')return true;}catch{}try{return sessionStorage.getItem('chess-opening-seen')==='1';}catch{return false;}}
function remember(){try{localStorage.setItem('chess-opening-seen','1');}catch{}try{sessionStorage.setItem('chess-opening-seen','1');}catch{}}

async function playIntro(trigger){
  if(active||!host||disposed)return;
  const still=!trigger&&!forced&&(reduced.matches||sceneMotion.matches);
  const overlay=document.createElement('div');overlay.className='chess-intro';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label',es?'Del ajedrez al código. Animación de entrada.':'From chess to code. Entrance animation.');
  overlay.innerHTML=`<div class="intro-curtain"></div><div class="intro-meta"><span>av.</span><span>SOFTWARE / ${es?'IA LOCAL':'LOCAL AI'} / HARDWARE</span></div><div class="intro-caption"><span>ALEJANDRO VILLARRUBIA</span><p>${es?'Curiosidad para construir.':'Curiosity to build.'}</p></div><div class="intro-progress" aria-hidden="true"><i></i></div><button class="intro-skip" type="button">${es?'Saltar intro':'Skip intro'} <span aria-hidden="true">↗</span></button>`;
  const mount=host.querySelector('.chess-canvas');
  const previousFocus=document.activeElement,previousOverflow=document.body.style.overflow;
  const previousScroll=scrollY;
  const underlying=[...document.body.children].filter(el=>el.tagName!=='SCRIPT');
  const inertStates=underlying.map(el=>el.inert);
  document.body.style.overflow='hidden';
  document.documentElement.classList.add('intro-playing');
  // The code is rebuilt into the layout below before handing it back to HTML.
  document.body.append(overlay);overlay.append(mount);
  underlying.forEach(el=>el.inert=true);
  Object.assign(mount.style,{position:'fixed',left:'0px',top:'0px',width:'100vw',height:'100dvh',opacity:'0'});
  const skip=overlay.querySelector('.intro-skip');
  const curtain=overlay.querySelector('.intro-curtain'),meta=overlay.querySelector('.intro-meta'),caption=overlay.querySelector('.intro-caption'),progress=overlay.querySelector('.intro-progress i');
  let raf=0,watchdog,elapsed=0,last=0,started=false,finished=false;
  const captureController=new AbortController();
  const finish=()=>{
    if(finished)return;finished=true;
    cancelAnimationFrame(raf);clearTimeout(watchdog);captureController.abort();
    document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);
    host.prepend(mount);mount.removeAttribute('style');overlay.remove();
    document.body.style.overflow=previousOverflow;
    underlying.forEach((el,i)=>el.inert=inertStates[i]);
    document.documentElement.classList.remove('intro-playing');clearPending();
    scene?.render({pitch:Math.PI/2,yaw:0,dock:1});
    active=null;remember();
    if(trigger)previousFocus?.focus({preventScroll:true});
    else if(document.activeElement===document.body)document.querySelector('.hero-actions .primary')?.focus({preventScroll:true});
    document.dispatchEvent(new Event('chess:intro-end'));
  };
  const key=event=>{if(event.key==='Escape')finish();if(event.key==='Tab'){event.preventDefault();skip.focus({preventScroll:true});}};
  const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);}else if(started&&!finished){raf=requestAnimationFrame(frame);}};
  active={finish};watchdog=setTimeout(finish,14000);
  skip.addEventListener('click',finish);document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
  skip.focus({preventScroll:true});clearPending();
  if(trigger&&previousScroll>20)window.scrollTo({top:0,left:0,behavior:'instant'});
  // Prepare the guide before animation starts, avoiding a capture stutter halfway.
  let captureTimer;
  const guidePromise=Promise.race([
    captureIntroPage(captureController.signal),
    new Promise(resolve=>{captureTimer=setTimeout(()=>{captureController.abort();resolve(null);},3500);}),
  ]).finally(()=>clearTimeout(captureTimer));
  const [renderScene,pageGuide]=await Promise.all([getScene(),guidePromise]);
  if(finished)return;
  if(!renderScene){finish();return;}
  renderScene.setPageGuide(pageGuide);
  overlay.dataset.pageGuide=pageGuide?'ready':'fallback';
  overlay.classList.add('is-ready');started=true;
  clearTimeout(watchdog);watchdog=setTimeout(finish,INTRO_DURATION+5000);
  function frame(now){
    if(finished||document.hidden)return;
    if(last)elapsed+=Math.min(now-last,250);last=now;
    const pose=still?{pitch:.88,yaw:0,dock:0,appearance:1-Math.min(1,elapsed/650),dissolve:0,reveal:Math.min(1,elapsed/650),caption:0,controls:0,progress:1}:introPose(elapsed);
    meta.style.opacity=pose.caption;caption.style.opacity=pose.caption;
    progress.style.transform=`scaleX(${pose.progress})`;
    progress.parentElement.style.opacity=pose.controls;skip.style.opacity=pose.controls;
    renderScene.render(pose,innerWidth,innerHeight);mount.style.opacity='1';curtain.style.opacity='0';
    overlay.dataset.phase=pose.reveal>0?'reveal':pose.assemble>0?'assemble':pose.matrix>0?'matrix':pose.dissolve>0?'board-code':'board';
    if(elapsed>=(still?650:INTRO_DURATION))finish();else raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
}

if(host){
  controls.forEach(button=>button.addEventListener('click',()=>playIntro(button)));
  host.querySelector('.chess-canvas').addEventListener('chess:lost',()=>{active?.finish();host.classList.remove('chess-ready');scene?.dispose();scene=null;loading=null;});
  const observer=new ResizeObserver(()=>{if(!active)scene?.render();});observer.observe(host);
  const motionChanged=()=>{if(reduced.matches||sceneMotion.matches)active?.finish();};
  reduced.addEventListener('change',motionChanged);sceneMotion.addEventListener('change',motionChanged);
  if(forced||(!seen()&&!location.hash&&!reduced.matches&&!sceneMotion.matches))playIntro();
  else {if(seen())remember();clearPending();getScene();}
  window.addEventListener('pagehide',event=>{
    active?.finish();
    if(!event.persisted){disposed=true;observer.disconnect();scene?.dispose();}
  });
  window.addEventListener('pageshow',event=>{if(event.persisted&&!active)scene?.render();});
}else clearPending();
