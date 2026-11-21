import {publishedProjects} from './content.mjs';

const skills=[
 {id:'software',name:{es:'Desarrollo de software',en:'Software development'},text:{es:'De la lógica a una aplicación: algoritmos, backend y herramientas que resuelven problemas concretos.',en:'From logic to an application: algorithms, backend systems and tools that solve concrete problems.'},tags:['Python','C++','Java','C#'],color:'#8bc9cf'},
 {id:'ai',name:{es:'IA local',en:'Local AI'},text:{es:'Modelos que se ejecutan en local, integrados en asistentes y herramientas para trabajar con lenguaje natural.',en:'Locally running models, integrated into assistants and tools for working with natural language.'},tags:['Ollama'],color:'#b1a8e6'},
 {id:'hardware',name:{es:'Hardware y sensores',en:'Hardware and sensors'},text:{es:'Conectar código y mundo físico: dispositivos, captura de señales y procesamiento de datos de sensores.',en:'Connecting code to the physical world: devices, signal acquisition and sensor data processing.'},tags:['ESP32-S3','LiDAR'],color:'#97c9af'},
 {id:'interfaces',name:{es:'Interfaces web',en:'Web interfaces'},text:{es:'Interfaces interactivas y visualizaciones que convierten datos y lógica en algo que se puede explorar y utilizar.',en:'Interactive interfaces and visualisations that turn data and logic into something to explore and use.'},tags:['TypeScript','Canvas 2D'],color:'#8caee3'},
];

const stories={
 software:{title:{es:'Ideas que se convierten en sistemas.',en:'Ideas that become systems.'},caption:{es:'Lógica · Arquitectura · Producto',en:'Logic · Architecture · Product'},project:'chessbot',symbol:'{ }'},
 ai:{title:{es:'Inteligencia que corre en tu equipo.',en:'Intelligence running on your machine.'},caption:{es:'Modelos · Contexto · Herramientas',en:'Models · Context · Tools'},project:'pipa',symbol:'✳'},
 hardware:{title:{es:'El código sale de la pantalla.',en:'Code goes beyond the screen.'},caption:{es:'Señales · Dispositivos · Conexiones',en:'Signals · Devices · Connections'},project:'pipa',symbol:'⌁'},
 interfaces:{title:{es:'Lo complejo se vuelve tangible.',en:'Complexity becomes tangible.'},caption:{es:'Interacción · Visualización · Experiencia',en:'Interaction · Visualisation · Experience'},project:'mapforge',symbol:'▧'},
};

function artwork(id){
 const frame=(body)=>`<svg viewBox="0 0 600 320" aria-hidden="true" focusable="false"><g class="skill-drawing">${body}</g></svg>`;
 if(id==='software')return frame(`
  <path class="diagram-wire" d="M96 156H180M420 156H504M300 70V36M300 244V284"/>
  <path class="diagram-plane back" d="M300 56 476 150 300 244 124 150Z"/>
  <path class="diagram-plane" d="M300 88 476 182 300 276 124 182Z"/>
  <path class="diagram-plane front" d="M300 24 476 118 300 212 124 118Z"/>
  <path class="diagram-bright" d="m253 92-38 20 38 20m94-40 38 20-38 20m-31-38-32 76"/>
  <path class="diagram-wire" d="m158 200 142 76 142-76M300 212v64"/>
  <circle class="diagram-node" cx="96" cy="156" r="7"/><circle class="diagram-node" cx="504" cy="156" r="7"/>
  <text x="72" y="192">INPUT</text><text x="476" y="192">OUTPUT</text>`);
 if(id==='ai')return frame(`
  <circle class="diagram-orbit" cx="300" cy="156" r="126"/><circle class="diagram-orbit" cx="300" cy="156" r="100"/>
  <path class="diagram-wire" d="M104 80 240 116 104 156 240 196 104 240M104 80 240 196M104 240 240 116M360 116 496 80M360 116 496 156M360 196 496 156M360 196 496 240M360 196 496 80"/>
  <rect class="diagram-plane front" x="230" y="86" width="140" height="140" rx="28"/>
  <path class="diagram-bright" d="M268 132 300 114 332 132v46l-32 18-32-18Zm32-18v82m-32-64 32 20 32-20m-32 20v44"/>
  ${[80,156,240].map(y=>`<circle class="diagram-node" cx="104" cy="${y}" r="9"/><circle class="diagram-node" cx="496" cy="${y}" r="9"/>`).join('')}
  <text x="300" y="304" text-anchor="middle">LOCAL INFERENCE</text>`);
 if(id==='hardware')return frame(`
  <path class="diagram-plane back" d="m300 34 180 96v72L300 298 120 202v-72Z"/>
  <path class="diagram-plane" d="m300 34 180 96-180 96-180-96Z"/>
  <path class="diagram-wire" d="M300 226v72M120 130v72l180 96 180-96v-72m-324 20 54 29v42m234-71-54 29v42"/>
  <path class="diagram-plane front" d="m300 66 86 46-86 46-86-46v56l86 46 86-46v-56M300 158v56"/>
  <path class="diagram-bright" d="m259 112 22-12 19 25 19-46 24 35"/>
  <path class="diagram-wire" d="M120 166H60v-40M480 166h60v-40M210 221v42h-50M390 221v42h50"/>
  <circle class="diagram-node" cx="60" cy="120" r="7"/><circle class="diagram-node" cx="540" cy="120" r="7"/>
  <text x="300" y="258" text-anchor="middle">ESP32 · SENSORS</text>`);
 return frame(`
  <rect class="diagram-plane back" x="130" y="32" width="380" height="232" rx="12"/>
  <rect class="diagram-plane front" x="90" y="58" width="380" height="232" rx="12"/>
  <path class="diagram-wire" d="M90 96h380M188 96v194"/>
  <circle class="diagram-node" cx="112" cy="77" r="3"/><circle class="diagram-node" cx="126" cy="77" r="3"/><circle class="diagram-node" cx="140" cy="77" r="3"/>
  <path class="diagram-wire" d="M112 122h54m-54 20h36m-36 20h46m-46 20h30"/>
  <rect class="diagram-plane" x="210" y="116" width="238" height="96" rx="5"/>
  <path class="diagram-bright" d="m226 192 42-34 36 12 45-40 42 22 42-22"/>
  <rect class="diagram-plane" x="210" y="230" width="108" height="38" rx="5"/><rect class="diagram-plane" x="336" y="230" width="112" height="38" rx="5"/>
  <path class="diagram-cursor" d="m408 190 19 60 13-22 25-5Z"/>`);
}

