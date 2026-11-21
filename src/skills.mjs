import {publishedProjects} from './content.mjs';

// Technologies checked against repository manifests and implementation, 2026-11-21.
const skills=[
 {id:'software',name:{es:'Software y servicios',en:'Software and services'},text:{es:'Motores en C++, aplicaciones .NET y Java, APIs y persistencia. Del protocolo UCI de ChessBot a servicios con FastAPI y Node.js.',en:'C++ engines, .NET and Java applications, APIs and persistence. From ChessBot’s UCI protocol to FastAPI and Node.js services.'},tags:['C++','C# / .NET','Python','Java / Swing','FastAPI','Node.js / Express','SQLite','PHP / MySQL'],color:'#e8b68c'},
 {id:'ai',name:{es:'IA y análisis de datos',en:'AI and data analysis'},text:{es:'Clasificación de correo con TF-IDF y MLP, entrenamiento NNUE y explicaciones con modelos locales. Cada modelo tiene una función concreta.',en:'Email classification with TF-IDF and MLP, NNUE training and explanations using local models. Each model serves a specific purpose.'},tags:['scikit-learn','PyTorch','Ollama','NumPy','pandas','Streamlit','python-chess'],color:'#b9a0f4'},
 {id:'hardware',name:{es:'Hardware y sensores',en:'Hardware and sensors'},text:{es:'Firmware e interfaz ESP32-S3 para Pipα. En otros sistemas, captura LiDAR, nubes de puntos y comunicación cliente-servidor en Linux.',en:'ESP32-S3 firmware and interface for Pipα. In separate systems, LiDAR capture, point clouds and client-server communication on Linux.'},tags:['C++ / Arduino','ESP32-S3','PlatformIO','PCL / Eigen','Open3D','USB / TCP','Linux'],color:'#85cbb0'},
 {id:'interfaces',name:{es:'Interfaces y mundos',en:'Interfaces and worlds'},text:{es:'Webs con React, editores de escritorio, visualización 3D y juegos. MapForge pinta mundos por celdas; el atlas celular usa Three.js.',en:'React websites, desktop editors, 3D visualisation and games. MapForge paints cell-based worlds; the cell atlas uses Three.js.'},tags:['JavaScript / TypeScript','React','Electron','Canvas 2D','Three.js / WebGL','MapLibre','Godot / GDScript'],color:'#80b8e7'},
];

const stories={
 software:{title:{es:'Del motor a la aplicación.',en:'From engine to application.'},caption:{es:'ChessBot · Motor C++ · Interfaz .NET',en:'ChessBot · C++ engine · .NET interface'},project:'chessbot'},
 ai:{title:{es:'Modelos que analizan y explican.',en:'Models that analyse and explain.'},caption:{es:'Detector de phishing · Texto y señales',en:'Phishing detector · Text and signals'},project:'phishing'},
 hardware:{title:{es:'Dispositivos y datos reales.',en:'Devices and real-world data.'},caption:{es:'Pipα / USB · LiDAR / Nubes de puntos',en:'Pipα / USB · LiDAR / Point clouds'},project:'pipa'},
 interfaces:{title:{es:'Herramientas para explorar y crear.',en:'Tools for exploring and creating.'},caption:{es:'MapForge · Editor por celdas · Electron',en:'MapForge · Cell-based editor · Electron'},project:'mapforge'},
};

