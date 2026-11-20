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
  context: {
   es: 'Con pequeños retos aprendí a dividir un problema en pasos, probar instrucciones y corregir errores. Lo importante era entender por qué algo funcionaba.',
   en: 'Small challenges taught me to break problems into steps, test instructions, and fix mistakes. What mattered was understanding why something worked.',
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
  context: {
   es: 'Pasé de los bloques al código escrito: variables, funciones y estructuras de control. Empecé a expresar problemas mediante datos, operaciones y restricciones.',
   en: 'I moved from blocks to written code: variables, functions, and control flow. I began expressing problems through data, operations, and constraints.',
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
  context: {
   es: 'En la UEMC aprendí a organizar información, modelar soluciones con diagramas y elegir estructuras adecuadas. Programar también significaba diseñar, probar y mantener el software.',
   en: 'At UEMC, I learned to organise information, model solutions with diagrams, and choose suitable data structures. Programming also meant designing, testing, and maintaining software.',
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
  context: {
   es: 'El máster de Microsoft y Founderz amplió mi perspectiva sobre la IA: explorar sus posibilidades, entender sus límites y pensar dónde podía aportar valor.',
   en: 'The Microsoft and Founderz programme broadened my perspective on AI: exploring its possibilities, understanding its limits, and considering where it could add value.',
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
  context: {
   es: 'Combino coordinación de flotas y documentación técnica con análisis de compatibilidad de cuadros y pruebas de motores y baterías, junto a los equipos de ingeniería.',
   en: 'I combine fleet coordination and technical documentation with frame compatibility analysis and motor and battery testing, working alongside engineering teams.',
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
  context: {
   es: 'Trabajé con Java, SQL y MongoDB durante todo el ciclo de entrega: diseño, implementación, pruebas y despliegue, además de refactorización e incidencias de producción.',
   en: 'I worked with Java, SQL, and MongoDB throughout delivery: design, implementation, testing, and deployment, as well as refactoring and production incidents.',
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
  context: {
   es: 'Integré sensores y software con Python y C, desde la captura de datos hasta su visualización, para medir distancias y calcular posibles colisiones en tiempo real.',
   en: 'I integrated sensors and software using Python and C, from data acquisition to visualisation, to measure distances and calculate potential collisions in real time.',
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
 const labels=['Scratch / RoboMind','C++','UEMC','Founderz','REDALSA','NTT DATA','ALTEN / MAHLE'];
 return `<section id="career" class="career-section container" aria-labelledby="career-title">

  <header class="career-heading">
   <p class="eyebrow">02 / ${es?'TRAYECTORIA':'CAREER'}</p>
   <div><h2 id="career-title">${es?'La curiosidad, en el tiempo.':'Curiosity, over time.'}</h2><p>2018 <span aria-hidden="true">⟶</span> ${es?'hoy':'today'}</p></div>
  </header>
  <div class="career-explorer">
   <div class="career-navigation" data-career-ui hidden>
    <p class="career-hint">${es?'Cada etapa, una forma de aprender. Elige un punto del recorrido.':'A different way to learn at every stage. Choose a point on the timeline.'}</p>
    <div class="career-steps" role="tablist" aria-label="${es?'Etapas de la trayectoria':'Career stages'}">
     <span class="career-trace" aria-hidden="true"></span>
     ${milestones.map((job,index)=>`<button type="button" role="tab" id="career-tab-${index}" data-career-step="${index}" aria-controls="career-panel-${index}" aria-label="${job.start.slice(0,4)} — ${labels[index]} — ${job.role[lang]}"><span class="career-step-year">${job.start.slice(0,4)}</span><span class="career-step-dot" aria-hidden="true"></span><span class="career-step-name">${labels[index]}</span></button>`).join('')}
    </div>
   </div>
  <ol class="career-timeline">
   ${milestones.map((job,index)=>{
    const isLearning = learning.includes(job);
    return `<li id="career-panel-${index}" class="career-entry${job.current?' is-current':''}${isLearning?' is-learning':''}">
     <div class="career-date"><p class="career-kind">${isLearning?(es?'Aprendizaje':'Learning'):(es?'Experiencia':'Experience')}</p><time datetime="${job.start}">${job.start.slice(0,4)}</time><span class="career-period">${job.period[lang]}</span>${job.current?`<span class="career-current">${es?'Actualmente':'Currently'}</span>`:''}</div>
     <article class="career-content">
      <div class="career-identity">
       <p class="career-company">${typeof job.company==='string'?job.company:job.company[lang]}${job.client?` <span> / ${es?'para':'for'} ${job.client}</span>`:''}</p>
       <h3>${job.role[lang]}</h3>
      </div>
      <div class="career-story">
       <p class="career-summary">${job.summary[lang]}</p>
       <p class="career-context">${job.context[lang]}</p>
      </div>
       ${!isLearning?`<details class="career-detail"><summary>${es?'Explorar funciones y herramientas':'Explore responsibilities and tools'}<span aria-hidden="true">+</span></summary>
       <ul class="career-points">${job.points[lang].map(point=>`<li>${point}</li>`).join('')}</ul>
       <ul class="career-tags" aria-label="${es?'Áreas y herramientas':'Areas and tools'}">${job.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
       </details>`:''}
     </article>
    </li>`;
   }).join('')}
  </ol>
  <div class="career-controls" data-career-ui hidden>
   <p class="career-counter" data-career-counter aria-live="polite" aria-atomic="true"></p>
   <div class="career-buttons"><button type="button" data-career-prev>${es?'Anterior':'Previous'}</button><button type="button" data-career-next>${es?'Siguiente':'Next'}</button></div>
   <a class="career-about" href="#about">${es?'Sobre mí':'About me'}</a>
  </div>
  </div>
 </section>`;
}
