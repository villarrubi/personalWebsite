// Technologies checked against repository manifests and implementation, 2026-11-21.
const skills=[
 {id:'software',name:{es:'Software y servicios',en:'Software and services'},text:{es:'Diseño de aplicaciones, algoritmos y servicios. Conecto lógica, APIs y bases de datos para construir sistemas que se puedan mantener y ampliar.',en:'Application, algorithm and service design. I connect logic, APIs and databases to build systems that can be maintained and extended.'},tags:['C++','C# / .NET','Python','Java / Swing','FastAPI','Node.js / Express','SQLite','PHP / MySQL'],color:'#e8b68c'},
 {id:'ai',name:{es:'IA y análisis de datos',en:'AI and data analysis'},text:{es:'Preparación de datos, aprendizaje automático y modelos de lenguaje locales. Exploro cómo clasificar, predecir, generar respuestas y evaluar resultados.',en:'Data preparation, machine learning and local language models. I explore classification, prediction, response generation and evaluation.'},tags:['scikit-learn','PyTorch','Ollama','NumPy','pandas','Streamlit'],color:'#b9a0f4'},
 {id:'hardware',name:{es:'Hardware y sensores',en:'Hardware and sensors'},text:{es:'Conecto dispositivos y software: firmware, adquisición de señales, comunicación y procesamiento de datos del entorno físico.',en:'Connecting devices and software through firmware, signal acquisition, communication and processing data from the physical world.'},tags:['C++ / Arduino','ESP32-S3','PlatformIO','PCL / Eigen','Open3D','USB / TCP','Linux'],color:'#85cbb0'},
 {id:'interfaces',name:{es:'Interfaces y mundos',en:'Interfaces and worlds'},text:{es:'Interfaces web y de escritorio, visualización de datos y entornos 2D y 3D. Transformo la lógica de un sistema en algo que se puede explorar y utilizar.',en:'Web and desktop interfaces, data visualisation and 2D and 3D environments. I turn system logic into something people can explore and use.'},tags:['JavaScript / TypeScript','React','Electron','Canvas 2D','Three.js / WebGL','MapLibre','Godot / GDScript'],color:'#80b8e7'},
];

const stories={
 software:{title:{es:'De la lógica al sistema.',en:'From logic to systems.'},caption:{es:'Código · Servicios · Datos',en:'Code · Services · Data'}},
 ai:{title:{es:'Aprender, analizar y generar.',en:'Learn, analyse and generate.'},caption:{es:'Datos · Modelos · Resultados',en:'Data · Models · Results'}},
 hardware:{title:{es:'Conectar el mundo físico.',en:'Connecting the physical world.'},caption:{es:'Sensores · Firmware · Comunicación',en:'Sensors · Firmware · Communication'}},
 interfaces:{title:{es:'Dar forma a la interacción.',en:'Shaping interaction.'},caption:{es:'Web · Escritorio · Visualización',en:'Web · Desktop · Visualisation'}},
};

