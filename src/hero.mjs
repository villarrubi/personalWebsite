import {profile} from './content.mjs';

export function experienceHero(lang) {
 const es=lang==='es';
 return `<section id="home" class="hero experience-hero" aria-labelledby="hero-name">
  <div class="experience-atmosphere" aria-hidden="true"></div>
  <div class="experience-layout container">
   <div class="experience-copy">
    <p class="experience-eyebrow">${es?'INGENIERO INFORMÁTICO':'SOFTWARE ENGINEER'} <span class="eyebrow-rule"></span> PALENCIA, ES</p>
    <h1 id="hero-name" class="experience-name">Alejandro <em>Villarrubia.</em></h1>
    <p class="experience-intro">${es?'La curiosidad toma forma.':'Curiosity takes shape.'}</p>
    <p class="experience-description">${es?'Construyo software. Aquí puedes empezar a explorarlo.':'I build software. Explore some of my work.'}</p>
    <div class="hero-actions experience-actions"><a class="experience-contact" href="#career">${es?'Mi trayectoria':'My career'} ↓</a><a class="experience-contact" href="#contact">${es?'Hablemos':'Let’s talk'} ↗</a><a class="experience-contact" href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a class="experience-contact" href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div>
   </div>
  </div>
 </section>`;
}
