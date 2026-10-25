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
let filter='all';
const normalize=text=>text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function filterProjects(){
 const query=normalize(search?.value||'');let count=0;
 for(const row of rows){const visible=(filter==='all'||row.dataset.status===filter)&&normalize(row.dataset.search).includes(query);row.hidden=!visible;if(visible)count++;}
 const counter=document.querySelector('#result-count');if(counter)counter.textContent=String(count);
 const empty=document.querySelector('.empty-state');if(empty)empty.hidden=count!==0;
 for(const button of filterButtons)button.setAttribute('aria-pressed',String(button.dataset.filter===filter));
 const state={filter,query:search?.value||''};try{sessionStorage.setItem(`archive-${lang}`,JSON.stringify(state));}catch{}
}
filterButtons.forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;filterProjects();}));
search?.addEventListener('input',filterProjects);
document.querySelector('#reset-search')?.addEventListener('click',()=>{filter='all';search.value='';filterProjects();search.focus();});
if(search){try{const saved=JSON.parse(sessionStorage.getItem(`archive-${lang}`)||'null');if(saved){filter=['all','built','development'].includes(saved.filter)?saved.filter:'all';search.value=saved.query||'';filterProjects();}}catch{}}

const copyButton=document.querySelector('.copy-email');let toastTimeout;
copyButton?.addEventListener('click',async()=>{const toast=document.querySelector('#toast');try{await navigator.clipboard.writeText(copyButton.dataset.email);toast.textContent=copyButton.dataset.success;}catch{toast.textContent=copyButton.dataset.failure;}toast.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>toast.classList.remove('visible'),3000);});

const sections=[...document.querySelectorAll('section[id]')];
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const target=entry.target.id==='archive'?'projects':entry.target.id;nav?.querySelectorAll('a').forEach(a=>{if(a.hash===`#${target}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-10% 0px -65% 0px'});sections.forEach(section=>observer.observe(section));}

// A language change keeps the current section on the home page.
const languageLink=document.querySelector('.language-switch');
languageLink?.addEventListener('click',()=>{if(!location.pathname.includes('/projects/')&&location.hash)languageLink.hash=location.hash;});
