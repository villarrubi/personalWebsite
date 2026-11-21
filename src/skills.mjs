import {publishedProjects} from './content.mjs';

const skills=[
 {id:'software',name:{es:'Desarrollo de software',en:'Software development'},text:{es:'De la lógica a una aplicación: algoritmos, backend y herramientas que resuelven problemas concretos.',en:'From logic to an application: algorithms, backend systems and tools that solve concrete problems.'},tags:['Python','C++','Java','C#'],color:'#e8b68c'},
 {id:'ai',name:{es:'IA local',en:'Local AI'},text:{es:'Modelos que se ejecutan en local, integrados en asistentes y herramientas para trabajar con lenguaje natural.',en:'Locally running models, integrated into assistants and tools for working with natural language.'},tags:['Ollama'],color:'#b9a0f4'},
 {id:'hardware',name:{es:'Hardware y sensores',en:'Hardware and sensors'},text:{es:'Conectar código y mundo físico: dispositivos, captura de señales y procesamiento de datos de sensores.',en:'Connecting code to the physical world: devices, signal acquisition and sensor data processing.'},tags:['ESP32-S3','LiDAR'],color:'#85cbb0'},
 {id:'interfaces',name:{es:'Interfaces web',en:'Web interfaces'},text:{es:'Interfaces interactivas y visualizaciones que convierten datos y lógica en algo que se puede explorar y utilizar.',en:'Interactive interfaces and visualisations that turn data and logic into something to explore and use.'},tags:['TypeScript','Canvas 2D'],color:'#80b8e7'},
];

const stories={
 software:{title:{es:'Ideas que se convierten en sistemas.',en:'Ideas that become systems.'},caption:{es:'Lógica · Arquitectura · Producto',en:'Logic · Architecture · Product'},project:'chessbot',symbol:'{ }'},
 ai:{title:{es:'Inteligencia que corre en tu equipo.',en:'Intelligence running on your machine.'},caption:{es:'Modelos · Contexto · Herramientas',en:'Models · Context · Tools'},project:'pipa',symbol:'✳'},
 hardware:{title:{es:'El código sale de la pantalla.',en:'Code goes beyond the screen.'},caption:{es:'Señales · Dispositivos · Conexiones',en:'Signals · Devices · Connections'},project:'pipa',symbol:'⌁'},
 interfaces:{title:{es:'Lo complejo se vuelve tangible.',en:'Complexity becomes tangible.'},caption:{es:'Interacción · Visualización · Experiencia',en:'Interaction · Visualisation · Experience'},project:'mapforge',symbol:'▧'},
};

