export function experienceHero(lang) {
 const es=lang==='es';
 return `<section id="home" class="hero experience-hero" aria-labelledby="hero-name">
  <div class="experience-atmosphere" aria-hidden="true"></div>
  <div class="experience-layout container">
   <div class="experience-copy">
    <p class="experience-eyebrow"><span></span> ${es?'INGENIERO INFORMÁTICO':'SOFTWARE ENGINEER'} <span class="eyebrow-rule"></span> PALENCIA, ES</p>
    <h1 id="hero-name" class="experience-name">Alejandro<br><em>Villarrubia.</em></h1>
    <p class="experience-intro">${es?'La curiosidad toma forma.':'Curiosity takes shape.'}</p>
    <p class="experience-description">${es?'Construyo software. Aquí puedes empezar a explorarlo.':'I build software. Here’s a little of what that can look like.'}</p>
    <div class="hero-actions experience-actions"><a class="button primary" href="#projects">${es?'Explorar proyectos':'Explore my work'} <span aria-hidden="true">↘</span></a><a class="experience-contact" href="#contact">${es?'Hablemos':'Let’s talk'} ↗</a></div>
   </div>
   <div class="experience-playground" data-hero-world>
    <div class="world-caption"><span class="world-live-dot" aria-hidden="true"></span><span>${es?'UN PEQUEÑO EXPERIMENTO INTERACTIVO':'A LITTLE INTERACTIVE EXPERIMENT'}</span></div>
    <div class="world-viewport" role="img" aria-label="${es?'Paisaje de islas montañosas, creado para esta web':'A landscape of mountainous islands, created for this website'}">
     <img class="world-poster" src="/assets/hero-world.svg" alt="${es?'Islas montañosas rodeadas de agua azul, vistas en perspectiva':'Mountainous islands surrounded by blue water, viewed in perspective'}" width="1000" height="760" fetchpriority="high">
     <div class="world-coordinate" aria-hidden="true">X <span data-world-x>+0.00</span><br>Y <span data-world-y>+0.00</span></div>
     <span class="world-north" aria-hidden="true">N<br>↑</span>
    </div>
    <div class="world-interface" hidden>
     <div class="world-heading"><p>${es?'Un mundo hecho de código.':'A world, made of code.'}</p><span data-world-edition>001</span></div>
     <div class="world-controls"><div class="world-presets" role="group" aria-label="${es?'Tipo de paisaje':'Landscape type'}"><button type="button" data-terrain="islands" aria-pressed="true">${es?'Islas':'Islands'}</button><button type="button" data-terrain="highlands" aria-pressed="false">${es?'Montañas':'Highlands'}</button></div><button class="world-generate" type="button" data-generate-world>${es?'Crear otro':'Create another'} <span aria-hidden="true">↻</span></button></div>
     <div class="world-help"><p id="world-instructions" class="world-instructions">${es?'Genera un paisaje. Arrastra para explorarlo.':'Generate a landscape. Drag to explore.'}</p><button type="button" data-world-motion aria-pressed="true" aria-label="${es?'Animación del paisaje':'Landscape animation'}">${es?'Pausar':'Pause'} Ⅱ</button></div>
    </div>
    <p class="world-fallback">${es?'Estudio de paisaje generativo, creado para esta web.':'A generative landscape study, made for this website.'}</p>
    <p class="world-announcement" role="status" aria-live="polite"></p>
   </div>
   <div class="experience-footer"><a href="#projects"><span class="experience-scroll" aria-hidden="true">↓</span> ${es?'SIGUE LA CURIOSIDAD':'FOLLOW YOUR CURIOSITY'}</a><button type="button" data-intro="cinematic">${es?'Volver al tablero':'Back to the chessboard'} <span aria-hidden="true">↗</span></button></div>
  </div>
 </section>`;
}
