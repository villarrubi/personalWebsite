import {copy,profile} from './content.mjs';
import {projectExplorer} from './project-explorer.mjs';
import {selectedProjects} from './selected-work.mjs';

export function homeContent(lang){
 const c=copy[lang],es=lang==='es';
 return `
 <section id="home" class="impact-hero container" aria-labelledby="hero-title">
  <div class="impact-layout">
   <div class="impact-copy">
    <p class="eyebrow hero-identity">ALEJANDRO VILLARRUBIA <span>${es?'INGENIERO INFORMÁTICO':'SOFTWARE ENGINEER'}</span></p>
    <h1 id="hero-title">${es?'Software que<br>puedes <em>explorar.</em>':'Software you<br>can <em>explore.</em>'}</h1>
    <p class="impact-description">${es?'Construyo aplicaciones, visualizaciones interactivas y sistemas que conectan el código con el mundo físico.':'I build applications, interactive visualisations, and systems that connect code to the physical world.'}</p>
    <div class="hero-actions"><a class="button primary" href="#projects">${es?'Ver mi trabajo':'Explore my work'} <span aria-hidden="true">↓</span></a><a class="underlined hero-cv" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv} ↗</a></div>
    <p class="hero-demo-invite"><span aria-hidden="true">↗</span> ${es?'Empieza aquí: desmonta una célula.':'Start here: take a cell apart.'}</p>
   </div>
   <div class="atlas-preview" data-atlas-preview>
    <div class="atlas-topline"><span class="live-label"><i></i>${es?'EXPLORA UN PROYECTO REAL':'EXPLORE A REAL PROJECT'}</span><span class="atlas-index">01 — 03</span></div>
    <div class="atlas-view" role="img" aria-label="${es?'Vista interior del modelo original de la célula animal':'Interior view of the original animal cell model'}"><img class="atlas-poster" src="/assets/images/atlas-cell.webp" alt="" width="585" height="370" fetchpriority="high"><div class="atlas-canvas"></div><span class="atlas-drag-hint" hidden>${es?'Arrastra para girar':'Drag to rotate'}</span></div>
    <div class="atlas-controls" hidden>
     <div class="atlas-types" role="group" aria-label="${es?'Tipo de célula':'Cell type'}"><button type="button" data-cell="animal" aria-pressed="true">Animal</button><button type="button" data-cell="plant" aria-pressed="false">${es?'Vegetal':'Plant'}</button><button type="button" data-cell="bacteria" aria-pressed="false">${es?'Bacteria':'Bacterium'}</button></div>
     <div class="atlas-tools"><button type="button" data-cell-explode aria-pressed="false">${es?'Desmontar':'Take apart'} <span aria-hidden="true">＋</span></button><button type="button" data-cell-rotate aria-pressed="false" aria-label="${es?'Girar el modelo automáticamente':'Rotate model automatically'}">↻</button></div>
    </div>
    <div class="atlas-caption"><div><p>${es?'ATLAS CELULAR':'CELL ATLAS'} <span>TypeScript / Three.js</span></p><span>${es?'Modelos originales. Aprendizaje interactivo.':'Original models. Interactive learning.'}</span></div><a href="/${lang}/projects/atlas-celular/" aria-label="${es?'Ver el proyecto Atlas celular':'Explore the Cell atlas project'}">↗</a></div>
    <p class="atlas-status" role="status" aria-live="polite"></p>
   </div>
  </div>
  <div class="experience-strip"><p><span class="strip-dot"></span> ${es?'ACTUALMENTE':'CURRENTLY'} <strong>Technical Sales Engineer</strong><span>ALTEN ${es?'para':'for'} MAHLE</span></p><a href="#about">${es?'Conoce mi recorrido':'Explore my experience'} <span aria-hidden="true">↓</span></a></div>
 </section>
 ${selectedProjects(lang)}
 <section id="about" class="about-section container"><div class="section-heading"><div><p class="eyebrow">02 / ${es?'EXPERIENCIA Y ENFOQUE':'EXPERIENCE & APPROACH'}</p><h2>${es?'Entender el sistema.<br><em>Construir la solución.</em>':'Understand the system.<br><em>Build the solution.</em>'}</h2></div></div>
 <div class="about-layout"><div class="about-copy"><p>${c.aboutP1}</p><p>${c.aboutP2}</p><a class="button secondary" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv}<span>↓</span></a><small class="cv-note">${c.cvNote}</small>
 <div class="personal-opening"><div class="chess-stage" data-chess-stage role="img" aria-label="${es?'Tablero de madera con piezas Staunton':'Wooden chessboard with Staunton pieces'}"><div class="chess-canvas"></div><img class="chess-poster" src="/assets/chess/staunton-poster.webp" alt="" aria-hidden="true" width="1024" height="1024" loading="lazy"></div><div><p>${es?'También pienso sobre 64 casillas.':'I also think on 64 squares.'}</p><button type="button" data-intro="cinematic">${es?'Ver la entrada de ajedrez':'Play the chess intro'} <span aria-hidden="true">↗</span></button></div></div>
 <p class="personal-note">${es?'Juego, enseño y arbitro ajedrez. También soy secretario del':'I play, teach, and referee chess. I’m also secretary of the'} <a class="underlined" href="/${lang}/projects/club-palentino/">Club Palentino de Ajedrez ↗</a></p></div>
 <aside class="engineering-toolbox" aria-labelledby="toolbox-title"><p class="eyebrow" id="toolbox-title">${es?'DE PRINCIPIO A FIN':'FROM END TO END'}</p>
  <dl><div><dt><span aria-hidden="true">01</span> Software</dt><dd>Python · C++ · Java · TypeScript<small>${es?'Aplicaciones, backend y algoritmos.':'Applications, backend, and algorithms.'}</small></dd></div><div><dt><span aria-hidden="true">02</span> ${es?'IA y visualización':'AI and visualisation'}</dt><dd>scikit-learn · Ollama · Three.js<small>${es?'Análisis de datos, modelos locales e interfaces 3D.':'Data analysis, local models, and 3D interfaces.'}</small></dd></div><div><dt><span aria-hidden="true">03</span> Hardware</dt><dd>ESP32-S3 · LiDAR<small>${es?'Dispositivos, sensores e integración.':'Devices, sensors, and integration.'}</small></dd></div></dl>
 </aside></div></section>
 ${projectExplorer(lang)}
 <section id="contact" class="contact-section"><div class="container"><div class="contact-top"><p class="eyebrow">04 / ${es?'LA SIGUIENTE CONVERSACIÓN':'THE NEXT CONVERSATION'}</p><p>${c.contactText}</p></div><a class="contact-heading" href="mailto:${profile.email}"><h2>${es?'¿Hablamos?':'Let’s talk.'}</h2><span aria-hidden="true">↗</span></a><div class="contact-bottom"><a href="mailto:${profile.email}" class="contact-email">${profile.email}</a><button class="copy-email" data-email="${profile.email}" data-success="${c.copied}" data-failure="${c.copyFail}">${c.copyEmail}</button><div class="social-links"><a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></div></section>`;
}
