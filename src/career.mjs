// Early milestones and the master's year follow the author's corrections.
// Professional dates and responsibilities are taken from the CV sources in cv/.
const learning = [
 {
  company: {es: 'Primeros pasos', en: 'First steps'}, start: '2018',
  period: {es: '2018', en: '2018'},
  role: {es: 'Descubrir la lógica de programar', en: 'Discovering programming logic'},
  summary: {
   es: 'Scratch y RoboMind me enseñaron la lógica de programar: secuencias, condiciones y bucles.',
   en: 'Scratch and RoboMind taught me programming logic: sequences, conditions, and loops.',
  },
 },
 {
  company: {es: 'Aprendizaje autodidacta', en: 'Self-directed learning'}, start: '2019',
  period: {es: '2019', en: '2019'},
  role: {es: 'De los bloques a C++', en: 'From blocks to C++'},
  summary: {
   es: 'Aprendí C++ por mi cuenta con programas sencillos, conectando el código con las matemáticas y la programación lineal.',
   en: 'I taught myself C++ through simple programs, connecting code with mathematics and linear programming.',
  },
 },
 {
  company: 'Universidad Europea Miguel de Cervantes · UEMC', start: '2021', end: '2026',
  period: {es: '2021 — 2026', en: '2021 — 2026'},
  role: {es: 'Grado en Ingeniería Informática', en: 'Degree in Computer Engineering'},
  summary: {
   es: 'Bases de datos, algoritmos, estructuras de datos y diseño de software: una base para construir sistemas completos.',
   en: 'Databases, algorithms, data structures, and software design: a foundation for building complete systems.',
  },
 },
 {
  company: 'Microsoft · Founderz', start: '2024',
  period: {es: '2024', en: '2024'},
  role: {es: 'Máster en Inteligencia Artificial e Innovación', en: 'Master’s in Artificial Intelligence and Innovation'},
  summary: {
   es: 'Formación en inteligencia artificial e innovación para aplicar nuevas herramientas a problemas y proyectos reales.',
   en: 'Training in artificial intelligence and innovation to apply new tools to real problems and projects.',
  },
 },
];

const experience = [
 {
  company: 'ALTEN Spain', client: 'MAHLE', current: true,
  start: '2026-07', end: null,
  period: {es: 'Jul. 2026 — actualidad', en: 'Jul 2026 — present'},
  role: {es: 'Technical Sales Engineer', en: 'Technical Sales Engineer'},
  summary: {
   es: 'Conecto ingeniería, ventas y cliente en sistemas de propulsión para e-bike.',
   en: 'Connecting engineering, sales, and customers on e-bike propulsion systems.',
  },
  points: {
   es: ['Planificación y seguimiento de flotas, entregables y documentación técnica junto a Program y Product Management.', 'Análisis de compatibilidad de cuadros, test rides y configuración de motor maps con los equipos de motores y baterías.'],
   en: ['Fleet planning, deliverable tracking, and technical documentation alongside Program and Product Management.', 'Frame compatibility analysis, test rides, and motor map configuration with motor and battery teams.'],
  },
  tags: ['E-bike', 'Customer Frame Analysis', 'Motor maps'],
 },
 {
  company: 'NTT DATA', start: '2025-10', end: '2026-07',
  period: {es: 'Oct. 2025 — jul. 2026', en: 'Oct 2025 — Jul 2026'},
  role: {es: 'Software Engineer', en: 'Software Engineer'},
  summary: {
   es: 'Desarrollo backend y entrega de nuevas funcionalidades de producto en un equipo de más de 20 ingenieros.',
   en: 'Backend development and delivery of new product features in a team of over 20 engineers.',
  },
  points: {
   es: ['Desarrollo autónomo de una funcionalidad desde cero, desde el diseño hasta las pruebas, revisión y despliegue.', 'Refactorización, corrección de errores y resolución de incidencias de producción en un entorno Agile/Scrum.'],
   en: ['Independently built a feature from scratch, from design through testing, review, and deployment.', 'Refactoring, bug fixes, and production incident resolution in an Agile/Scrum environment.'],
  },
  tags: ['Java', 'SQL', 'MongoDB', 'Agile/Scrum'],
 },
 {
  company: 'REDALSA', start: '2025-04', end: '2025-07',
  period: {es: 'Abr. 2025 — jul. 2025', en: 'Apr 2025 — Jul 2025'},
  role: {es: 'Desarrollo de software · Prácticas', en: 'Software Development · Internship'},
  summary: {
   es: 'Un sistema de detección de objetos en vía con LiDAR, construido desde cero.',
   en: 'A LiDAR system for detecting objects on railway tracks, built from scratch.',
  },
  points: {
   es: ['Medición de distancias, mapeo y cálculo en tiempo real de posibles colisiones y trayectorias.', 'Integración de hardware y software: captura de señal, procesamiento y visualización de datos.'],
   en: ['Distance measurement, mapping, and real-time calculation of potential collisions and trajectories.', 'Hardware and software integration: signal acquisition, processing, and data visualisation.'],
  },
  tags: ['Python', 'C', 'LiDAR'],
 },
];

