const home=document.querySelector('.experience-hero');
const es=document.documentElement.lang==='es';
const query=new URLSearchParams(location.search);
const disabled=query.get('intro')==='off'||query.get('motion')==='off';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const DURATION=4600;
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
    <div class="intro-grid" aria-hidden="true"></div>
    <div class="intro-meta" aria-hidden="true"><span>av.</span><span>SOFTWARE / ${es?'IA LOCAL':'LOCAL AI'} / HARDWARE</span></div>
    <div class="intro-workspace" aria-hidden="true">
      <div class="intro-file"><span><i></i> curiosity.ts</span><span>01 — 03</span></div>
      <div class="intro-source">
        <div><span class="intro-line-number">01</span><code data-code-line></code></div>
        <div><span class="intro-line-number">02</span><code data-code-line></code></div>
        <div><span class="intro-line-number">03</span><code data-code-line></code></div>
      </div>
      <div class="intro-circuit">
        <svg viewBox="0 0 600 76" preserveAspectRatio="none"><path d="M300 0V32M100 76V42Q100 32 110 32H490Q500 32 500 42V76M300 32V76"/></svg>
        <div class="intro-nodes"><span><b>&lt;/&gt;</b>software</span><span><b>✳</b>${es?'ia local':'local ai'}</span><span><b>⌘</b>hardware</span></div>
      </div>
      <div class="intro-output"><span>↳</span> ${es?'La curiosidad toma forma.':'Curiosity takes shape.'}<i></i></div>
    </div>
    <div class="intro-signature" aria-hidden="true"><span>${es?'DE LA IDEA A LO REAL':'FROM IDEA TO REALITY'}</span><p>Alejandro <em>Villarrubia</em></p></div>
    <div class="intro-caption" aria-hidden="true"><span>ALEJANDRO VILLARRUBIA</span><p>${es?'Todo empieza con una idea.':'It starts with an idea.'}</p></div>
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
  const lines=[...overlay.querySelectorAll('[data-code-line]')];
  const code=['const idea = curiosity();','const tools = [software, ai, hardware];','build(idea, tools);'];
  const workspace=overlay.querySelector('.intro-workspace');
  const signature=overlay.querySelector('.intro-signature');
  const progress=overlay.querySelector('.intro-progress i');
  let raf=0,elapsed=0,last=null,finished=false,watchdog=0;
  const finish=()=>{
    if(finished)return;finished=true;
    cancelAnimationFrame(raf);clearTimeout(watchdog);
    document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);
    overlay.remove();document.body.style.overflow=previousOverflow;
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
    // Reduced motion keeps the sequence, with static code and gentle fades.
    const simple=reduced.matches;
    for(let i=0;i<lines.length;i++){
      const count=simple?code[i].length:Math.floor(clamp((elapsed-200-i*470)/430)*code[i].length);
      lines[i].textContent=code[i].slice(0,count);
      lines[i].classList.toggle('is-typing',!simple&&count>0&&count<code[i].length);
    }
    overlay.classList.toggle('is-connected',elapsed>=1550);
    overlay.classList.toggle('is-built',elapsed>=2100);
    const exit=clamp((elapsed-2750)/500),name=clamp((elapsed-3000)/550);
    workspace.style.opacity=String(1-exit);
    workspace.style.transform=simple?'none':`translateY(${-exit*18}px)`;
    signature.style.opacity=String(name);
    signature.style.transform=simple?'none':`translateY(${(1-name)*16}px)`;
    overlay.style.opacity=String(1-clamp((elapsed-3950)/650));
    progress.style.transform=`scaleX(${clamp(elapsed/DURATION)})`;
    overlay.dataset.phase=elapsed<1550?'code':elapsed<2750?'connect':elapsed<3950?'signature':'reveal';
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