export function skillsSection(lang){
 const es=lang==='es';
 return `<section class="about-tools skill-explorer" aria-labelledby="toolbox-title">
  <header class="skills-heading" data-scroll-reveal><p class="skills-kicker">${es?'Competencias técnicas':'Technical skills'}</p><h3 id="toolbox-title">${es?'Del código<br>al <em>mundo real.</em>':'From code<br>to the <em>real world.</em>'}</h3><p>${es?'Software, inteligencia artificial y hardware. Me interesa lo que ocurre cuando los conectas.':'Software, artificial intelligence, and hardware. I’m interested in what happens when you connect them.'}</p></header>
  <div class="skills-workbench">
   <div class="skill-selector" data-skills-ui hidden role="group" aria-label="${es?'Explorar competencias':'Explore skills'}">
    ${skills.map(skill=>`<button type="button" class="skill-choice" style="--skill-color:${skill.color}" data-skill="${skill.id}" aria-controls="skill-panel-${skill.id}" aria-expanded="false"><span class="skill-choice-icon" aria-hidden="true">${stories[skill.id].symbol}</span><span class="skill-choice-copy"><strong>${skill.name[lang]}</strong><small>${stories[skill.id].caption[lang]}</small></span><span class="skill-choice-mark" aria-hidden="true">+</span></button>`).join('')}
    <p class="skills-hint">${es?'Explora las conexiones.':'Explore the connections.'}</p>
   </div>
   <div class="skill-insights">
    ${skills.map(skill=>{
     const story=stories[skill.id],project=publishedProjects.find(project=>project.id===story.project);
     return `<article class="skill-insight" id="skill-panel-${skill.id}" style="--skill-color:${skill.color}" aria-labelledby="skill-title-${skill.id}">
      <div class="skill-art skill-art-${skill.id}" aria-hidden="true"><span class="skill-art-label">${skill.name[lang]}</span>${artwork(skill.id)}<span class="skill-art-caption">${story.caption[lang]}</span></div>
      <div class="skill-story"><h4 id="skill-title-${skill.id}">${story.title[lang]}</h4><p>${skill.text[lang]}</p><ul class="skill-tags" aria-label="${es?'Tecnologías':'Technologies'}">${skill.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
      ${project?`<a class="skill-project" href="/${lang}/projects/${project.id}/"><span>${es?'En mis proyectos':'In my projects'}</span><strong>${lang==='en'?(project.enName||project.name):project.name}</strong><span class="skill-project-action">${es?'Explorar proyecto':'Explore project'}</span></a>`:''}</div>
     </article>`;
    }).join('')}
   </div>
  </div>
 </section>`;
}
