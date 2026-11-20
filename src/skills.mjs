const skills=[
 {id:'software',name:{es:'Desarrollo de software',en:'Software development'},text:{es:'De la lógica a una aplicación: algoritmos, backend y herramientas que resuelven problemas concretos.',en:'From logic to an application: algorithms, backend systems and tools that solve concrete problems.'},tags:['Python','C++','Java','C#'],color:'#8bc9cf'},
 {id:'ai',name:{es:'IA local',en:'Local AI'},text:{es:'Modelos que se ejecutan en local, integrados en asistentes y herramientas para trabajar con lenguaje natural.',en:'Locally running models, integrated into assistants and tools for working with natural language.'},tags:['Ollama'],color:'#b1a8e6'},
 {id:'hardware',name:{es:'Hardware y sensores',en:'Hardware and sensors'},text:{es:'Conectar código y mundo físico: dispositivos, captura de señales y procesamiento de datos de sensores.',en:'Connecting code to the physical world: devices, signal acquisition and sensor data processing.'},tags:['ESP32-S3','LiDAR'],color:'#97c9af'},
 {id:'interfaces',name:{es:'Interfaces web',en:'Web interfaces'},text:{es:'Interfaces interactivas y visualizaciones que convierten datos y lógica en algo que se puede explorar y utilizar.',en:'Interactive interfaces and visualisations that turn data and logic into something to explore and use.'},tags:['TypeScript','Canvas 2D'],color:'#8caee3'},
];

export function skillsSection(lang){
 const es=lang==='es';
 return `<section class="about-tools skill-explorer" aria-labelledby="toolbox-title">
  <header class="skills-heading" data-scroll-reveal><h3 id="toolbox-title">${es?'Competencias técnicas':'Technical skills'}</h3><p>${es?'Cuatro áreas que conecto al construir.':'Four areas I connect when building.'}</p></header>
  <div class="skill-compass" data-skills-ui hidden role="group" aria-labelledby="toolbox-title" aria-describedby="skills-hint">
   <div class="skill-orbit" aria-hidden="true"></div>
   ${skills.map((skill,index)=>`<button type="button" class="skill-choice skill-choice-${skill.id}" style="--skill-color:${skill.color};--skill-order:${index}" data-skill="${skill.id}" aria-controls="skill-panel-${skill.id}" aria-expanded="false">
    <svg class="skill-sector" viewBox="0 0 400 400" aria-hidden="true" focusable="false"><g transform="rotate(${index*90} 200 200)"><path d="M 77.4 97.2 A 160 160 0 0 1 322.6 97.2 L 261.3 148.6 A 80 80 0 0 0 138.7 148.6 Z"/><path class="skill-sector-edge" d="M 84.3 102.9 A 151 151 0 0 1 315.7 102.9"/></g><text x="${[200,320,200,80][index]}" y="${[84,204,324,204][index]}" text-anchor="middle">0${index+1}</text></svg>
    <span class="skill-label"><i aria-hidden="true"></i>${skill.name[lang]}<span aria-hidden="true">↗</span></span>
   </button>`).join('')}
   <div class="skill-core" aria-hidden="true"><span>&lt;/&gt;</span><small>${es?'EXPLORA':'EXPLORE'}</small></div>
  </div>
  <p class="skills-hint" id="skills-hint" data-skills-ui hidden>${es?'Pasa el ratón, enfoca o toca un área.':'Hover, focus or tap an area.'}</p>
  <div class="skill-insights">
   <p class="skill-intro" data-skills-ui hidden>${es?'Elige una conexión para descubrir cómo la utilizo.':'Choose a connection to discover how I use it.'}</p>
   ${skills.map(skill=>`<article class="skill-insight" id="skill-panel-${skill.id}" style="--skill-color:${skill.color}" aria-labelledby="skill-title-${skill.id}"><h4 id="skill-title-${skill.id}">${skill.name[lang]}</h4><p>${skill.text[lang]}</p><ul class="skill-tags" aria-label="${es?'Tecnologías':'Technologies'}">${skill.tags.map(tag=>`<li>${tag}</li>`).join('')}</ul></article>`).join('')}
  </div>
 </section>`;
}
