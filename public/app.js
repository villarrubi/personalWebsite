const lang=document.documentElement.lang;
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label',lang==='es'?'Abrir navegación':'Open navigation');nav?.classList.remove('open');}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',lang==='es'?(open?'Cerrar navegación':'Abrir navegación'):(open?'Close navigation':'Open navigation'));nav.classList.toggle('open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});

const copyButton=document.querySelector('.copy-email');let toastTimeout;
copyButton?.addEventListener('click',async()=>{const toast=document.querySelector('#toast');try{await navigator.clipboard.writeText(copyButton.dataset.email);toast.textContent=copyButton.dataset.success;}catch{toast.textContent=copyButton.dataset.failure;}toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),3000);});

const sections=[...document.querySelectorAll('section[id]')];
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const target=entry.target.id==='home'?'top':['archive','complementary','project-orbital-scene'].includes(entry.target.id)?'projects':entry.target.id;nav?.querySelectorAll('a').forEach(a=>{if(a.hash===`#${target}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-10% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));}

// A language change keeps the current section on the home page.
const languageLink=document.querySelector('.language-switch');
languageLink?.addEventListener('click',()=>{if(!location.pathname.includes('/projects/')&&location.hash)languageLink.hash=location.hash;});

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
if('IntersectionObserver'in window&&!reduceMotion.matches){
 const revealObserver=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
 },{threshold:.06});
 for(const element of document.querySelectorAll('.project-card,.about-layout,.section-heading')){
  if(element.getBoundingClientRect().top>innerHeight){element.classList.add('reveal-ready');revealObserver.observe(element);}
 }
 reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches){document.querySelectorAll('.reveal-ready').forEach(el=>el.classList.add('is-visible'));revealObserver.disconnect();}});
}

import './intro.js';

import './project-map.js';
