import { loadProjectCatalog } from './project-catalog.mjs';

export const profile = {
  name: 'Alejandro Villarrubia',
  email: 'avillarrubia2@gmail.com',
  github: 'https://github.com/villarrubi',
  linkedin: 'https://www.linkedin.com/in/alejandro-villarrubia-garc%C3%ADa-3078892b9/',
  location: 'Palencia, España',
  role: 'Technical Sales Engineer',
};

export const copy = {
  es: {
    lang: 'Español', other: 'EN', otherLabel: 'Read in English', title: 'Alejandro Villarrubia — Ingeniero informático',
    description: 'Proyectos de Alejandro Villarrubia. Desarrollo de software, inteligencia artificial local, herramientas y sistemas físicos.',
    skip: 'Saltar al contenido', nav: ['Proyectos', 'Sobre mí', 'Contacto'], menu: 'Abrir navegación', closeMenu: 'Cerrar navegación',
    eyebrow: 'INGENIERO INFORMÁTICO · PALENCIA, ES', heroA: 'Ideas que', heroB: 'se convierten', heroC: 'en sistemas.',
    intro: 'Soy Alejandro. Construyo software, exploro la inteligencia artificial y conecto el código con el mundo físico. A veces, todo empieza con una partida de ajedrez.',
    explore: 'Explorar proyectos', about: 'Un poco sobre mí', margin: 'Mi cuaderno, en abierto.',
    currently: 'AHORA', currentText: 'Technical Sales Engineer en ALTEN para MAHLE. Entre software, hardware y sistemas e-bike.',
    selected: '01 / UNA SELECCIÓN', selectedTitle: 'De la idea a algo que funciona.', selectedText: 'Tres proyectos que cuentan bastante bien cómo me gusta construir.',
    viewProject: 'Explorar proyecto', allProjects: 'Ver el archivo completo', inProgress: 'En desarrollo', built: 'Realizado',
    chessNote: 'Pensar varias jugadas por delante.', pipaNote: 'Del código al mundo físico.', mapNote: 'Un pequeño mundo por construir.',
    archive: '02 / EL ARCHIVO', archiveTitle: 'El archivo completo.', archiveText: 'Proyectos realizados, herramientas que sigo afinando e ideas que ya están tomando forma.',
    filters: ['Todos', 'Realizados', 'En desarrollo'], search: 'Buscar por nombre o tecnología', searchPlaceholder: 'Buscar un proyecto…', result: 'proyectos', empty: 'No hay proyectos con esta combinación. Cambia los filtros o la búsqueda.', reset: 'Restablecer filtros y búsqueda',
    projectColumn: 'PROYECTO', areaColumn: 'EXPLORACIÓN', stateColumn: 'ESTADO / CÓDIGO',
    statusFilter: 'Estado', visibilityFilter: 'Código', visibilityFilters: ['Todos', 'Públicos', 'Privados'], publicCode: 'Código público', privateNote: 'El repositorio no es público.', localCodeNote: 'Proyecto local. El código todavía no está publicado.',
    aboutNumber: '03 / AL OTRO LADO DEL TECLADO', aboutTitle: 'Curiosidad como punto de partida.',
    aboutP1: 'Soy ingeniero informático y me gusta entender los sistemas de principio a fin: investigar un problema, construir una solución y convertirla en algo que se pueda usar.',
    aboutP2: 'Mi recorrido pasa por el desarrollo backend en NTT DATA, la integración de sensores LiDAR en REDALSA y mi trabajo actual como Technical Sales Engineer en ALTEN para MAHLE.',
    chessTitle: 'También pienso sobre 64 casillas.', chessText: 'El ajedrez forma parte de mi vida como jugador, monitor, árbitro y secretario del Club Palentino de Ajedrez. Es una afición que acaba colándose en mis proyectos: analizar, probar una idea y volver a mirar la posición.',
    cv: 'Descargar CV', cvNote: 'PDF · Español', skillsLabel: 'EN MI CAJA DE HERRAMIENTAS',
    contactNumber: '04 / LA SIGUIENTE CONVERSACIÓN', contactTitle: '¿Qué construimos?', contactText: 'Un proyecto, una oportunidad profesional o una buena conversación sobre tecnología. Me encantará saber de ti.', email: 'Escríbeme', copyEmail: 'Copiar correo', copied: 'Correo copiado', copyFail: 'No se pudo copiar. Usa el enlace de correo.', footer: 'Hecho con intención. Y curiosidad.', backTop: 'Volver arriba',
    back: 'Volver a proyectos', overview: 'La idea', implementation: 'Qué he construido', statusTitle: 'Dónde está ahora', stack: 'HERRAMIENTAS', code: 'Ver código', live: 'Visitar web', privateCode: 'Código privado', next: 'Seguir explorando', year: 'AÑO', category: 'ÁREA', roleLabel: 'AUTORÍA', personal: 'Proyecto personal', realCapture: 'Captura de la aplicación', diagram: 'Esquema del proyecto', allArchive: 'Archivo de proyectos',
    cvPath: '/assets/cv/Alejandro-Villarrubia-ES.pdf',
  },
  en: {
    lang: 'English', other: 'ES', otherLabel: 'Leer en español', title: 'Alejandro Villarrubia — Software Engineer',
    description: 'Projects by Alejandro Villarrubia. Software development, local AI, tools, and physical systems.',
    skip: 'Skip to content', nav: ['Projects', 'About', 'Contact'], menu: 'Open navigation', closeMenu: 'Close navigation',
    eyebrow: 'SOFTWARE ENGINEER · PALENCIA, ES', heroA: 'Ideas that', heroB: 'turn into', heroC: 'systems.',
    intro: 'I’m Alejandro. I build software, explore artificial intelligence, and connect code to the physical world. Sometimes, it all starts with a game of chess.',
    explore: 'Explore projects', about: 'A little about me', margin: 'My notebook, out in the open.',
    currently: 'NOW', currentText: 'Technical Sales Engineer at ALTEN for MAHLE. Working across software, hardware, and e-bike systems.',
    selected: '01 / SELECTED WORK', selectedTitle: 'From an idea to something that works.', selectedText: 'Three projects that say quite a bit about how I like to build.',
    viewProject: 'Explore project', allProjects: 'Browse the full archive', inProgress: 'In development', built: 'Built',
    chessNote: 'Thinking a few moves ahead.', pipaNote: 'From code to the physical world.', mapNote: 'A small world in the making.',
    archive: '02 / THE ARCHIVE', archiveTitle: 'The complete archive.', archiveText: 'Finished projects, tools I’m still refining, and ideas that are already taking shape.',
    filters: ['All', 'Built', 'In development'], search: 'Search by name or technology', searchPlaceholder: 'Find a project…', result: 'projects', empty: 'No projects match this combination. Try different filters or search terms.', reset: 'Reset filters and search',
    projectColumn: 'PROJECT', areaColumn: 'EXPLORATION', stateColumn: 'STATUS / SOURCE',
    statusFilter: 'Status', visibilityFilter: 'Source', visibilityFilters: ['All', 'Public', 'Private'], publicCode: 'Public source', privateNote: 'The repository is not public.', localCodeNote: 'A local project. The source has not been published yet.',
    aboutNumber: '03 / BEYOND THE KEYBOARD', aboutTitle: 'Curiosity is the starting point.',
    aboutP1: 'I’m a software engineer who likes understanding systems end to end: investigating a problem, building a solution, and turning it into something people can use.',
    aboutP2: 'My experience spans backend development at NTT DATA, LiDAR sensor integration at REDALSA, and my current role as a Technical Sales Engineer at ALTEN for MAHLE.',
    chessTitle: 'I also think on 64 squares.', chessText: 'Chess is part of my life as a player, coach, arbiter, and secretary of Club Palentino de Ajedrez. It finds its way into my projects: analyse, test an idea, and look at the position again.',
    cv: 'Download CV', cvNote: 'PDF · English', skillsLabel: 'IN MY TOOLBOX',
    contactNumber: '04 / THE NEXT CONVERSATION', contactTitle: 'What shall we build?', contactText: 'A project, a professional opportunity, or a good conversation about technology. I’d love to hear from you.', email: 'Get in touch', copyEmail: 'Copy email', copied: 'Email copied', copyFail: 'Could not copy. Please use the email link.', footer: 'Made with intention. And curiosity.', backTop: 'Back to top',
    back: 'Back to projects', overview: 'The idea', implementation: 'What I’ve built', statusTitle: 'Where it stands', stack: 'TOOLBOX', code: 'View source', live: 'Visit website', privateCode: 'Private source', next: 'Keep exploring', year: 'YEAR', category: 'AREA', roleLabel: 'AUTHORSHIP', personal: 'Personal project', realCapture: 'Application screenshot', diagram: 'Project diagram', allArchive: 'Project archive',
    cvPath: '/assets/cv/Alejandro-Villarrubia-EN.pdf',
  },
};

export const projects = await loadProjectCatalog();

// Publication is an explicit editorial choice, independent of status and source visibility.
// Missing published flags default to hidden, including newly added projects.
export const publishedProjects = projects.filter(project => project.published === true);

export const getName = (project, lang) => lang === 'en' && project.enName ? project.enName : project.name;
export const getTagName = (tag, lang) => lang === 'en' ? ({'Simulación':'Simulation','Cartografía':'Cartography','Universidad':'University'}[tag] || tag) : tag;
