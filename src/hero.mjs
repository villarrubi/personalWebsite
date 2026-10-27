export function experienceHero(lang) {
 const es=lang==='es';
 return `<section id="home" class="hero experience-hero" aria-labelledby="hero-name">
  <div class="experience-atmosphere" aria-hidden="true"></div>
  <div class="experience-layout container">
   <div class="experience-copy">
    <p class="experience-eyebrow"><span></span> ${es?'INGENIERO INFORMÁTICO':'SOFTWARE ENGINEER'} <span class="eyebrow-rule"></span> PALENCIA, ES</p>
    <h1 id="hero-name" class="experience-name">Alejandro<br><em>Villarrubia.</em></h1>
    <p class="experience-intro">${es?'La curiosidad toma forma.':'Curiosity takes shape.'}</p>
    <p class="experience-description">${es?'Construyo software. Aquí puedes empezar a explorarlo.':'I build software. Explore some of my work.'}</p>
    <div class="hero-actions experience-actions"><a class="button primary" href="#projects">${es?'Explorar proyectos':'Explore my work'} <span aria-hidden="true">↘</span></a><a class="experience-contact" href="#contact">${es?'Hablemos':'Let’s talk'} ↗</a></div>
   </div>
   <div class="experience-footer"><a href="#projects"><span class="experience-scroll" aria-hidden="true">↓</span> ${es?'SIGUE LA CURIOSIDAD':'FOLLOW YOUR CURIOSITY'}</a><button type="button" data-intro="cinematic">${es?'Volver al tablero':'Back to the chessboard'} <span aria-hidden="true">↗</span></button></div>
  </div>
 </section>`;
}
