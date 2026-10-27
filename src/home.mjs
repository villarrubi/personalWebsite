import {copy,profile,publishedProjects} from './content.mjs';
import {projectExplorer} from './project-explorer.mjs';
import {technicalFlow} from './project-cases.mjs';

export function homeContent(lang){
 const c=copy[lang],es=lang==='es';
 const pipa=publishedProjects.find(p=>p.id==='pipa');
 const clubPublished=publishedProjects.some(p=>p.id==='club-palentino');
 return `
 <section id="home" class="hero engineering-hero container" aria-labelledby="hero-name">
  <div class="hero-top">
   <div class="hero-copy">
    <p class="eyebrow">${es?'INGENIERO INFORMÁTICO':'SOFTWARE ENGINEER'} <span aria-hidden="true">/</span> PALENCIA, ES</p>
    <h1 class="hero-name" id="hero-name">Alejandro<br>Villarrubia<span class="name-period">.</span></h1>
    <p class="hero-intro">${es?'Construyo software.<br>Conecto ideas, código y dispositivos.':'I build software.<br>Connecting ideas, code, and devices.'}</p>
    <p class="hero-description">${es?'Desarrollo de aplicaciones, inteligencia artificial local y sistemas que conectan con el mundo físico.':'Application development, local artificial intelligence, and systems that connect to the physical world.'}</p>
    <div class="hero-actions"><a class="button primary" href="#projects">${es?'Ver proyectos':'View projects'} <span aria-hidden="true">↓</span></a><a class="hero-github" href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
    <div class="hero-links"><a class="underlined" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv} ↓</a><a class="underlined" href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div>
   </div>
   <div class="engineering-showcase">
    ${pipa?`<a class="workbench" href="/${lang}/projects/pipa/" aria-label="${es?'Explorar Pipα, asistente local':'Explore Pipα, local assistant'}">
     <div class="workbench-bar"><span>${(pipa.status==='built'?c.built:c.inProgress).toUpperCase()}</span><span>PYTHON / ESP32-S3</span></div>
     <div class="workbench-title"><div><p class="eyebrow">${es?'DEL SOFTWARE AL DISPOSITIVO':'FROM SOFTWARE TO DEVICE'}</p><h2>Pipα</h2></div><span aria-hidden="true">↗</span></div>
     <img src="/assets/images/pipa-control.jpg" alt="${es?'Panel real de Pipα para controlar procesos y acciones del ordenador':'Pipα’s actual control panel for computer processes and actions'}" width="1089" height="485" fetchpriority="high">
     ${technicalFlow('pipa',lang)}
    </a>`:''}
    <div class="personal-opening">
     <div class="chess-stage" data-chess-stage role="img" aria-label="${es?'Tablero de madera con piezas Staunton':'Wooden chessboard with Staunton pieces'}"><div class="chess-canvas"></div><img class="chess-poster" src="/assets/chess/staunton-poster.webp" alt="" aria-hidden="true" width="1024" height="1024" fetchpriority="high" decoding="sync"></div>
     <div><p>${es?'Y, de vez en cuando, ajedrez.':'And, from time to time, chess.'}</p><button type="button" data-intro="cinematic">${es?'Repetir la entrada':'Replay the intro'} <span aria-hidden="true">↗</span></button></div>
    </div>
   </div>
  </div>
 </section>
 ${projectExplorer(lang)}
 <section id="about" class="about-section container"><div class="section-heading"><div><p class="eyebrow">02 / ${es?'CÓMO TRABAJO':'HOW I WORK'}</p><h2>${es?'Entender el sistema.<br>Construir la solución.':'Understand the system.<br>Build the solution.'}</h2></div></div>
 <div class="about-layout"><div class="about-copy"><p>${c.aboutP1}</p><p>${c.aboutP2}</p><a class="button secondary" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv}<span>↓</span></a><small class="cv-note">${c.cvNote}</small><p class="personal-note">${es?'Fuera del código, juego, enseño y arbitro ajedrez. También soy secretario del':'Outside software, I play, teach, and referee chess. I’m also secretary of the'} ${clubPublished?`<a class="underlined" href="/${lang}/projects/club-palentino/">Club Palentino de Ajedrez ↗</a>`:'Club Palentino de Ajedrez.'}</p></div>
 <aside class="engineering-toolbox" aria-labelledby="toolbox-title"><p class="eyebrow" id="toolbox-title">${es?'CON QUÉ CONSTRUYO':'WHAT I BUILD WITH'}</p>
  <dl><div><dt><span aria-hidden="true">01</span> Software</dt><dd>Python · C++ · Java · C#<small>${es?'Aplicaciones, backend y algoritmos.':'Applications, backend, and algorithms.'}</small></dd></div><div><dt><span aria-hidden="true">02</span> ${es?'IA y herramientas':'AI and tools'}</dt><dd>Ollama · TypeScript · Canvas 2D<small>${es?'Modelos locales e interfaces para trabajar.':'Local models and interfaces for getting things done.'}</small></dd></div><div><dt><span aria-hidden="true">03</span> Hardware</dt><dd>ESP32-S3 · LiDAR<small>${es?'Dispositivos, sensores e integración.':'Devices, sensors, and integration.'}</small></dd></div></dl>
 </aside></div></section>
 <section id="contact" class="contact-section"><div class="container"><div class="contact-top"><p class="eyebrow">03 / ${es?'LA SIGUIENTE CONVERSACIÓN':'THE NEXT CONVERSATION'}</p><p>${c.contactText}</p></div><a class="contact-heading" href="mailto:${profile.email}"><h2>${es?'¿Hablamos?':'Let’s talk.'}</h2><span aria-hidden="true">↗</span></a><div class="contact-bottom"><a href="mailto:${profile.email}" class="contact-email">${profile.email}</a><button class="copy-email" data-email="${profile.email}" data-success="${c.copied}" data-failure="${c.copyFail}">${c.copyEmail}</button><div class="social-links"><a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="${profile.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></div></section>`;
}
