from pathlib import Path

ROOT = Path(__file__).parent

def esc(s):
    for a,b in [('&',r'\&'),('%',r'\%'),('_',r'\_'),('#',r'\#')]: s=s.replace(a,b)
    return s.replace('Pipα',r'Pip$\alpha$')

def role(title, dates, company, bullets, tech=''):
    result = r'\entry{'+esc(title)+'}{'+esc(dates)+'}{'+esc(company)+'}\n'
    result += '\\begin{itemize}\n'+''.join('\\item '+esc(b)+'\n' for b in bullets)+'\\end{itemize}\n'
    if tech: result += r'{\small\color{muted} '+esc(tech)+'}\\par\\vspace{4pt}\n'
    return result

def section(s): return '\\section*{'+esc(s)+'}\n'

data = {
 'es': {
  'profile': 'PERFIL PROFESIONAL',
  'intro': 'Ingeniero informático con experiencia en desarrollo de software, integración hardware/software y coordinación entre ingeniería, ventas y cliente. Actualmente Technical Sales Engineer en ALTEN Spain para MAHLE, especializado en sistemas de propulsión para e-bike. Experiencia previa en backend con Java, MongoDB y SQL. Interés por construir sistemas desde cero, inteligencia artificial, algoritmos y proyectos técnicos propios.',
  'experience': 'EXPERIENCIA PROFESIONAL',
  'roles': [
   ('Technical Sales Engineer','jul. 2026 -- presente','ALTEN Spain · cliente: MAHLE | Palencia',[
    'Coordino la planificación y seguimiento de flotas de sistemas de propulsión para e-bike junto a Program y Product Management, gestionando recursos, entregables y documentación técnica.',
    'Valido la compatibilidad técnica de cuadros de cliente (Customer Frame Analysis) con los sistemas MAHLE antes de producción.',
    'Participo en test rides y configuración de motor maps (potencia y par), colaborando con Battery and Control Systems para evaluar motores y baterías.',
    'Actúo como enlace entre ventas, ingeniería y cliente, preparando informes técnicos y gestionando muestras y documentación asociada.']),
   ('Software Engineer','oct. 2025 -- jul. 2026','NTT DATA · España (equipo distribuido nacional)',[
    'Desarrollé de forma autónoma una nueva funcionalidad de producto desde cero a partir de una solución existente, participando en el ciclo completo de entrega en Agile/Scrum.',
    'Refactoricé código, corregí errores y resolví incidencias de producción para mejorar mantenibilidad y reducir deuda técnica en un equipo de más de 20 ingenieros.',
    'Participé en diseño, implementación, pruebas, depuración, revisión de código y despliegue.'],'Java · SQL · MongoDB · Git · Agile/Scrum'),
   ('Prácticas -- Desarrollo de software','abr. 2025 -- jul. 2025','REDALSA, S.A.',[
    'Diseñé e implementé desde cero un sistema de detección de objetos en vía mediante LiDAR, con medición de distancias, mapeo y cálculo en tiempo real de posibles colisiones y trayectorias.',
    'Integré hardware y software de forma autónoma, desde captura y procesamiento de señal hasta visualización e interpretación de datos.'],'Python · C · LiDAR · Sistemas embebidos · Adquisición de datos'),
   ('Miembro activo de comisiones','abr. 2024 -- oct. 2025','RITSI · representación nacional de estudiantes de Informática',[
    'Participé en cuatro comisiones estatales con más de 30 universidades, incluyendo organización de congresos nacionales y mantenimiento de herramientas tecnológicas.']),
  ],
  'education': 'FORMACIÓN', 'education_entries': [
    ('Grado en Ingeniería Informática','2021 -- 2026','Universidad Europea Miguel de Cervantes (UEMC)'),
    ('Máster en Inteligencia Artificial e Innovación','2025','Microsoft · Founderz | Formación de posgrado'),
    ('Bachillerato de Ciencias','2015 -- 2021','IES Jorge Manrique'),
  ],
  'projects': 'PROYECTOS SELECCIONADOS', 'project_entries': [
   ('ChessBot -- Motor de ajedrez','2026 -- presente','Proyecto personal · C++20 · UCI · IA local',[
    'Motor propio capaz de jugar y analizar posiciones, con sistemas de búsqueda y evaluación y comunicación UCI con interfaces y otros motores.',
    'Infraestructura de entrenamiento con autojuego, partidas contra otros motores y experimentación con evaluación posicional y redes NNUE.',
    'Aplicación Windows e integración opcional de un LLM local para explicar cálculos del motor. Proyecto en entrenamiento y evaluación, sin Elo certificado.']),
   ('Pipα -- Asistente local y controlador hardware','2026 -- presente','Proyecto personal · Python · ESP32-S3 · Windows · Swift',[
    'Agente local para automatizar aplicaciones, audio, estado del sistema y acciones de control desde un dispositivo externo, con comandos confirmables.',
    'Integración hardware/software: pantalla táctil, voz local, comunicación USB cifrada y Wake-on-LAN. Cliente iOS experimental.']),
   ('Detección de phishing en correo electrónico','2026','Trabajo de Fin de Grado · Python · scikit-learn · Streamlit',[
    'Análisis heurístico de 28 señales (cabeceras, URLs, HTML y SPF/DKIM/DMARC) y clasificador neuronal MLP entrenado con datasets reales.',
    'Pipeline TF-IDF + MLP, interfaces web, extensión de Gmail, pruebas y persistencia del modelo; análisis en español e inglés.']),
   ('AQUILAE -- Simulador Risk Imperio Romano','2025','Colaboración en TFM · Java · Swing · Maven',[
    'Diseñé e implementé el simulador completo, con mapa histórico vectorial de 28 provincias e interfaz Java Swing, como apoyo a un TFM de la Universidad de Valladolid.']),
  ],
  'skills': 'HABILIDADES TÉCNICAS', 'skills_text': [
   ('Lenguajes','Java, Python, C, C++, C#, JavaScript, HTML, PHP, SQL.'),
   ('Datos y herramientas','SQL, MongoDB, Git, Agile/Scrum, Office 365.'),
   ('Especialidades','Algoritmos de búsqueda, UCI, IA/ML, integración hardware/software, LiDAR, sistemas embebidos.'),
  ],
  'certificates':'CERTIFICACIONES E IDIOMAS',
  'cert_text':'B2 First -- Cambridge University · Certificado de Competencias Digitales (tuCertiCyL) · Monitor Autonómico de Ajedrez · Árbitro Autonómico de Ajedrez.',
  'languages':'Español nativo · Inglés B2 (Cambridge First) · Alemán básico.',
  'leadership':'REPRESENTACIÓN Y COMUNIDAD', 'leadership_entries':[
   ('Delegado universitario · EPS, Informática y curso','oct. 2021 -- oct. 2025','UEMC · Representación institucional e interlocución con dirección académica y decanato.'),
   ('Representante de la UEMC en RITSI','oct. 2023 -- nov. 2025','Delegado oficial ante la sectorial nacional de Informática; comisiones y congresos.'),
   ('Secretario · Club Palentino de Ajedrez','mar. 2026 -- presente','Dirección y organización de actividades de un club con más de 40 años de historia.'),
   ('Creador y coordinador','jun. 2024 -- presente','Club de Lectura UEMC · Escuela de Ajedrez UEMC.'),
  ],
 },
 'en': {
  'profile':'PROFESSIONAL PROFILE',
  'intro':'Computer Engineer with experience in software development, hardware/software integration, and coordination across engineering, sales, and customers. Currently a Technical Sales Engineer at ALTEN Spain for MAHLE, specialising in e-bike propulsion systems. Previous backend experience with Java, MongoDB, and SQL. Particularly interested in building systems from scratch, artificial intelligence, algorithms, and personal technical projects.',
  'experience':'PROFESSIONAL EXPERIENCE', 'roles':[
   ('Technical Sales Engineer','Jul. 2026 -- Present','ALTEN Spain · Client: MAHLE | Palencia, Spain',[
    'Coordinate the planning and monitoring of e-bike propulsion system fleets with Program and Product Management, managing resources, deliverables, and technical documentation.',
    'Validate the technical compatibility of customer bicycle frames (Customer Frame Analysis) with MAHLE systems before production.',
    'Participate in test rides and motor map configuration (power and torque), working with Battery and Control Systems to evaluate motors and batteries.',
    'Act as the link between sales, engineering, and customers, preparing technical reports and managing samples and associated documentation.']),
   ('Software Engineer','Oct. 2025 -- Jul. 2026','NTT DATA · Spain (national distributed team)',[
    'Independently developed a new product feature from scratch based on an existing solution, participating in the full delivery cycle in an Agile/Scrum environment.',
    'Refactored code, fixed defects, and resolved production incidents to improve maintainability and reduce technical debt within a team of more than 20 engineers.',
    'Participated in solution design, implementation, testing, debugging, code review, and deployment.'],'Java · SQL · MongoDB · Git · Agile/Scrum'),
   ('Software Development Intern','Apr. 2025 -- Jul. 2025','REDALSA, S.A.',[
    'Designed and implemented a LiDAR-based railway object detection system from scratch, including distance measurement, mapping, and real-time collision and trajectory calculations.',
    'Independently integrated hardware and software, from signal acquisition and processing to data visualisation and interpretation.'],'Python · C · LiDAR · Embedded Systems · Data Acquisition'),
   ('Active Committee Member','Apr. 2024 -- Oct. 2025','RITSI · Spanish national association of Computer Engineering students',[
    'Participated in four national committees involving more than 30 universities, including the organisation of national conferences and maintenance of technology tools.']),
  ],
  'education':'EDUCATION', 'education_entries':[
   ('B.Sc. in Computer Engineering','2021 -- 2026','Universidad Europea Miguel de Cervantes (UEMC)'),
   ('Master’s Program in Artificial Intelligence and Innovation','2025','Microsoft · Founderz | Postgraduate training'),
   ('Science Baccalaureate','2015 -- 2021','IES Jorge Manrique'),
  ],
  'projects':'SELECTED PROJECTS', 'project_entries':[
   ('ChessBot -- Chess Engine','2026 -- Present','Personal project · C++20 · UCI · Local AI',[
    'Custom engine for playing and analysing positions, with search and evaluation systems and UCI communication with interfaces and other engines.',
    'Training infrastructure using self-play, matches against other engines, and experiments with positional evaluation and NNUE networks.',
    'Windows application and optional local LLM integration to explain engine calculations. Training and evaluation are ongoing; no certified Elo rating.']),
   ('Pipα -- Local Assistant and Hardware Controller','2026 -- Present','Personal project · Python · ESP32-S3 · Windows · Swift',[
    'Local agent for automating applications, audio, system status, and control actions from an external device, with confirmable commands.',
    'Hardware/software integration: touchscreen, local voice, encrypted USB communication, and Wake-on-LAN. Experimental iOS client.']),
   ('Email Phishing Detection System','2026','Bachelor’s thesis · Python · scikit-learn · Streamlit',[
    'Heuristic analysis of 28 signals (headers, URLs, HTML, and SPF/DKIM/DMARC) and an MLP neural classifier trained on real-world datasets.',
    'TF-IDF + MLP pipeline, web interfaces, Gmail extension, tests, and model persistence; analysis in Spanish and English.']),
   ('AQUILAE -- Roman Empire Risk Simulator','2025','Master’s thesis collaboration · Java · Swing · Maven',[
    'Designed and implemented the complete simulator with a historical vector map of 28 provinces and a Java Swing interface, supporting a master’s thesis at the University of Valladolid.']),
  ],
  'skills':'TECHNICAL SKILLS', 'skills_text':[
   ('Languages','Java, Python, C, C++, C#, JavaScript, HTML, PHP, SQL.'),
   ('Data and tools','SQL, MongoDB, Git, Agile/Scrum, Office 365.'),
   ('Specialisms','Search algorithms, UCI, AI/ML, hardware/software integration, LiDAR, embedded systems.'),
  ],
  'certificates':'CERTIFICATIONS AND LANGUAGES',
  'cert_text':'B2 First -- Cambridge University · Digital Skills Certificate (tuCertiCyL) · Regional Chess Coach · Regional Chess Arbiter.',
  'languages':'Spanish: Native · English: B2 (Cambridge First) · German: Basic.',
  'leadership':'LEADERSHIP AND COMMUNITY', 'leadership_entries':[
   ('University Student Representative · School, Degree and Class','Oct. 2021 -- Oct. 2025','UEMC · Institutional representation and liaison with academic leadership and the dean’s office.'),
   ('UEMC Representative at RITSI','Oct. 2023 -- Nov. 2025','Official delegate to Spain’s national Computer Engineering student association; committees and conferences.'),
   ('Secretary · Club Palentino de Ajedrez','Mar. 2026 -- Present','Management and organisation of activities for a club with over 40 years of history.'),
   ('Founder and Coordinator','Jun. 2024 -- Present','UEMC Book Club · UEMC Chess School.'),
  ],
 },
}