function artwork(id,lang){
 const es=lang==='es';
 const frame=body=>`<svg viewBox="0 0 600 280" aria-hidden="true" focusable="false"><g class="skill-product">${body}</g></svg>`;
 const window=(title,body)=>`<rect class="product-shadow" x="52" y="24" width="496" height="238" rx="16"/><rect class="product-window" x="44" y="16" width="512" height="240" rx="14"/><path class="product-divider" d="M44 54h512"/><circle fill="#ed8a92" cx="64" cy="35" r="4"/><circle fill="#e9c882" cx="79" cy="35" r="4"/><circle fill="#8acbb0" cx="94" cy="35" r="4"/><text class="product-muted" x="118" y="40">${title}</text>${body}`;
 if(id==='software')return frame(window('engine.py',`
  <rect class="product-sidebar" x="45" y="55" width="52" height="186" rx="6"/>
  <text class="product-line" x="65" y="90">01</text><text class="product-line" x="65" y="121">02</text><text class="product-line" x="65" y="152">03</text><text class="product-line" x="65" y="183">04</text>
  <text class="product-code" data-scene-reveal x="116" y="90"><tspan fill="#c8a9f0">def</tspan> <tspan fill="#94d9df">choose_move</tspan>(board):</text>
  <text class="product-code" data-scene-reveal x="138" y="121">moves = board.legal_moves</text>
  <text class="product-code" data-scene-reveal x="138" y="152">best = evaluate(moves)</text>
  <text class="product-code" data-scene-reveal x="138" y="183"><tspan fill="#c8a9f0">return</tspan> best</text>
  <rect class="product-accent-soft" x="113" y="207" width="418" height="30" rx="6"/>
  <path class="product-check" data-scene-trace pathLength="1" d="m127 222 5 5 9-11"/><text class="product-small" x="151" y="227">${es?'Pruebas completadas':'Tests passed'}</text><text class="product-muted" x="453" y="227">4 / 4</text>`));
 if(id==='ai')return frame(window(es?'Asistente local':'Local assistant',`
  <circle class="product-accent" cx="518" cy="35" r="4"/>
  <rect class="product-accent-soft" x="228" y="70" width="304" height="45" rx="13"/>
  <text class="product-code" data-scene-reveal x="245" y="98">${es?'¿Por dónde empezamos?':'Where do we start?'}</text>
  <rect class="product-avatar" x="67" y="131" width="30" height="30" rx="10"/>
  <path class="product-spark" d="m82 138 3 6 6 2-6 3-3 6-2-6-6-3 6-2Z"/>
  <rect class="product-bubble" x="108" y="128" width="365" height="68" rx="13"/>
  <text class="product-code" data-scene-reveal x="124" y="154">${es?'Vamos paso a paso.':'Let’s take it step by step.'}</text>
  <rect class="product-skeleton" data-scene-reveal x="124" y="168" width="205" height="5" rx="2"/><rect class="product-skeleton faint" data-scene-reveal x="124" y="180" width="145" height="4" rx="2"/>
  <rect class="product-input" x="67" y="211" width="465" height="29" rx="9"/><text class="product-muted" x="81" y="230">${es?'Escribe un mensaje…':'Write a message…'}</text>
  <circle class="product-accent" cx="516" cy="225" r="9"/><path class="product-send" d="M516 230v-9m-4 4 4-4 4 4"/>`));
 if(id==='hardware')return frame(`
  <rect class="product-shadow" x="62" y="42" width="254" height="205" rx="20"/>
  <rect class="product-board" x="54" y="30" width="252" height="210" rx="17"/>
  ${[72,198].flatMap(y=>[76,283].map(x=>`<circle class="product-mount" cx="${x}" cy="${y}" r="5"/>`)).join('')}
  <path class="product-trace" d="M90 88h45v34m-45 38h45v-15m90-57h47v48m-47 9h47v41M158 174v46m26-46v46M90 111v27h24m112 22h24v42"/>
  ${Array.from({length:6},(_,i)=>`<path class="product-pin" d="M${142+i*14} 83v13m0 77v13M112 ${101+i*13}h14m102 0h14"/>`).join('')}
  <rect class="product-chip" x="126" y="96" width="102" height="78" rx="7"/><text class="product-chip-label" x="177" y="129" text-anchor="middle">ESP32</text><text class="product-small" x="177" y="150" text-anchor="middle">S3</text>
  <circle class="product-accent" cx="91" cy="204" r="4"/><rect class="product-port" x="150" y="222" width="56" height="27" rx="5"/>
  <path class="product-cable" data-scene-trace pathLength="1" d="M306 132h28q15 0 15-15V99h19"/>
  <rect class="product-window" x="365" y="45" width="190" height="185" rx="14"/>
  <text class="product-muted" x="384" y="73">LiDAR</text><circle class="product-accent" cx="533" cy="68" r="4"/>
  <text class="product-reading" data-scene-reveal x="384" y="117">1.24<tspan class="product-small"> m</tspan></text>
  <path class="product-divider" d="M384 190h152M384 157h152"/>
  <path class="product-wave-fill" d="M384 184 402 178 414 185 427 150 440 166 454 136 467 159 480 152 494 170 510 143 536 154v48H384Z"/>
  <path class="product-wave" data-scene-trace pathLength="1" d="m384 184 18-6 12 7 13-35 13 16 14-30 13 23 13-7 14 18 16-27 26 11"/>`);
 return frame(window('mapforge.app',`
  <rect class="product-sidebar" x="45" y="55" width="122" height="200" rx="8"/>
  <text class="product-small" x="62" y="86">MapForge</text><rect class="product-accent-soft" x="57" y="101" width="98" height="26" rx="6"/>
  <text class="product-muted" x="67" y="119">${es?'Terreno':'Terrain'}</text>
  <path class="product-skeleton" d="M64 147h70m-70 23h51m-51 23h60"/>
  <rect class="product-map" x="183" y="70" width="356" height="166" rx="9"/>
  <path class="product-land" d="m183 139 52-23 41 13 45-33 42 6 30-26 43 9 23-15h80v166H183Z"/>
  <path class="product-land-near" d="m183 202 42-22 40 8 38-31 49 9 48-31 41 15 38-31 60 18v99H183Z"/>
  <path class="product-river" data-scene-trace pathLength="1" d="M389 72c-35 35 28 40-10 68s-7 39-39 52-27 31-35 44"/>
  <path class="product-contour" d="m197 158 43-18 35 12 51-34m87 73 30-22 58 5m-292 42 53-10 45-31"/>
  <rect class="product-map-control" x="500" y="81" width="27" height="53" rx="5"/><path class="product-control-lines" d="M508 95h11m-5-5v10m-6 21h11"/>
  <path class="product-pointer" data-scene-cursor d="m448 186 8 29 7-10 12-2Z"/>`));
}