function skillIcon(id){
 const paths={software:'<rect x="3" y="4" width="26" height="24" rx="4"/><path d="M3 10h26m-18 5-4 4 4 4m10-8 4 4-4 4m-3-10-4 12"/>',ai:'<path d="M4 25V7m0 18h24M9 20l5-7 5 3 8-10"/><circle cx="14" cy="13" r="2"/><circle cx="19" cy="16" r="2"/>',hardware:'<rect x="8" y="8" width="16" height="16" rx="3"/><path d="M12 3v5m8-5v5m-8 16v5m8-5v5M3 12h5m-5 8h5m16-8h5m-5 8h5"/><rect x="12" y="12" width="8" height="8" rx="1"/>',interfaces:'<rect x="3" y="4" width="26" height="23" rx="3"/><path d="M3 10h26M11 10v17m5-12h8m-8 5h5"/><path d="m23 20 2 10 3-4 4-2Z"/>'};
 return `<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]}</svg>`;
}
function artwork(id,lang){
 const es=lang==='es';
 const frame=body=>`<svg viewBox="0 0 600 280" aria-hidden="true" focusable="false"><g class="skill-product">${body}</g></svg>`;
 const window=(title,body)=>`<rect class="product-shadow" x="52" y="24" width="496" height="238" rx="16"/><rect class="product-window" x="44" y="16" width="512" height="240" rx="14"/><path class="product-divider" d="M44 54h512"/><circle fill="#ed8a92" cx="64" cy="35" r="4"/><circle fill="#e9c882" cx="79" cy="35" r="4"/><circle fill="#8acbb0" cx="94" cy="35" r="4"/><text class="product-muted" x="118" y="40">${title}</text>${body}`;
 if(id==='software')return frame(window('ChessBot · C++ / C#',`
  <rect class="product-input" x="64" y="74" width="240" height="154" rx="8"/>
  <text class="product-small" x="80" y="100">${es?'Motor · UCI':'Engine · UCI'}</text>
  <text class="product-code" data-scene-reveal x="80" y="132">position startpos</text>
  <text class="product-code" data-scene-reveal x="80" y="162">go depth 12</text>
  <text class="product-code" data-scene-reveal x="80" y="201">bestmove e2e4</text>
  <path class="product-cable" data-scene-trace pathLength="1" d="M307 148h30m-8-7 8 7-8 7"/>
  ${Array.from({length:64},(_,i)=>`<rect x="${351+i%8*20}" y="${68+Math.floor(i/8)*20}" width="20" height="20" fill="${(i+Math.floor(i/8))%2?'#63847f':'#d1dacf'}"/>`).join('')}
  <rect data-scene-reveal x="431" y="148" width="20" height="60" fill="#e8b68c88"/>
  <circle class="product-chip" cx="441" cy="158" r="6"/><path class="product-control-lines" d="M441 177v-9m-4 4 4-4 4 4"/>
  <text class="product-muted" x="386" y="246">WinForms</text>`));
 if(id==='ai')return frame(window(es?'Detector de phishing':'Phishing detector',`
  <rect class="product-bubble" x="65" y="79" width="163" height="137" rx="10"/>
  <path class="product-wave" d="M85 100h121v56H85Zm0 0 60 36 61-36"/>
  <text class="product-small" x="83" y="185">${es?'Correo entrante':'Incoming email'}</text>
  <path class="product-cable" data-scene-trace pathLength="1" d="M236 147h30m-7-6 7 6-7 6"/>
  <rect class="product-accent-soft" x="276" y="79" width="255" height="137" rx="10"/>
  <text class="product-code" data-scene-reveal x="295" y="112">TF-IDF → MLP</text>
  <text class="product-small" data-scene-reveal x="295" y="145">${es?'Texto + enlaces + cabeceras':'Text + links + headers'}</text>
  <path class="product-check" data-scene-trace pathLength="1" d="m295 177 7 7 13-15"/>
  <text class="product-small" data-scene-reveal x="327" y="183">${es?'Análisis explicable':'Explainable analysis'}</text>
  <text class="product-muted" x="218" y="241">scikit-learn · Streamlit</text>`));
 if(id==='hardware')return frame(`
  <text class="product-small" x="154" y="27" text-anchor="middle">Pipα · ESP32-S3</text>
  <circle class="product-board" cx="104" cy="122" r="65"/><circle class="product-input" cx="104" cy="122" r="53"/>
  <text class="product-code" x="104" y="113" text-anchor="middle">Pipα</text><path class="product-wave" data-scene-trace pathLength="1" d="M69 136h9l7-13 9 23 9-31 11 28 8-15 7 8h10"/>
  <path class="product-cable" data-scene-trace pathLength="1" d="M169 122h28v23h20"/>
  <rect class="product-window" x="216" y="100" width="65" height="60" rx="5"/><path class="product-divider" d="M210 169h77m-47-9v9"/>
  <text class="product-muted" x="154" y="228" text-anchor="middle">USB · ${es?'Agente Python':'Python agent'}</text>
  <path class="product-divider" d="M310 43v197"/>
  <text class="product-small" x="451" y="27" text-anchor="middle">LiDAR · PCL</text>
  <path class="product-trace" d="m348 190 94 40 112-51m-112 51V60m0 170-86-75"/>
  <g data-scene-reveal>${Array.from({length:60},(_,i)=>`<circle cx="${358+(i*37%183)}" cy="${76+(i*23%117)}" r="2.5" fill="${i%3?'#85cbb0':'#dce8ef'}"/>`).join('')}</g>
  <path class="product-wave" data-scene-trace pathLength="1" d="m410 99 49-20 42 23v66l-49 21-42-24V99l42 20 49-17m-49 17v70"/>
  <text class="product-muted" x="451" y="258" text-anchor="middle">${es?'Nubes de puntos · C++':'Point clouds · C++'}</text>`);
 return frame(window('MapForge · Electron',`
  <rect class="product-sidebar" x="45" y="55" width="122" height="200" rx="8"/>
  <text class="product-small" x="62" y="86">${es?'Pincel':'Brush'}</text>
  <rect class="product-accent-soft" x="57" y="101" width="98" height="26" rx="6"/>
  <text class="product-muted" x="67" y="119">${es?'Terreno':'Terrain'}</text>
  <rect x="64" y="145" width="24" height="22" rx="3" fill="#83ad80"/><rect x="99" y="145" width="24" height="22" rx="3" fill="#d2bd8c"/>
  <rect x="64" y="179" width="24" height="22" rx="3" fill="#6293b0"/><rect x="99" y="179" width="24" height="22" rx="3" fill="#8b969d"/>
  ${Array.from({length:112},(_,i)=>{const x=i%14,y=Math.floor(i/14);return `<rect x="${184+x*25}" y="${64+y*22}" width="24" height="21" fill="${x===Math.floor(5+Math.sin(y)*2)||x===Math.floor(6+Math.sin(y)*2)?'#6293b0':(x+y)%7===0?'#698b65':'#83ad80'}"/>`;}).join('')}
  <g data-scene-reveal><rect x="434" y="152" width="24" height="21" fill="#d2bd8c"/><rect x="459" y="152" width="24" height="21" fill="#d2bd8c"/><rect x="459" y="174" width="24" height="21" fill="#d2bd8c"/></g>
  <path class="product-pointer" data-scene-cursor d="m448 166 8 29 7-10 12-2Z"/>`));
}