template = r'''\documentclass[10pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[LANGUAGE]{babel}
\usepackage[margin=14mm,top=13mm,bottom=16mm]{geometry}
\usepackage{xcolor,enumitem,titlesec,tabularx,fancyhdr,lastpage}
\usepackage[hidelinks,unicode]{hyperref}
\definecolor{navy}{HTML}{1D405C}
\definecolor{muted}{HTML}{515B64}
\definecolor{rulecolor}{HTML}{D6DEE4}
\renewcommand{\familydefault}{\sfdefault}
\setlength{\parindent}{0pt}
\setlength{\parskip}{3pt}
\setlist[itemize]{leftmargin=12pt,itemsep=2pt,topsep=3pt,parsep=0pt}
\titleformat{\section}{\color{navy}\small\bfseries}{}{0em}{}[\color{rulecolor}\titlerule]
\titlespacing*{\section}{0pt}{11pt}{5pt}
\newcommand{\entry}[3]{\noindent\begin{tabularx}{\linewidth}{@{}Xr@{}}\textbf{#1}&{\small\color{muted}#2}\end{tabularx}\par{\small\color{muted}#3}\par}
\pagestyle{fancy}\fancyhf{}\renewcommand{\headrulewidth}{0pt}
\fancyfoot[L]{\scriptsize\color{muted}Alejandro Villarrubia · Technical Sales Engineer}
\fancyfoot[R]{\scriptsize\color{muted}\thepage\,/\,\pageref{LastPage}}
\hypersetup{pdftitle={Alejandro Villarrubia -- CV},pdfauthor={Alejandro Villarrubia}}
\begin{document}
{\fontsize{23}{26}\selectfont\bfseries\color{navy} ALEJANDRO VILLARRUBIA}\par
{\large Technical Sales Engineer · Software Engineer}\par
{\small\color{muted}+34 633 58 60 60 · \href{mailto:avillarrubia2@gmail.com}{avillarrubia2@gmail.com} · Palencia, Spain}\par
{\small\href{https://github.com/villarrubi}{github.com/villarrubi} · \href{https://www.linkedin.com/in/alejandro-villarrubia-garc\%C3\%ADa-3078892b9/}{LinkedIn}}\par
'''

