import {copy,profile,publishedProjects} from './content.mjs';
import {projectExplorer} from './project-explorer.mjs';
import {experienceHero} from './hero.mjs';

export function homeContent(lang){
 const c=copy[lang],es=lang==='es';
 const clubPublished=publishedProjects.some(p=>p.id==='club-palentino');
 return `
 ${experienceHero(lang)}
 ${projectExplorer(lang)}
 <section id="about" class="about-section container"><div class="section-heading"><div><p class="eyebrow">02 / ${es?'CÓMO TRABAJO':'HOW I WORK'}</p><h2>${es?'Entender el sistema.<br>Construir la solución.':'Understand the system.<br>Build the solution.'}</h2></div></div>
 <div class="about-layout"><div class="about-copy"><p>${c.aboutP1}</p><p>${c.aboutP2}</p><a class="button secondary" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv}<span>↓</span></a><small class="cv-note">${c.cvNote}</small><p class="personal-note">${es?'Fuera del código, juego, enseño y arbitro ajedrez. También soy secretario del':'Outside software, I play, teach, and referee chess. I’m also secretary of the'} ${clubPublished?`<a class="underlined" href="/${lang}/projects/club-palentino/">Club Palentino de Ajedrez ↗</a>`:'Club Palentino de Ajedrez.'}</p></div>
 <aside class="engineering-toolbox" aria-labelledby="toolbox-title"><p class="eyebrow" id="toolbox-title">${es?'CON QUÉ CONSTRUYO':'WHAT I BUILD WITH'}</p>
  <dl><div><dt><span aria-hidden="true">01</span> Software</dt><dd>Python · C++ · Java · C#<small>${es?'Aplicaciones, backend y algoritmos.':'Applications, backend, and algorithms.'}</small></dd></div><div><dt><span aria-hidden="true">02</span> ${es?'IA y herramientas':'AI and tools'}</dt><dd>Ollama · TypeScript · Canvas 2D<small>${es?'Modelos locales e interfaces para trabajar.':'Local models and interfaces for getting things done.'}</small></dd></div><div><dt><span aria-hidden="true">03</span> Hardware</dt><dd>ESP32-S3 · LiDAR<small>${es?'Dispositivos, sensores e integración.':'Devices, sensors, and integration.'}</small></dd></div></dl>
 </aside></div></section>
 <section id="contact" class="contact-section"><div class="container"><div class="contact-top"><p class="eyebrow">03 / ${es?'LA SIGUIENTE CONVERSACIÓN':'THE NEXT CONVERSATION'}</p><p>${c.contactText}</p></div><a class="contact-heading" href="mailto:${profile.email}"><h2>${es?'¿Hablamos?':'Let’s talk.'}</h2><span aria-hidden="true">↗</span></a><div class="contact-bottom"><a href="mailto:${profile.email}" class="contact-email">${profile.email}</a><button class="copy-email" data-email="${profile.email}" data-success="${c.copied}" data-failure="${c.copyFail}">${c.copyEmail}</button><div class="social-links"><a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></div></section>`;
}
