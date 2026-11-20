import {copy,profile} from './content.mjs';
import {projectExplorer} from './project-explorer.mjs';
import {experienceHero} from './hero.mjs';
import {careerSection} from './career.mjs';
import {ambientBackground} from './ambient.mjs';
import {skillsSection} from './skills.mjs';

export function homeContent(lang){
 const c=copy[lang],es=lang==='es';
 return `
 ${experienceHero(lang)}
 ${projectExplorer(lang)}
 ${careerSection(lang)}
 <div class="profile-outro">${ambientBackground()}
 <section id="about" class="about-section about-journal" aria-labelledby="about-title"><div class="container">
  <header class="profile-section-heading" data-scroll-reveal><p class="eyebrow">03 / ${es?'PERFIL':'PROFILE'}</p><h2 id="about-title">${es?'Sobre mí':'About me'}</h2></header>
  <div class="about-note">
   <div class="about-profile"><p class="about-lead" data-scroll-reveal data-reveal-from="left">${c.aboutP1}</p>
    <div class="about-personal" data-scroll-reveal data-reveal-from="left" data-reveal-delay="30"><h3>${es?'Fuera del código':'Beyond software'}</h3><p>${es?'Juego, enseño y arbitro ajedrez. También soy secretario del':'I play, teach, and referee chess. I’m also secretary of the'} Club Palentino de Ajedrez.</p></div>
   </div>
   <aside class="about-practical" aria-labelledby="cv-title" data-scroll-reveal data-reveal-from="right" data-reveal-delay="65">
    <h3 id="cv-title">${es?'Currículum':'Résumé'}</h3>
    <a class="about-cv" href="${c.cvPath}" target="_blank" rel="noopener"><span>${c.cv}</span><small>${c.cvNote}</small></a>
    <div class="about-languages"><h4>${es?'Idiomas':'Languages'}</h4><p>${es?'Español nativo · Inglés B2':'Native Spanish · English B2'}</p><small>Cambridge B2 First</small></div>
   </aside>
  </div>
  ${skillsSection(lang)}
 </div></section>
 <section id="contact" class="contact-section contact-compact" aria-labelledby="contact-title"><div class="container">
  <div class="contact-main">
   <header class="profile-section-heading" data-scroll-reveal data-reveal-from="left"><p class="eyebrow">04 / ${es?'HABLEMOS':'LET’S TALK'}</p><h2 id="contact-title">${es?'Contacto':'Contact'}</h2><p class="contact-description">${c.contactText}</p></header>
   <div class="contact-primary" data-scroll-reveal data-reveal-from="right" data-reveal-delay="75"><h3>${es?'Escríbeme':'Email me'}</h3><a href="mailto:${profile.email}" class="contact-email">${profile.email}</a><button class="copy-email" data-email="${profile.email}" data-success="${c.copied}" data-failure="${c.copyFail}">${c.copyEmail}</button></div>
  </div>
  <div class="contact-secondary">
   <div data-scroll-reveal><h3>${es?'Teléfono':'Phone'}</h3><a class="contact-phone" href="${profile.phoneHref}">${profile.phone}</a></div>
   <div data-scroll-reveal data-reveal-delay="70"><h3>${es?'Redes profesionales':'Professional profiles'}</h3><div class="social-links"><a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub</a></div></div>
  </div>
 </div></section>
 </div>`;
}
