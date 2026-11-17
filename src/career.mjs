import {copy, publishedProjects} from './content.mjs';

// Early milestones and the master's year follow the author's corrections.
// Professional dates and responsibilities are taken from the CV sources in cv/.
const learning = [
 {
  company: {es: 'Primeros pasos', en: 'First steps'}, start: '2018',
  period: {es: '2018', en: '2018'},
  role: {es: 'Descubrir la lógica de programar', en: 'Discovering programming logic'},
  summary: {
   es: 'Empecé a programar con herramientas como Scratch y RoboMind. Entre bloques, instrucciones y pequeños retos, descubrí cómo convertir una idea en una secuencia de pasos.',
   en: 'I started programming with tools such as Scratch and RoboMind. Through blocks, instructions, and small challenges, I discovered how to turn an idea into a sequence of steps.',
  },
  points: {
   es: ['Los bucles, las condiciones y el ensayo y error me ayudaron a entender la lógica de la programación: dividir un problema, probar una solución y aprender de lo que no funcionaba.'],
   en: ['Loops, conditions, and trial and error helped me understand programming logic: breaking down a problem, testing a solution, and learning from what did not work.'],
  },
  tags: ['Scratch', 'RoboMind'],
 },
 {
  company: {es: 'Aprendizaje autodidacta', en: 'Self-directed learning'}, start: '2019',
  period: {es: '2019', en: '2019'},
  role: {es: 'De los bloques a C++', en: 'From blocks to C++'},
  summary: {
   es: 'Di el salto a C++ por mi cuenta, escribiendo programas sencillos y familiarizándome con variables, funciones y estructuras de control.',
   en: 'I moved on to C++ on my own, writing simple programs and getting familiar with variables, functions, and control flow.',
  },
  points: {
   es: ['Empecé a conectar el código con las matemáticas y la programación lineal: expresar un problema mediante variables y restricciones, y pensar cómo buscar una solución.'],
   en: ['I began connecting code with mathematics and linear programming: expressing a problem through variables and constraints, and thinking about how to find a solution.'],
  },
  tags: ['C++'],
 },
 {
  company: 'Universidad Europea Miguel de Cervantes · UEMC', start: '2021', end: '2026',
  period: {es: '2021 — 2026', en: '2021 — 2026'},
  role: {es: 'Grado en Ingeniería Informática', en: 'Degree in Computer Engineering'},
  summary: {
   es: 'En 2021 entré en la carrera de Informática. Lo que había empezado como curiosidad fue tomando forma con una base más amplia y una manera más estructurada de abordar los problemas.',
   en: 'In 2021, I started my Computer Engineering degree. What began as curiosity took shape through broader foundations and a more structured approach to solving problems.',
  },
  points: {
   es: ['Profundicé en bases de datos, estructuras de datos y algoritmos, aprendiendo a organizar la información y a elegir cómo procesarla.', 'El diseño de software, los diagramas y el modelado me ayudaron a planificar antes de programar y a construir soluciones más claras, mantenibles y conectadas entre sí.'],
   en: ['I explored databases, data structures, and algorithms, learning how to organise information and choose how to process it.', 'Software design, diagrams, and modelling helped me plan before coding and build clearer, more maintainable, interconnected solutions.'],
  },
  tags: ['SQL', 'UML'],
 },
 {
  company: 'Microsoft · Founderz', start: '2024',
  period: {es: '2024', en: '2024'},
  role: {es: 'Máster en Inteligencia Artificial e Innovación', en: 'Master’s in Artificial Intelligence and Innovation'},
  summary: {
   es: 'Amplié mi formación con el máster en Inteligencia Artificial e Innovación, acercando mi interés por la tecnología a las posibilidades de la IA.',
   en: 'I expanded my education with a master’s programme in Artificial Intelligence and Innovation, connecting my interest in technology with the possibilities of AI.',
  },
  points: {
   es: ['Una oportunidad para explorar cómo aplicar estas herramientas a problemas concretos y pensar en nuevas formas de desarrollar ideas y proyectos.'],
   en: ['An opportunity to explore how these tools can address practical problems and open up new ways of developing ideas and projects.'],
  },
  tags: [],
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
 const es = lang === 'es', c = copy[lang];
 const thesisPublished = publishedProjects.some(project => project.id === 'phishing');
 const milestones = [...learning, ...experience].sort((a,b)=>a.start.localeCompare(b.start));
 return `<section id="career" class="career-section container" aria-labelledby="career-title">
  <div class="section-heading career-heading">
   <div><p class="eyebrow">02 / ${es?'TRAYECTORIA':'CAREER'}</p><h2 id="career-title">${es?'Todo empezó<br>con curiosidad.':'It all started<br>with curiosity.'}</h2></div>
   <p>${es?'De mis primeros programas en 2018 a la ingeniería de software y los sistemas físicos. Un recorrido de aprendizaje, paso a paso.':'From my first programs in 2018 to software engineering and physical systems. A learning journey, one step at a time.'}</p>
  </div>
  <div class="career-layout">
   <div class="career-experience">
    <h3 class="eyebrow career-label">${es?'APRENDIZAJE Y EXPERIENCIA':'LEARNING AND EXPERIENCE'}</h3>
    <ol class="career-timeline">
     ${milestones.map(job=>`<li class="career-entry${job.current?' is-current':''}">
      <article>
       <div class="career-meta"><p class="career-period"><time datetime="${job.start}">${job.period[lang].split(' — ')[0]}</time>${job.end?` — <time datetime="${job.end}">${job.period[lang].split(' — ')[1]}</time>`:job.current?` — ${es?'actualidad':'present'}`:''}</p>${job.current?`<span class="career-current">${es?'Ahora':'Now'}</span>`:''}</div>
       <p class="career-company">${typeof job.company==='string'?job.company:job.company[lang]}${job.client?` <span> / ${es?'para':'for'} ${job.client}</span>`:''}</p>
       <h4>${job.role[lang]}</h4>
       <p class="career-summary">${job.summary[lang]}</p>
       <ul class="career-points">${job.points[lang].map(point=>`<li>${point}</li>`).join('')}</ul>
       ${job.tags.length?`<ul class="career-tags" aria-label="${es?'Áreas y herramientas':'Areas and tools'}">${job.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>`:''}
      </article>
     </li>`).join('')}
    </ol>
   </div>
   <aside class="career-education" aria-labelledby="education-title">
    <h3 class="eyebrow career-label" id="education-title">${es?'DEL APRENDIZAJE A LA PRÁCTICA':'PUTTING LEARNING INTO PRACTICE'}</h3>
    <div class="education-entry">
     <h4>${es?'Detectar el engaño con código.':'Detecting deception with code.'}</h4>
     <p>${es?'Mi Trabajo de Fin de Grado reúne programación, análisis de datos e inteligencia artificial en un detector de phishing para correo electrónico.':'My final-year project brings together programming, data analysis, and artificial intelligence in an email phishing detector.'}</p>
     <p class="education-note">${es?'Heurísticas y aprendizaje automático aplicados a un problema real.':'Heuristics and machine learning applied to a real problem.'}</p>
     ${thesisPublished?`<a class="career-text-link" href="/${lang}/projects/phishing/">${es?'Explorar el TFG':'Explore the final-year project'} <span aria-hidden="true">↗</span></a>`:''}
    </div>
    <div class="career-languages"><h4>${es?'Idiomas':'Languages'}</h4><p>${es?'Español nativo · Inglés B2':'Native Spanish · English B2'}<br><span>Cambridge B2 First</span></p></div>
    <a class="button secondary career-cv" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv}<span aria-hidden="true">↓</span></a>
    <small class="career-cv-note">${c.cvNote}</small>
   </aside>
  </div>
 </section>`;
}