for lang,d in data.items():
    t=template.replace('LANGUAGE','spanish' if lang=='es' else 'english')
    if lang=='es': t=t.replace('Palencia, Spain','Palencia, España')
    t+=section(d['profile'])+esc(d['intro'])+'\n'
    t+=section(d['experience'])
    for r in d['roles']: t+=role(*r)
    t+=section(d['education'])
    for title,dates,where in d['education_entries']: t+=r'\entry{'+esc(title)+'}{'+esc(dates)+'}{'+esc(where)+'}\\vspace{3pt}\n'
    t+='\\newpage\n'
    t+=section(d['projects'])
    for r in d['project_entries']: t+=role(*r)
    t+=section(d['skills'])
    for title,txt in d['skills_text']: t+=r'\textbf{'+esc(title)+':} '+esc(txt)+'\\par\n'
    t+=section(d['certificates'])+esc(d['cert_text'])+'\\par\n'+esc(d['languages'])+'\n'
    t+=section(d['leadership'])
    for title,dates,where in d['leadership_entries']: t+=r'\entry{'+esc(title)+'}{'+esc(dates)+'}{'+esc(where)+'}\\vspace{4pt}\n'
    t+='\\end{document}\n'
    (ROOT/('main.tex' if lang=='es' else 'cv-en.tex')).write_text(t,encoding='utf-8')
print('Generated Spanish and English LaTeX sources.')
