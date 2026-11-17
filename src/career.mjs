import {copy, publishedProjects} from './content.mjs';

// Dates and responsibilities are taken from the CV sources in cv/.
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
 return `<section id="career" class="career-section container" aria-labelledby="career-title">
  <div class="section-heading career-heading">
   <div><p class="eyebrow">02 / ${es?'TRAYECTORIA':'CAREER'}</p><h2 id="career-title">${es?'Del software<br>al mundo físico.':'From software<br>to the physical world.'}</h2></div>
   <p>${es?'Mi recorrido entre desarrollo, integración de sistemas e ingeniería aplicada.':'My path through software development, systems integration, and applied engineering.'}</p>
  </div>
  <div class="career-layout">
   <div class="career-experience">
    <h3 class="eyebrow career-label">${es?'EXPERIENCIA PROFESIONAL':'PROFESSIONAL EXPERIENCE'}</h3>
    <ol class="career-timeline" reversed>
     ${experience.map(job=>`<li class="career-entry${job.current?' is-current':''}">
      <article>
       <div class="career-meta"><p class="career-period"><time datetime="${job.start}">${job.period[lang].split(' — ')[0]}</time> — ${job.end?`<time datetime="${job.end}">${job.period[lang].split(' — ')[1]}</time>`:es?'actualidad':'present'}</p>${job.current?`<span class="career-current">${es?'Ahora':'Now'}</span>`:''}</div>
       <p class="career-company">${job.company}${job.client?` <span> / ${es?'para':'for'} ${job.client}</span>`:''}</p>
       <h4>${job.role[lang]}</h4>
       <p class="career-summary">${job.summary[lang]}</p>
       <ul class="career-points">${job.points[lang].map(point=>`<li>${point}</li>`).join('')}</ul>
       <ul class="career-tags" aria-label="${es?'Áreas y herramientas':'Areas and tools'}">${job.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
      </article>
     </li>`).join('')}
    </ol>
   </div>
   <aside class="career-education" aria-labelledby="education-title">
    <h3 class="eyebrow career-label" id="education-title">${es?'FORMACIÓN':'EDUCATION'}</h3>
    <div class="education-entry">
     <p class="career-period"><time datetime="2021">2021</time> — <time datetime="2026">2026</time></p>
     <h4>${es?'Grado en Ingeniería Informática':'Degree in Computer Engineering'}</h4>
     <p>Universidad Europea Miguel de Cervantes <span>(UEMC)</span></p>
     <p class="education-note">${es?'TFG sobre detección de phishing en correo electrónico con heurísticas y aprendizaje automático.':'Final-year project on email phishing detection using heuristics and machine learning.'}</p>
     ${thesisPublished?`<a class="career-text-link" href="/${lang}/projects/phishing/">${es?'Explorar el TFG':'Explore the final-year project'} <span aria-hidden="true">↗</span></a>`:''}
    </div>
    <div class="education-entry">
     <p class="career-period"><time datetime="2025">2025</time></p>
     <h4>${es?'Máster en Inteligencia Artificial e Innovación':'Master’s in Artificial Intelligence and Innovation'}</h4>
     <p>Microsoft · Founderz</p>
     <p class="education-note">${es?'Formación de posgrado.':'Postgraduate training.'}</p>
    </div>
    <div class="career-languages"><h4>${es?'Idiomas':'Languages'}</h4><p>${es?'Español nativo · Inglés B2':'Native Spanish · English B2'}<br><span>Cambridge B2 First</span></p></div>
    <a class="button secondary career-cv" href="${c.cvPath}" target="_blank" rel="noopener">${c.cv}<span aria-hidden="true">↓</span></a>
    <small class="career-cv-note">${c.cvNote}</small>
   </aside>
  </div>
 </section>`;
}
