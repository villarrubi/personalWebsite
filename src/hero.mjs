import {profile} from './content.mjs';

export function experienceHero(lang) {
 const es=lang==='es';
 const phrases=es?['software que resuelve problemas.','herramientas con IA local.','sistemas que conectan código y sensores.','motores de ajedrez en C++.']:['software that solves problems.','tools powered by local AI.','systems that connect code and sensors.','chess engines in C++.'];
 return `<section id="home" class="hero experience-hero" aria-labelledby="hero-name">
  <div class="experience-atmosphere" aria-hidden="true"></div>
  <canvas class="hero-effects" aria-hidden="true"></canvas>
  <a class="hero-language-banner" href="/${es?'en':'es'}/" hreflang="${es?'en':'es'}" lang="${es?'en':'es'}">${es?'View in English':'Ver en español'} <span aria-hidden="true">↗</span></a>
  <div class="experience-layout container">
   <div class="experience-copy">
    <p class="experience-eyebrow">${es?'INGENIERO INFORMÁTICO':'SOFTWARE ENGINEER'} <span class="eyebrow-rule"></span> PALENCIA, ES</p>
    <h1 id="hero-name" class="experience-name">Alejandro <em>Villarrubia.</em></h1>
    <p class="experience-intro">${es?'La curiosidad toma forma.':'Curiosity takes shape.'}</p>
    <div class="experience-description hero-typing" data-hero-typing>
     <p class="typing-summary">${es?'Construyo software, herramientas con IA local, sistemas con sensores y motores de ajedrez.':'I build software, local AI tools, sensor systems, and chess engines.'}</p>
     <p class="typing-line" aria-hidden="true"><span class="typing-prefix">${es?'Construyo':'I build'}</span> <span class="typing-words"><span data-typed-text>${phrases[0]}</span>${phrases.map(phrase=>`<span class="typing-measure" data-typing-phrase>${phrase}</span>`).join('')}</span></p>
     <button class="typing-toggle" type="button" data-typing-toggle data-pause="${es?'Pausar texto':'Pause text'}" data-resume="${es?'Animar texto':'Animate text'}" aria-label="${es?'Pausar texto':'Pause text'}" title="${es?'Pausar texto':'Pause text'}" hidden><span aria-hidden="true"></span></button>
    </div>
    <div class="hero-actions experience-actions"><a class="experience-contact" href="#career">${es?'Mi trayectoria':'My career'} ↓</a><a class="experience-contact" href="#contact">${es?'Hablemos':'Let’s talk'} ↗</a><a class="experience-contact" href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a class="experience-contact" href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div>
   </div>
  </div>
  <button class="ambient-toggle" type="button" data-ambient-toggle data-pause="${es?'Pausar fondo':'Pause background'}" data-resume="${es?'Animar fondo':'Animate background'}" hidden>${es?'Pausar fondo':'Pause background'}</button>
 </section>`;
}