export function skillsSection(lang){
 const es=lang==='es';
 return `<section id="skills" class="about-tools skill-explorer" aria-labelledby="toolbox-title">
  <header class="skills-heading" data-scroll-reveal><p class="skills-kicker">${es?'Competencias técnicas':'Technical skills'}</p><h3 id="toolbox-title">${es?'Del código<br>al <em>mundo real.</em>':'From code<br>to the <em>real world.</em>'}</h3><p>${es?'Software, datos, dispositivos e interfaces. Cuatro formas de construir, conectadas por proyectos reales.':'Software, data, devices and interfaces. Four ways to build, connected through real projects.'}</p></header>
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
    ${skills.map(skill=>{
     const story=stories[skill.id],project=publishedProjects.find(project=>project.id===story.project);
     return `<article class="skill-insight" id="skill-panel-${skill.id}" style="--skill-color:${skill.color}" aria-labelledby="skill-title-${skill.id}">
      <div class="skill-art skill-art-${skill.id}"><span class="skill-art-label" aria-hidden="true">${skill.name[lang]}</span>${artwork(skill.id,lang)}<span class="skill-art-caption" aria-hidden="true">${story.caption[lang]}</span></div>
      <div class="skill-story"><h4 id="skill-title-${skill.id}">${story.title[lang]}</h4><p>${skill.text[lang]}</p><ul class="skill-tags" aria-label="${es?'Tecnologías':'Technologies'}">${skill.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
      ${project?`<a class="skill-project" href="/${lang}/projects/${project.id}/"><span>${es?'En mis proyectos':'In my projects'}</span><strong>${lang==='en'?(project.enName||project.name):project.name}</strong><span class="skill-project-action">${es?'Explorar proyecto':'Explore project'}</span></a>`:''}</div>
     </article>`;
    }).join('')}
   </div>
  </div>
 </section>`;
}
