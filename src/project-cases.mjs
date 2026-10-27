// Editorial summaries derived from the documented scope in content.mjs.
export const caseOrder = ['pipa', 'mapforge', 'chessbot'];
export const projectCases = {
  pipa: {
    image:'pipa-control.jpg', width:1089, height:485,
    es:{problem:'Controlar el ordenador desde un asistente local y un dispositivo físico, manteniendo las acciones bajo control.',contribution:'He construido el agente Windows y su panel de control, los comandos con confirmación y la comunicación con ESP32-S3.',flow:['Agente Python','USB cifrado','ESP32-S3'],focus:'Software + hardware'},
    en:{problem:'Control a computer through a local assistant and a physical device, while staying in control of its actions.',contribution:'I built the Windows agent and control panel, commands with confirmations, and communication with ESP32-S3.',flow:['Python agent','Encrypted USB','ESP32-S3'],focus:'Software + hardware'},
  },
  mapforge: {
    image:'mapforge.png', width:1440, height:960,
    es:{problem:'Crear escenarios 2D que se puedan editar, guardar y reutilizar en una simulación.',contribution:'He construido el editor con pinceles, capas e historial, la generación por semillas y la exportación a JSON versionado.',flow:['Semilla reproducible','Editor Canvas 2D','Mundo en JSON'],focus:'Herramientas de escritorio'},
    en:{problem:'Create 2D environments that can be edited, saved, and reused in a simulation.',contribution:'I built the editor with brushes, layers, and history, seed-based generation, and versioned JSON export.',flow:['Reproducible seed','Canvas 2D editor','JSON world'],focus:'Desktop tools'},
  },
  chessbot: {
    image:'chessbot-app.png', width:1040, height:760,
    es:{problem:'Entender cómo decide un motor, desde las reglas hasta la búsqueda y la evaluación de posiciones.',contribution:'He construido el motor en C++20, su protocolo UCI y la aplicación de análisis, con herramientas de autojuego y experimentación.',flow:['Motor C++20','Protocolo UCI','Aplicación de análisis'],focus:'Algoritmos e inteligencia artificial'},
    en:{problem:'Understand how an engine makes decisions, from the rules to search and position evaluation.',contribution:'I built the C++20 engine, its UCI protocol, and the analysis application, with self-play and experimentation tools.',flow:['C++20 engine','UCI protocol','Analysis application'],focus:'Algorithms and AI'},
  },
};
export function technicalFlow(id,lang){
  const data=projectCases[id]?.[lang];
  if(!data)return '';
  return `<ol class="technical-flow" aria-label="${lang==='es'?'Componentes del proyecto':'Project components'}">${data.flow.map(item=>`<li>${item}</li>`).join('')}</ol>`;
}
