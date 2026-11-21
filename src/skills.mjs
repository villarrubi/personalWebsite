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
function artwork(id){
 const prefix=`skill-object-${id}`;
 const paint=name=>`url(#${prefix}-${name})`;
 const defs=`<defs>
  <linearGradient id="${prefix}-top" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0e9e1"/><stop offset=".55" stop-color="var(--skill-color)"/><stop offset="1" stop-color="#6c7886"/></linearGradient>
  <linearGradient id="${prefix}-left" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#697888"/><stop offset="1" stop-color="#192a3d"/></linearGradient>
  <linearGradient id="${prefix}-right" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--skill-color)"/><stop offset="1" stop-color="#304454"/></linearGradient>
  <linearGradient id="${prefix}-glass" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#edf8ff" stop-opacity=".36"/><stop offset=".5" stop-color="var(--skill-color)" stop-opacity=".12"/><stop offset="1" stop-color="var(--skill-color)" stop-opacity=".35"/></linearGradient>
  <radialGradient id="${prefix}-light" cx=".32" cy=".22" r=".8"><stop stop-color="#fff"/><stop offset=".32" stop-color="var(--skill-color)"/><stop offset="1" stop-color="#364459"/></radialGradient>
  <radialGradient id="${prefix}-halo"><stop stop-color="var(--skill-color)" stop-opacity=".22"/><stop offset="1" stop-color="var(--skill-color)" stop-opacity="0"/></radialGradient>
 </defs>`;
 const frame=body=>`<svg class="skill-object" viewBox="0 0 600 300" aria-hidden="true" focusable="false">${defs}<ellipse cx="300" cy="256" rx="145" ry="25" fill="${paint('halo')}"/>${body}</svg>`;
 const cube=(x,y,size,depth,motion='')=>`<g transform="translate(${x} ${y})"><g ${motion}>
  <path d="M0 0 ${size} ${size*.5} 0 ${size} ${-size} ${size*.5}Z" fill="${paint('top')}" stroke="#f5ecdf66"/>
  <path d="M${-size} ${size*.5} 0 ${size}v${depth}l${-size} ${-size*.5}Z" fill="${paint('left')}" stroke="#9cafbf45"/>
  <path d="M0 ${size} ${size} ${-size*.5}v${depth}L0 ${size+depth}Z" fill="${paint('right')}" stroke="#d9e5eb55"/>
  <path d="m${-size*.8} ${size*.48} ${size*.8} ${size*.4} ${size*.8} ${-size*.4}" fill="none" stroke="#fff" stroke-opacity=".32"/>
 </g></g>`;
 if(id==='software')return frame(`
  <ellipse cx="300" cy="154" rx="177" ry="110" fill="${paint('halo')}"/>
  <path class="object-wire" d="m160 188 140 70 140-70-140-70Z"/>
  ${cube(300,119,57,55)}
  ${cube(238,89,57,55,'data-object-motion="assemble" data-dx="-34" data-dy="-18"')}
  ${cube(362,89,57,55,'data-object-motion="assemble" data-dx="34" data-dy="-18"')}
  ${cube(300,56,57,55,'data-object-motion="assemble" data-dx="0" data-dy="-38"')}
  <path class="object-energy" data-scene-trace pathLength="1" d="m167 193 70 35m126 0 70-35"/>
  <circle class="object-spark" data-scene-reveal cx="300" cy="251" r="4"/>`);
 if(id==='ai'){
  const points=Array.from({length:82},(_,i)=>{
   const y=1-2*(i+.5)/82,r=Math.sqrt(1-y*y),angle=i*2.39996323;
   const z=Math.sin(angle)*r,x=Math.cos(angle)*r;
   return {x:300+x*111,y:145+y*111,z,r:2.1+(z+1)*1.8,dx:Math.sin(i*3.7)*30,dy:Math.cos(i*2.3)*24};
  }).sort((a,b)=>a.z-b.z);
  return frame(`<ellipse cx="300" cy="145" rx="149" ry="134" fill="${paint('halo')}"/>
   <g data-object-motion="orbit"><ellipse class="object-wire" cx="300" cy="145" rx="165" ry="51" transform="rotate(-24 300 145)"/><ellipse class="object-wire" cx="300" cy="145" rx="132" ry="111" transform="rotate(34 300 145)"/>
   ${points.filter(p=>p.z>0).map((p,i,front)=>{const q=front[(i+7)%front.length];return Math.hypot(p.x-q.x,p.y-q.y)<98?`<path class="object-connection" data-scene-trace pathLength="1" d="M${p.x} ${p.y} ${q.x} ${q.y}"/>`:'';}).join('')}
   ${points.map(p=>`<g data-object-motion="organize" data-dx="${p.dx.toFixed(1)}" data-dy="${p.dy.toFixed(1)}"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}" fill="${paint('light')}" opacity="${(.4+(p.z+1)*.3).toFixed(2)}"/></g>`).join('')}
   </g>`);
 }
 if(id==='hardware')return frame(`
  <ellipse cx="300" cy="153" rx="172" ry="111" fill="${paint('halo')}"/>
  <path d="m116 157 184-92 184 92v11l-184 92-184-92Z" fill="${paint('left')}" stroke="#8da9b84d"/>
  <path d="m116 157 184-92 184 92-184 92Z" fill="${paint('glass')}" stroke="#a3e4c788"/>
  ${[-1,1].flatMap(sign=>[0,1,2].map(i=>{const x=300+sign*(70+i*24),y=157+(i-1)*12;return `<path class="object-circuit" d="M${300+sign*45} ${136+i*15} ${x} ${y} ${x+sign*36} ${y-18}"/><path class="object-energy" data-scene-trace pathLength="1" d="M${300+sign*45} ${136+i*15} ${x} ${y} ${x+sign*36} ${y-18}"/><circle class="object-spark" data-scene-reveal cx="${x+sign*36}" cy="${y-18}" r="3"/>`;})).join('')}
  ${cube(300,97,67,32)}
  <path d="m262 127 38-19 38 19-38 19Z" fill="${paint('glass')}" stroke="#e3ffec99"/>
  <path class="object-energy" data-scene-trace pathLength="1" d="m284 128 16-8 16 8-16 8Z"/>
  ${[-1,1].flatMap(sign=>[0,1,2,3].map(i=>`<path d="m${300+sign*(12+i*14)} ${182-i*7}v12l${sign*11} 5" fill="none" stroke="#b2c4cb" stroke-width="4" stroke-linejoin="round"/>`)).join('')}`);
 const plane=(y,shift,content)=>`<g transform="translate(0 ${y})"><g data-object-motion="layer" data-dy="${shift}"><path d="m164 104 147-74 137 70v9l-147 74-137-70Z" fill="${paint('left')}" opacity=".65"/><path d="m164 104 147-74 137 70-147 74Z" fill="${paint('glass')}" stroke="#cbe8ff99"/><path d="m179 105 122 61 132-66" fill="none" stroke="#e7f5ff66"/>${content}</g></g>`;
 return frame(`<ellipse cx="300" cy="150" rx="178" ry="125" fill="${paint('halo')}"/>
  ${plane(82,12,'')}
  ${plane(41,0,'<path class="object-wire" d="m215 109 96-48 86 44-96 48Zm31-15 86 43m-55-58 86 43m-117 4 96-48"/>')}
  ${plane(0,-18,`<path d="m207 103 45-23 39 20-45 23Z" fill="${paint('top')}" opacity=".8"/><path d="m270 72 42-21 49 25-42 21Z" fill="${paint('glass')}" stroke="#b3d9f0"/><path class="object-energy" data-scene-trace pathLength="1" d="m275 132 57-29m-43 36 69-34m-55 41 69-34"/>`)}
  <circle class="object-spark" data-scene-reveal cx="311" cy="29" r="4"/>`);
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
      <div class="skill-art skill-art-${skill.id}"><span class="skill-art-label" aria-hidden="true">${skill.name[lang]}</span><div class="skill-object-stage" data-skill-stage="${skill.id}">${artwork(skill.id)}</div><span class="skill-art-caption" aria-hidden="true">${story.caption[lang]}</span></div>
      <div class="skill-story"><h4 id="skill-title-${skill.id}">${story.title[lang]}</h4><p>${skill.text[lang]}</p><ul class="skill-tags" aria-label="${es?'Tecnologías':'Technologies'}">${skill.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul>
      </div>
     </article>`;
    }).join('')}
   </div>
  </div>
 </section>`;
}