export function skillsSection(lang){
 const es=lang==='es';
 return `<section id="skills" class="about-tools skill-explorer" aria-labelledby="toolbox-title">
  <header class="skills-heading" data-scroll-reveal><p class="skills-kicker">${es?'Competencias técnicas':'Technical skills'}</p><h3 id="toolbox-title">${es?'Del código<br>al <em>mundo real.</em>':'From code<br>to the <em>real world.</em>'}</h3><p>${es?'Software, inteligencia artificial y hardware. Me interesa lo que ocurre cuando los conectas.':'Software, artificial intelligence, and hardware. I’m interested in what happens when you connect them.'}</p></header>
  <div class="skills-workbench">
   <div class="skill-selector" data-skills-ui hidden role="group" aria-label="${es?'Explorar competencias':'Explore skills'}">
    <div class="skill-compass">
     <div class="skill-compass-rings" aria-hidden="true"></div>
     ${skills.map((skill,index)=>`<button type="button" class="skill-choice skill-choice-${skill.id}" style="--skill-color:${skill.color}" data-skill="${skill.id}" aria-controls="skill-panel-${skill.id}" aria-expanded="false">
      <svg class="skill-sector" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g transform="rotate(${index*90} 200 200)"><path d="M77.3 68.4 A180 180 0 0 1 322.7 68.4 L252.5 143.7 A77 77 0 0 0 147.5 143.7 Z"/><path class="skill-sector-edge" d="M85.4 77.1 A168 168 0 0 1 314.6 77.1"/></g></svg>
      <span class="skill-label"><span class="skill-choice-icon" aria-hidden="true">${stories[skill.id].symbol}</span><strong>${skill.name[lang]}</strong></span>
     </button>`).join('')}
     <div class="skill-core" aria-hidden="true"><span>&lt;/&gt;</span><small>${es?'CONECTA':'CONNECT'}</small></div>
    </div>
    <p class="skills-hint">${es?'Cuatro áreas. Un mismo punto de partida.':'Four disciplines. One starting point.'}<span>${es?'Pasa el ratón o toca un sector.':'Hover or tap a sector.'}</span></p>
   </div>
   <div class="skill-insights">
    ${skills.map(skill=>{
     const story=stories[skill.id],project=publishedProjects.find(project=>project.id===story.project);
     return `<article class="skill-insight" id="skill-panel-${skill.id}" style="--skill-color:${skill.color}" aria-labelledby="skill-title-${skill.id}">
      <div class="skill-art skill-art-${skill.id}"><span class="skill-art-label" aria-hidden="true">${skill.name[lang]}</span><button type="button" class="skill-motion" data-skill-motion hidden aria-label="${es?'Animar escena: ':'Animate scene: '}${skill.name[lang]}"><span aria-hidden="true">▷</span> ${es?'Ver en acción':'See it in action'}</button>${artwork(skill.id,lang)}<span class="skill-art-caption" aria-hidden="true">${story.caption[lang]}</span></div>
      <div class="skill-story"><h4 id="skill-title-${skill.id}">${story.title[lang]}</h4><p>${skill.text[lang]}</p><ul class="skill-tags" aria-label="${es?'Tecnologías':'Technologies'}">${skill.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
      ${project?`<a class="skill-project" href="/${lang}/projects/${project.id}/"><span>${es?'En mis proyectos':'In my projects'}</span><strong>${lang==='en'?(project.enName||project.name):project.name}</strong><span class="skill-project-action">${es?'Explorar proyecto':'Explore project'}</span></a>`:''}</div>
     </article>`;
    }).join('')}
   </div>
  </div>
 </section>`;
}