export function careerSection(lang) {
 const es = lang === 'es';
 const milestones = [...learning, ...experience].sort((a,b)=>a.start.localeCompare(b.start));
 return `<section id="career" class="career-section container" aria-labelledby="career-title">
  <div class="career-viewer">
  <header class="career-heading">
   <p class="eyebrow">02 / ${es?'TRAYECTORIA':'CAREER'}</p>
   <div><h2 id="career-title">${es?'La curiosidad, en el tiempo.':'Curiosity, over time.'}</h2><p>2018 <span aria-hidden="true">⟶</span> ${es?'hoy':'today'}</p></div>
   <p class="career-scroll-hint">${es?'Sigue bajando para pasar de etapa':'Scroll to turn the next page'} <span aria-hidden="true">↓</span></p>
  </header>
  <ol class="career-timeline">
   ${milestones.map((job,index)=>{
    const isLearning = learning.includes(job);
    return `<li class="career-entry${job.current?' is-current':''}${isLearning?' is-learning':''}" style="--card-index:${index}">
     <div class="career-date"><time datetime="${job.start}">${job.start.slice(0,4)}</time><span class="career-page" aria-hidden="true">${String(index+1).padStart(2,'0')} / ${String(milestones.length).padStart(2,'0')}</span>${job.current?`<span class="career-current">${es?'Ahora':'Now'}</span>`:''}</div>
     <article class="career-content">
      <div class="career-identity">
       <p class="career-company">${typeof job.company==='string'?job.company:job.company[lang]}${job.client?` <span> / ${es?'para':'for'} ${job.client}</span>`:''}</p>
       <h3>${job.role[lang]}</h3>
       ${job.end||job.current?`<p class="career-period">${job.period[lang]}</p>`:''}
      </div>
      <div class="career-story">
       <p class="career-summary">${job.summary[lang]}</p>
       ${!isLearning?`<details class="career-detail"><summary>${es?'Ver funciones':'View responsibilities'}<span aria-hidden="true">+</span></summary>
       <ul class="career-points">${job.points[lang].map(point=>`<li>${point}</li>`).join('')}</ul>
       <ul class="career-tags" aria-label="${es?'Áreas y herramientas':'Areas and tools'}">${job.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
       </details>`:''}
      </div>
     </article>
    </li>`;
   }).join('')}
  </ol>
  <div class="career-controls" hidden>
   <div class="career-steps" role="group" aria-label="${es?'Elegir una etapa':'Choose a stage'}">
    ${milestones.map((job,index)=>`<button type="button" data-career-step="${index}" aria-label="${job.start.slice(0,4)} — ${job.role[lang]}${typeof job.company==='string'?` — ${job.company}`:''}"><span>${job.start.slice(0,4)}</span></button>`).join('')}
   </div>
   <div class="career-continuation"><span class="career-counter" data-career-counter></span><p data-career-next-label></p><button type="button" data-career-next>${es?'Siguiente':'Next'} <span aria-hidden="true">↓</span></button></div>
  </div>
  </div>
 </section>`;
}
