const lang=document.documentElement.lang;
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('#main-nav');
function closeMenu(){toggle?.setAttribute('aria-expanded','false');toggle?.setAttribute('aria-label',lang==='es'?'Abrir navegación':'Open navigation');nav?.classList.remove('open');}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',lang==='es'?(open?'Cerrar navegación':'Abrir navegación'):(open?'Close navigation':'Open navigation'));nav.classList.toggle('open',open);});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){closeMenu();toggle.focus();}});

const rows=[...document.querySelectorAll('.archive-row')];
const search=document.querySelector('#project-search');
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const visibilityButtons=[...document.querySelectorAll('[data-visibility-filter]')];
let filter='all';
let visibility='all';
const normalize=text=>text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function filterProjects(){
 const query=normalize(search?.value||'');let count=0;
 for(const row of rows){const visible=(filter==='all'||row.dataset.status===filter)&&(visibility==='all'||row.dataset.visibility===visibility)&&normalize(row.dataset.search).includes(query);row.hidden=!visible;if(visible)count++;}
 const counter=document.querySelector('#result-count');if(counter)counter.textContent=String(count);
 const empty=document.querySelector('.empty-state');if(empty)empty.hidden=count!==0;
 for(const button of filterButtons)button.setAttribute('aria-pressed',String(button.dataset.filter===filter));
 for(const button of visibilityButtons)button.setAttribute('aria-pressed',String(button.dataset.visibilityFilter===visibility));
 const state={filter,visibility,query:search?.value||''};try{sessionStorage.setItem(`archive-${lang}`,JSON.stringify(state));}catch{}
}
filterButtons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;filterProjects();}));
visibilityButtons.forEach(button=>button.addEventListener('click',()=>{visibility=button.dataset.visibilityFilter;filterProjects();}));
search?.addEventListener('input',filterProjects);
document.querySelector('#reset-search')?.addEventListener('click',()=>{filter='all';visibility='all';search.value='';filterProjects();search.focus();});
if(search){try{const saved=JSON.parse(sessionStorage.getItem(`archive-${lang}`)||'null');if(saved){filter=['all','built','development'].includes(saved.filter)?saved.filter:'all';visibility=['all','public','private'].includes(saved.visibility)?saved.visibility:'all';search.value=saved.query||'';filterProjects();}}catch{}}

const copyButton=document.querySelector('.copy-email');let toastTimeout;
copyButton?.addEventListener('click',async()=>{const toast=document.querySelector('#toast');try{await navigator.clipboard.writeText(copyButton.dataset.email);toast.textContent=copyButton.dataset.success;}catch{toast.textContent=copyButton.dataset.failure;}toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),3000);});

const sections=[...document.querySelectorAll('section[id]')];
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const target=entry.target.id==='home'?'top':entry.target.id==='archive'?'projects':entry.target.id;nav?.querySelectorAll('a').forEach(a=>{if(a.hash===`#${target}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-10% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));}

// A language change keeps the current section on the home page.
const languageLink=document.querySelector('.language-switch');
languageLink?.addEventListener('click',()=>{if(!location.pathname.includes('/projects/')&&location.hash)languageLink.hash=location.hash;});

// Previews stay under the visitor's control: no autoplay or scroll interception.
const showcaseButtons=[...document.querySelectorAll('[data-showcase]')];
const showcasePanels=[...document.querySelectorAll('[data-showcase-panel]')];
showcaseButtons.forEach(button=>button.addEventListener('click',()=>{
 for(const control of showcaseButtons)control.setAttribute('aria-pressed',String(control===button));
 for(const panel of showcasePanels){
  const selected=panel.dataset.showcasePanel===button.dataset.showcase;
  panel.hidden=!selected;
  panel.classList.toggle('is-entering',selected);
 }
}));

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
