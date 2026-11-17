import {copy,profile,publishedProjects} from './content.mjs';
import {projectExplorer} from './project-explorer.mjs';
import {experienceHero} from './hero.mjs';
import {careerSection} from './career.mjs';

export function homeContent(lang){
 const c=copy[lang],es=lang==='es';
 const clubPublished=publishedProjects.some(p=>p.id==='club-palentino');
 return `
 ${experienceHero(lang)}
 ${projectExplorer(lang)}
 ${careerSection(lang)}
 <section id="about" class="about-section about-journal" aria-labelledby="about-title"><div class="container">
  <div class="about-note">
   <header class="about-introduction"><p class="eyebrow">03 / ${es?'SOBRE MÍ':'ABOUT ME'}</p><h2 id="about-title">${es?'Entender cómo funciona.<br><em>Imaginar qué podría ser.</em>':'Understand how it works.<br><em>Imagine what it could be.</em>'}</h2><p class="about-signature">Alejandro Villarrubia <span> / Palencia, ES</span></p></header>
   <div class="about-profile"><p>${c.aboutP1}</p><p class="personal-note">${es?'Fuera del código, juego, enseño y arbitro ajedrez. También soy secretario del':'Outside software, I play, teach, and referee chess. I’m also secretary of the'} ${clubPublished?`<a class="underlined" href="/${lang}/projects/club-palentino/">Club Palentino de Ajedrez ↗</a>`:'Club Palentino de Ajedrez.'}</p>
    <div class="about-practical"><p>${es?'Español nativo · Inglés B2':'Native Spanish · English B2'}<small>Cambridge B2 First</small></p><a class="about-cv" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv}<span aria-hidden="true">↓</span><small>${c.cvNote}</small></a></div>
   </div>
  </div>
  <div class="about-tools" aria-labelledby="toolbox-title"><h3 class="eyebrow" id="toolbox-title">${es?'CON QUÉ CONSTRUYO':'WHAT I BUILD WITH'}</h3>
   <dl><div><dt><span aria-hidden="true">01 /</span> Software</dt><dd>Python · C++ · Java · C#<small>${es?'Aplicaciones, backend y algoritmos.':'Applications, backend, and algorithms.'}</small></dd></div><div><dt><span aria-hidden="true">02 /</span> ${es?'IA e interfaces':'AI and interfaces'}</dt><dd>Ollama · TypeScript · Canvas 2D<small>${es?'Modelos locales y herramientas para trabajar.':'Local models and tools for getting things done.'}</small></dd></div><div><dt><span aria-hidden="true">03 /</span> Hardware</dt><dd>ESP32-S3 · LiDAR<small>${es?'Dispositivos, sensores e integración.':'Devices, sensors, and integration.'}</small></dd></div></dl>
  </div>
 </div></section>
 <section id="contact" class="contact-section contact-compact"><div class="container"><div class="contact-top"><p class="eyebrow">04 / ${es?'LA SIGUIENTE CONVERSACIÓN':'THE NEXT CONVERSATION'}</p><p>${c.contactText}</p></div><a class="contact-heading" href="mailto:${profile.email}"><h2>${es?'¿Hablamos?':'Let’s talk.'}</h2><span aria-hidden="true">↗</span></a><div class="contact-bottom"><a href="mailto:${profile.email}" class="contact-email">${profile.email}</a><button class="copy-email" data-email="${profile.email}" data-success="${c.copied}" data-failure="${c.copyFail}">${c.copyEmail}</button><div class="social-links"><a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></div></section>`;
}
