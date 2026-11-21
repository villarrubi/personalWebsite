// Technologies checked against repository manifests and implementation, 2026-11-21.
const skills=[
 {id:'software',name:{es:'Software y servicios',en:'Software and services'},text:{es:'De una idea a un sistema que funciona. Diseño la lógica, conecto servicios y organizo los datos para que el software pueda crecer.',en:'From an idea to a working system. I design the logic, connect services and organise data so the software can grow.'},color:'#e8b68c'},
 {id:'ai',name:{es:'IA y análisis de datos',en:'AI and data analysis'},text:{es:'Encontrar patrones y explorar posibilidades. Trabajo con datos, aprendizaje automático y modelos locales para analizar, predecir y generar.',en:'Finding patterns and exploring possibilities. I work with data, machine learning and local models to analyse, predict and generate.'},color:'#b9a0f4'},
 {id:'hardware',name:{es:'Hardware y sensores',en:'Hardware and sensors'},text:{es:'Tender un puente entre código y entorno. Integro dispositivos, capturo señales y convierto medidas del mundo físico en información útil.',en:'Bridging code and its surroundings. I integrate devices, capture signals and turn measurements from the physical world into useful information.'},color:'#85cbb0'},
 {id:'interfaces',name:{es:'Interfaces y mundos',en:'Interfaces and worlds'},text:{es:'Hacer visible lo que ocurre dentro. Diseño interfaces, herramientas y entornos interactivos que invitan a explorar y facilitan el uso.',en:'Making the inner workings visible. I design interfaces, tools and interactive environments that invite exploration and are easy to use.'},color:'#80b8e7'},
];

const stories={
 software:{word:{es:'Construir',en:'Build'},groups:[{label:{es:'Lenguajes',en:'Languages'},tags:['C++','C# / .NET','Python','Java / Swing']},{label:{es:'Servicios',en:'Services'},tags:['FastAPI','Node.js / Express']},{label:{es:'Datos',en:'Data'},tags:['SQLite','PHP / MySQL']}]},
 ai:{word:{es:'Aprender',en:'Learn'},groups:[{label:{es:'Modelos',en:'Models'},tags:['scikit-learn','PyTorch','Ollama']},{label:{es:'Datos',en:'Data'},tags:['NumPy','pandas']},{label:{es:'Exploración',en:'Exploration'},tags:['Streamlit']}]},
 hardware:{word:{es:'Conectar',en:'Connect'},groups:[{label:{es:'Dispositivos',en:'Devices'},tags:['C++ / Arduino','ESP32-S3','PlatformIO']},{label:{es:'Procesamiento',en:'Processing'},tags:['PCL / Eigen','Open3D']},{label:{es:'Comunicación',en:'Communication'},tags:['USB / TCP','Linux']}]},
 interfaces:{word:{es:'Crear',en:'Create'},groups:[{label:{es:'Aplicaciones',en:'Applications'},tags:['JavaScript / TypeScript','React','Electron']},{label:{es:'Visualización',en:'Visualisation'},tags:['Canvas 2D','Three.js / WebGL','MapLibre']},{label:{es:'Entornos',en:'Environments'},tags:['Godot / GDScript']}]},
};

function skillIcon(id){
 const paths={software:'<rect x="3" y="4" width="26" height="24" rx="4"/><path d="M3 10h26m-18 5-4 4 4 4m10-8 4 4-4 4m-3-10-4 12"/>',ai:'<path d="M4 25V7m0 18h24M9 20l5-7 5 3 8-10"/><circle cx="14" cy="13" r="2"/><circle cx="19" cy="16" r="2"/>',hardware:'<rect x="8" y="8" width="16" height="16" rx="3"/><path d="M12 3v5m8-5v5m-8 16v5m8-5v5M3 12h5m-5 8h5m16-8h5m-5 8h5"/><rect x="12" y="12" width="8" height="8" rx="1"/>',interfaces:'<rect x="3" y="4" width="26" height="23" rx="3"/><path d="M3 10h26M11 10v17m5-12h8m-8 5h5"/><path d="m23 20 2 10 3-4 4-2Z"/>'};
 return `<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]}</svg>`;
}
export function skillsSection(lang){
 const es=lang==='es';
 return `<section id="skills" class="about-tools skill-explorer" aria-labelledby="toolbox-title">
  <header class="skills-heading" data-scroll-reveal><p class="skills-kicker">${es?'Competencias técnicas':'Technical skills'}</p><h3 id="toolbox-title">${es?'Del código<br>al <em>mundo real.</em>':'From code<br>to the <em>real world.</em>'}</h3><p>${es?'Software, datos, dispositivos e interfaces. Cuatro áreas que conecto al construir.':'Software, data, devices and interfaces. Four disciplines I bring together when building.'}</p></header>
  <div class="skills-workbench">
   <div class="skill-selector" data-skills-ui hidden role="group" aria-label="${es?'Explorar competencias':'Explore skills'}">
    <div class="skill-compass">
     <div class="skill-compass-rings" aria-hidden="true"></div>
     ${skills.map((skill,index)=>`<button type="button" class="skill-choice skill-choice-${skill.id}" style="--skill-color:${skill.color}" data-skill="${skill.id}" aria-controls="skill-panel-${skill.id}" aria-expanded="false">
      <svg class="skill-sector" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g transform="rotate(${index*90} 200 200)"><path d="M77.3 68.4 A180 180 0 0 1 322.7 68.4 L252.5 143.7 A77 77 0 0 0 147.5 143.7 Z"/><path class="skill-sector-edge" d="M85.4 77.1 A168 168 0 0 1 314.6 77.1"/></g></svg>
      <span class="skill-label"><span class="skill-choice-icon" aria-hidden="true">${skillIcon(skill.id)}</span><strong>${skill.name[lang]}</strong></span>
     </button>`).join('')}
     <div class="skill-core" aria-hidden="true"><span>&lt;/&gt;</span><small>${es?'CONECTA':'CONNECT'}</small></div>
    </div>
    <p class="skills-hint">${es?'Cuatro áreas. Un mismo punto de partida.':'Four disciplines. One starting point.'}<span>${es?'Pasa el ratón o toca un sector.':'Hover or tap a sector.'}</span></p>
   </div>
   <div class="skill-insights">
    ${skills.map((skill,index)=>{
     const story=stories[skill.id];
     return `<article class="skill-insight" id="skill-panel-${skill.id}" style="--skill-color:${skill.color}" aria-labelledby="skill-title-${skill.id}">
      <div class="skill-atmosphere" data-skill-ambient aria-hidden="true"></div>
      <div class="skill-editorial">
       <p class="skill-overline"><span class="skill-number" aria-hidden="true">0${index+1}</span>${skill.name[lang]}</p>
       <h4 class="skill-word" id="skill-title-${skill.id}">${story.word[lang]}<span aria-hidden="true">.</span></h4>
       <p class="skill-description">${skill.text[lang]}</p>
       <div class="skill-tool-groups" aria-label="${es?'Tecnologías':'Technologies'}">${story.groups.map(group=>`<div class="skill-tool-group"><h5>${group.label[lang]}</h5><ul>${group.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul></div>`).join('')}</div>
      </div>
     </article>`;
    }).join('')}
   </div>
  </div>
 </section>`;
}