function skillIcon(id){
 const paths={software:'<rect x="3" y="4" width="26" height="24" rx="4"/><path d="M3 10h26m-18 5-4 4 4 4m10-8 4 4-4 4m-3-10-4 12"/>',ai:'<path d="M4 25V7m0 18h24M9 20l5-7 5 3 8-10"/><circle cx="14" cy="13" r="2"/><circle cx="19" cy="16" r="2"/>',hardware:'<rect x="8" y="8" width="16" height="16" rx="3"/><path d="M12 3v5m8-5v5m-8 16v5m8-5v5M3 12h5m-5 8h5m16-8h5m-5 8h5"/><rect x="12" y="12" width="8" height="8" rx="1"/>',interfaces:'<rect x="3" y="4" width="26" height="23" rx="3"/><path d="M3 10h26M11 10v17m5-12h8m-8 5h5"/><path d="m23 20 2 10 3-4 4-2Z"/>'};
 return `<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[id]}</svg>`;
}
function artwork(id,lang){
 const es=lang==='es';
 const frame=body=>`<svg viewBox="0 0 600 280" aria-hidden="true" focusable="false"><g class="skill-product">${body}</g></svg>`;
 const window=(title,body)=>`<rect class="product-shadow" x="52" y="24" width="496" height="238" rx="16"/><rect class="product-window" x="44" y="16" width="512" height="240" rx="14"/><path class="product-divider" d="M44 54h512"/><circle fill="#ed8a92" cx="64" cy="35" r="4"/><circle fill="#e9c882" cx="79" cy="35" r="4"/><circle fill="#8acbb0" cx="94" cy="35" r="4"/><text class="product-muted" x="118" y="40">${title}</text>${body}`;
 if(id==='software')return frame(window(es?'Desarrollo de software':'Software development',`
  <rect class="product-input" x="64" y="74" width="242" height="158" rx="8"/>
  <text class="product-muted" x="80" y="98">service.ts</text>
  <text class="product-code" data-scene-reveal x="80" y="128">async function run() {</text>
  <text class="product-code" data-scene-reveal x="80" y="158">  await process(data);</text>
  <text class="product-code" data-scene-reveal x="80" y="188">  return result;</text>
  <text class="product-code" x="80" y="216">}</text>
  <path class="product-cable" data-scene-trace pathLength="1" d="M307 151h32m-7-6 7 6-7 6M435 119v40"/>
  <rect class="product-accent-soft" x="350" y="79" width="176" height="49" rx="7"/>
  <text class="product-small" x="438" y="109" text-anchor="middle">API / ${es?'Servicios':'Services'}</text>
  <rect class="product-accent-soft" data-scene-reveal x="350" y="167" width="176" height="49" rx="7"/>
  <text class="product-small" x="438" y="197" text-anchor="middle">${es?'Lógica + Datos':'Logic + Data'}</text>`));
 if(id==='ai')return frame(window(es?'Inteligencia artificial':'Artificial intelligence',`
  <rect class="product-input" x="64" y="87" width="113" height="126" rx="8"/>
  <text class="product-small" x="120" y="111" text-anchor="middle">${es?'Datos':'Data'}</text>
  ${[0,1,2,3].map(i=>`<path class="product-skeleton" data-scene-reveal d="M83 ${132+i*18}h${62-i*9}"/>`).join('')}
  <path class="product-cable" data-scene-trace pathLength="1" d="M182 152h34m-7-6 7 6-7 6M350 152h25v-43h24m-24 43v43h24"/>
  <circle class="product-accent-soft" cx="283" cy="148" r="56"/>
  <path class="product-wave" data-scene-trace pathLength="1" d="m252 126 62 42m-62 0 62-42m-62 0v42m31-59v78m31-61v42M252 126l31-17 31 17m-62 42 31 19 31-19"/>
  ${[[252,126],[252,168],[283,109],[283,148],[283,187],[314,126],[314,168]].map(([x,y])=>`<circle class="product-accent" cx="${x}" cy="${y}" r="5"/>`).join('')}
  <rect class="product-bubble" x="401" y="79" width="132" height="61" rx="8"/>
  <path class="product-wave" data-scene-trace pathLength="1" d="m414 125 20-14 22 7 25-24 18 10 20-13"/>
  <rect class="product-bubble" x="401" y="166" width="132" height="61" rx="8"/>
  <path class="product-skeleton" data-scene-reveal d="M418 184h94m-94 16h69"/>
  <text class="product-muted" x="283" y="244" text-anchor="middle">${es?'Aprendizaje + Generación':'Learning + Generation'}</text>`));
 if(id==='hardware')return frame(window(es?'Sistemas conectados':'Connected systems',`
  <rect class="product-board" x="66" y="86" width="157" height="130" rx="12"/>
  <rect class="product-chip" x="108" y="117" width="72" height="65" rx="7"/>
  <path class="product-pin" d="M117 105v12m18-12v12m18-12v12m18-12v12m-54 65v13m18-13v13m18-13v13m18-13v13M96 129h12m-12 17h12m-12 17h12m72-34h12m-12 17h12m-12 17h12"/>
  <path class="product-cable" data-scene-trace pathLength="1" d="M223 150h101m-9-7 9 7-9 7"/>
  <circle class="product-accent" data-scene-reveal cx="85" cy="103" r="4"/>
  <rect class="product-input" x="336" y="85" width="196" height="132" rx="9"/>
  <path class="product-divider" d="M352 111h164m-164 34h164m-164 34h164"/>
  <path class="product-wave" data-scene-trace pathLength="1" d="M350 151h17l10-20 12 42 14-65 16 78 14-40 12 18 14-35 12 22h46"/>
  <text class="product-muted" x="144" y="240" text-anchor="middle">${es?'Firmware':'Firmware'}</text>
  <text class="product-muted" x="435" y="240" text-anchor="middle">${es?'Captura + Procesamiento':'Capture + Processing'}</text>`));
 return frame(window(es?'Diseño de interfaces':'Interface design',`
  <rect class="product-sidebar" x="45" y="55" width="104" height="200" rx="8"/>
  <circle class="product-accent" cx="70" cy="80" r="8"/>
  <path class="product-skeleton" d="M65 112h61m-61 27h43m-43 27h52m-52 27h35"/>
  <rect class="product-accent-soft" x="167" y="74" width="105" height="46" rx="7"/>
  <rect class="product-accent-soft" data-scene-reveal x="285" y="74" width="105" height="46" rx="7"/>
  <rect class="product-input" x="167" y="135" width="223" height="98" rx="7"/>
  <path class="product-wave" data-scene-trace pathLength="1" d="m182 209 31-26 31 12 34-40 27 17 35-19 34 4"/>
  <rect class="product-window" x="417" y="71" width="113" height="165" rx="14"/>
  <path class="product-divider" d="M453 83h39"/>
  <rect class="product-accent-soft" data-scene-reveal x="431" y="100" width="85" height="51" rx="6"/>
  <path class="product-skeleton" d="M435 169h74m-74 15h53"/>
  <rect class="product-accent" x="432" y="203" width="83" height="16" rx="6"/>
  <path class="product-pointer" data-scene-cursor d="m352 102 8 29 7-10 12-2Z"/>`));
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
    ${skills.map(skill=>{
     const story=stories[skill.id];
     return `<article class="skill-insight" id="skill-panel-${skill.id}" style="--skill-color:${skill.color}" aria-labelledby="skill-title-${skill.id}">
      <div class="skill-art skill-art-${skill.id}"><span class="skill-art-label" aria-hidden="true">${skill.name[lang]}</span>${artwork(skill.id,lang)}<span class="skill-art-caption" aria-hidden="true">${story.caption[lang]}</span></div>
      <div class="skill-story"><h4 id="skill-title-${skill.id}">${story.title[lang]}</h4><p>${skill.text[lang]}</p><ul class="skill-tags" aria-label="${es?'Tecnologías':'Technologies'}">${skill.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
      </div>
     </article>`;
    }).join('')}
   </div>
  </div>
 </section>`;
}
