import {introPose, INTRO_DURATION} from './chess-timeline.js';
import {captureIntroPage} from './intro-page.js';

const home=document.querySelector('.experience-hero');
const es=document.documentElement.lang==='es';
const query=new URLSearchParams(location.search);
const requested=query.get('intro');
const forced=['cinematic','squares','knight'].includes(requested);
const disabled=requested==='off'||query.get('motion')==='off';
const reloading=performance.getEntriesByType('navigation')[0]?.type==='reload';
const controls=[...document.querySelectorAll('[data-intro]')];
let scene,active,disposed=false;

function clearPending(){document.documentElement.classList.remove('intro-pending');clearTimeout(window.chessIntroWatchdog);}
async function getScene(mount,isFinished){
  return import('./chess-scene.js').then(module=>module.createChessScene(mount)).then(result=>{
    if(disposed||isFinished()){result.dispose();return null;}
    scene=result;
    return scene;
  }).catch(error=>{
    console.warn('Chess intro unavailable; showing the page.',error);
    return null;
  });
}
async function playIntro(trigger){
  if(active||!home||disposed)return;
  const overlay=document.createElement('div');overlay.className='chess-intro';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label',es?'Del ajedrez al código. Animación de entrada.':'From chess to code. Entrance animation.');
  overlay.innerHTML=`<div class="intro-curtain"></div><div class="intro-meta"><span>av.</span><span>SOFTWARE / ${es?'IA LOCAL':'LOCAL AI'} / HARDWARE</span></div><div class="intro-caption"><span>ALEJANDRO VILLARRUBIA</span><p>${es?'Curiosidad para construir.':'Curiosity to build.'}</p></div><div class="intro-progress" aria-hidden="true"><i></i></div><button class="intro-skip" type="button">${es?'Saltar intro':'Skip intro'} <span aria-hidden="true">↗</span></button>`;
  const mount=document.createElement('div');mount.className='chess-canvas';
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
    scene?.dispose();scene=null;overlay.remove();
    document.body.style.overflow=previousOverflow;
    underlying.forEach((el,i)=>el.inert=inertStates[i]);
    document.documentElement.classList.remove('intro-playing');clearPending();
    active=null;
    if(trigger)previousFocus?.focus({preventScroll:true});
    else if(document.activeElement===document.body)document.querySelector('.hero-actions .primary')?.focus({preventScroll:true});
    document.dispatchEvent(new Event('chess:intro-end'));
  };
  const key=event=>{if(event.key==='Escape')finish();if(event.key==='Tab'){event.preventDefault();skip.focus({preventScroll:true});}};
  const visibility=()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);}else if(started&&!finished){raf=requestAnimationFrame(frame);}};
  active={finish};watchdog=setTimeout(finish,14000);
  mount.addEventListener('chess:lost',finish,{once:true});
  skip.addEventListener('click',finish);document.addEventListener('keydown',key);document.addEventListener('visibilitychange',visibility);
  skip.focus({preventScroll:true});clearPending();
  if(trigger&&previousScroll>20)window.scrollTo({top:0,left:0,behavior:'instant'});
  // Prepare the guide before animation starts, avoiding a capture stutter halfway.
  let captureTimer;
  // On refresh, wait for restored scroll/hash positioning before sampling HTML.
  const pageReady=reloading&&document.readyState!=='complete'
    ?new Promise(resolve=>window.addEventListener('load',()=>setTimeout(resolve,0),{once:true}))
    :Promise.resolve();
  const guidePromise=Promise.race([
    pageReady.then(()=>captureIntroPage(captureController.signal)),
    new Promise(resolve=>{captureTimer=setTimeout(()=>{captureController.abort();resolve(null);},3500);}),
  ]).finally(()=>clearTimeout(captureTimer));
  const [renderScene,pageGuide]=await Promise.all([getScene(mount,()=>finished),guidePromise]);
  if(finished)return;
  if(!renderScene){finish();return;}
  renderScene.setPageGuide(pageGuide);
  overlay.dataset.pageGuide=pageGuide?'ready':'fallback';
  overlay.classList.add('is-ready');started=true;
  clearTimeout(watchdog);watchdog=setTimeout(finish,INTRO_DURATION+5000);
  function frame(now){
    if(finished||document.hidden)return;
    if(last)elapsed+=Math.min(now-last,250);last=now;
    const pose=introPose(elapsed);
    meta.style.opacity=pose.caption;caption.style.opacity=pose.caption;
    progress.style.transform=`scaleX(${pose.progress})`;
    progress.parentElement.style.opacity=pose.controls;skip.style.opacity=pose.controls;
    renderScene.render(pose,innerWidth,innerHeight);mount.style.opacity='1';curtain.style.opacity='0';
    overlay.dataset.phase=pose.reveal>0?'reveal':pose.assemble>0?'assemble':pose.matrix>0?'matrix':pose.dissolve>0?'board-code':'board';
    if(elapsed>=INTRO_DURATION)finish();else raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
}

if(home){
  controls.forEach(button=>button.addEventListener('click',()=>playIntro(button)));
  if(forced||((['','#top','#home'].includes(location.hash)||reloading)&&!disabled))playIntro();
  else clearPending();
  window.addEventListener('pagehide',event=>{
    active?.finish();
    if(!event.persisted)disposed=true;
  });
}else clearPending();
