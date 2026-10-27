# Alejandro Villarrubia · Personal website

Portfolio bilingüe inglés/español centrado en ingeniería de software, IA local y sistemas físicos, sobre una paleta azul noche. La portada presenta el nombre, la profesión, acceso directo a proyectos y una captura real de Pipα. Los 15 proyectos se pueden recorrer en tarjetas o en una escena orbital predeterminada, con fichas, páginas de detalle y CV en ambos idiomas. El ajedrez se conserva como detalle personal y entrada 3D breve.

## Abrir en Windows

Doble clic en **Abrir web.cmd**. La vista previa abre la portada. La entrada se reproduce al abrir y refrescar la portada, respetando la reducción de movimiento de Windows. El botón «Repetir la entrada» permite verla de nuevo. Requiere Node.js 22 o posterior. No instala dependencias.

```powershell
npm run dev
```

Vista local: http://127.0.0.1:4173/en/ . El idioma predeterminado es inglés, con español disponible desde el selector ES. La carpeta `dist/` se puede servir en cualquier alojamiento estático. Publicación en GitHub Pages: https://villarrubi.github.io/personalWebsite/ . El workflow `.github/workflows/pages.yml` construye y valida la web antes de publicar cada cambio de `main`. `SITE_BASE_PATH` adapta los enlaces, estilos y recursos a la subcarpeta de Pages; sin esa variable la vista local sigue usando la raíz.

## Editar

- `src/content.mjs`: perfil, textos, traducciones, proyectos, estados y visibilidad del código.
- `scripts/build.mjs`: plantillas y generación de páginas estáticas.
- `src/home.mjs`: portada orientada al perfil técnico, tecnologías y contacto.
- `src/project-cases.mjs`: reto, aportación y componentes de Pipα, MapForge y ChessBot; compartidos entre las tarjetas y las páginas de detalle.
- `src/project-explorer.mjs`, `public/project-explorer.js`: vista orbital predeterminada y tarjetas de los 15 proyectos; el selector recuerda la elección durante la sesión, también al cambiar de idioma. `public/project-view-boot.js` aplica esa vista antes de pintar la página para evitar destellos al cambiar de idioma. Sin JavaScript quedan todos los proyectos accesibles por enlaces normales.
- `public/engineering.css`: jerarquía de la portada, tarjetas, componentes técnicos, legibilidad y ajustes de móvil.
- `public/styles.css`: diseño y adaptación a pantallas.
- `public/app.js`: menú móvil, copiar correo y navegación de idioma.
- `public/night.css`: paleta azul noche, marfil y metal cálido, compartida por portada, proyectos, fichas, páginas de detalle y contacto.
- `public/intro-boot.js`, `public/intro.js` y `public/intro.css`: entrada, transición a la portada, repetición, foco y recuperación.
- `public/chess-model.js`: tablero de madera y 32 instancias de seis modelos Staunton. `public/staunton-assets.js` carga las geometrías indexadas y crea las vetas volumétricas de la madera clara y oscura.
- `public/chess-scene.js`: renderizado del tablero, luz de estudio, reflejos, sombras y gestión de recursos.
- `public/chess-code.js`: reconstrucción del tablero y las piezas en caracteres blancos; la misma malla de caracteres toma las formas y colores de la portada y se resuelve por celdas en el HTML real. Usa color y profundidad del tablero y un atlas generado localmente.
- `public/intro-page.js`: guía de color y formas de la portada visible, preparada una vez antes de animar con html2canvas local y las posiciones reales del texto. No se muestra una captura en lugar de la web.
- `public/chess-timeline.js`: recorrido de cámara y encuadre adaptable. `scripts/check-chess.mjs` verifica posiciones, continuidad y encuadre.
- `src/project-map.mjs`: grupos de proyectos, cuerpos en órbita y fichas. `majorProjectIds` define los seis destacados; el resto aparece en complementarios.
- `src/project-bodies.mjs`: versiones SVG representativas de los proyectos para la carga inicial y los navegadores sin WebGL2.
- `public/project-symbols.js`: iconos SVG originales y específicos de los 15 proyectos, compartidos entre las ilustraciones de respaldo y las fichas. Caballos de ajedrez, asistente, mapa, escudo, hoja, calendario, célula, globo, velas de mercado, diálogo y radar ayudan a distinguir su función.
- `public/solar-layout.js`: distribución orbital con separación entre cuerpos y sus nombres, calculada según las dimensiones disponibles y la fase de la órbita.
- `public/solar-system.css` y `public/solar-system.js`: fondo estrellado, selector de grupos y ajuste automático. Una constelación muestra hasta 10 proyectos en escritorio, 6 en pantallas medianas y 4 en pantallas pequeñas. Las colecciones mayores pasan automáticamente a otra constelación cada 16 segundos; los puntos permiten elegir una. El cambio automático se pausa al explorar un cuerpo, enfocar los puntos, abrir una ficha o salir de la sección. El modo de movimiento reducido desactiva el cambio automático y conserva los puntos de navegación.
- `public/orbital-scene.js`: renderizador Three.js/WebGL2 con modelos representativos, metal pulido, acabados cerámicos y luces de estudio para los reflejos. Los cuerpos recorren órbitas, con suavizado para evitar saltos, mientras los nombres y zonas de clic siguen sus posiciones 3D. El movimiento orbital continúa al señalar un proyecto; el foco resalta su modelo suavemente. Mantiene una cámara estable con paralaje sutil y un fondo espacial azul; el renderizado se detiene fuera de pantalla, con la pestaña oculta y al abrir una ficha. Se limita la resolución a 1,25 píxeles por píxel CSS en escritorio y 1 en móvil. La distribución se calcula al cambiar de grupo o tamaño de pantalla. `public/solar-motion.js` distribuye los proyectos a lo largo de una órbita elíptica central, recorrida a velocidad constante por distancia, y comprueba los tamaños durante una vuelta completa para evitar solapamientos; el movimiento no vuelve a ejecutar el ajuste de colisiones. Las etiquetas se posicionan mediante transformaciones. Sin WebGL2 o si se pierde el contexto, permanecen las ilustraciones SVG y los enlaces normales.
- `public/project-models.js`: modelos sólidos originales para los 15 proyectos, con balanceo suave que conserva sus caras reconocibles.
- `public/scene-motion.js`: preferencia compartida de movimiento, control de pausa y opciones `?motion=on` / `?motion=off`, conservadas durante la sesión.
- `public/space-backdrop.js`: nebulosas generadas por shader con flujo continuo, partículas a distintas profundidades y paralaje suave ligado al cursor. La paleta se mantiene entre azul noche y azul grisáceo, con una variación sutil al cambiar de grupo. Las estrellas también varían de brillo y derivan lentamente. El fondo avanza con tiempo real, independientemente de la frecuencia de fotogramas, dentro del mismo bucle de renderizado y comparte sus pausas; la nebulosa se calcula a media resolución y se compone con filtrado lineal; en móvil usa menos partículas y octavas de ruido. El control de pausa congela el fondo.
- `public/assets/space/`: fondo estelar en WebP con atribución y licencia. `public/assets/vendor/`: Three.js 0.180.0 y html2canvas 1.4.1, con sus licencias MIT, servidos localmente.
- `public/project-map.css` y `public/project-map.js`: fichas con diálogo nativo, cierre con Escape y retorno del foco. Sin JavaScript, todos los cuerpos se muestran juntos y enlazan a la página de cada proyecto.
- `public/assets/cv/`: PDF descargable en cada idioma.
- `cv/`: fuentes LaTeX del CV; `main.tex` en español y `cv-en.tex` en inglés. `generate-source.py` regenera ambos desde su contenido estructurado.

```powershell
npm run build
npm run check
```

El movimiento de la escena respeta la preferencia de movimiento reducido del sistema cuando no hay una elección explícita del visitante. El visitante puede pausarlo desde el pie de la escena; su elección se conserva durante la sesión. Las opciones `?motion=on` y `?motion=off` permiten indicar el estado al abrir un enlace. Las transiciones entre páginas usan View Transitions si el navegador las admite; el resto mantiene navegación HTML normal. Todas las fuentes, texturas y bibliotecas se sirven localmente.

Para añadir un proyecto basta con incorporarlo a `src/content.mjs`. Aparece en complementarios por defecto; añadir su ID a `majorProjectIds` lo mueve a destacados. Los IDs nuevos reciben un modelo de navegador web como respaldo, que se puede personalizar en `public/project-models.js` y en su símbolo SVG. Las posiciones, tamaños y constelaciones se calculan automáticamente sin definir coordenadas. `npm run check` verifica distribución, límites y ausencia de solapamientos en varias fases de órbita y colecciones de hasta 100 proyectos. La sección mantiene su altura al añadir proyectos.

## Entrada de ajedrez

La secuencia dura 7,5 segundos una vez preparada, conservando las mismas fases y proporciones de la transformación. El tablero aparece, la cámara sube a una vista oblicua y el tablero y las piezas se convierten en caracteres blancos conservando su forma. El código se extiende por el fondo mientras empieza a adoptar las formas y los colores de la portada: los caracteres de los espacios vacíos desaparecen y los que forman textos e imágenes se conservan. Cada celda se transforma gradualmente en el HTML real de su misma posición, sin un barrido por columnas ni un cambio de escena. La guía visual usa el contenido y la distribución actuales, incluidos el idioma y el tamaño de pantalla; las posiciones de los caracteres se toman del navegador para mantener alineada la tipografía. La captura se prepara antes de animar, con un límite de espera de 3,5 segundos; si no está disponible, queda una disolución por celdas. Si se cambia el tamaño durante la entrada, se deja de utilizar la guía antigua para evitar desalineaciones.

El tablero 3D se captura una vez cuando la cámara se detiene; el resto de la secuencia sólo anima la composición de código. El modelo se sirve localmente en `public/assets/chess/staunton.bin` (1,86 MB). Las seis geometrías Staunton proceden de clarkerubber, bajo licencia MIT, y se comparten entre las 32 piezas; no hay peticiones a terceros en ejecución. html2canvas 1.4.1 sólo se carga cuando se reproduce la entrada y se sirve con su licencia MIT en `public/assets/vendor/`. La página y la escena comparten el fondo `#061327`.

Se reproduce automáticamente al abrir o refrescar la portada, aunque la versión anterior haya guardado que ya se vio. Respeta movimiento reducido y pausa. Los enlaces directos a secciones omiten la entrada al navegar; refrescar una de esas direcciones sí la reproduce y conserva la sección de destino. «Repetir la entrada» solicita otra reproducción; `?intro=cinematic` la fuerza para previsualizar. Las antiguas opciones `knight` y `squares` se resuelven a la nueva entrada. Saltar o Escape liberan inmediatamente la navegación; el foco vuelve a un enlace o al botón de repetición. La carga tiene un límite de espera. Sin JavaScript o WebGL queda una imagen del mismo tablero renderizada desde arriba. Esa imagen WebP (49 KB) se precarga antes del 3D y coincide con su encuadre, evitando el destello de símbolos al cambiar de idioma. No se utilizan iconos Unicode como estado de carga.

El tablero de la portada sólo se renderiza al cambiar de tamaño; no mantiene un bucle de animación en reposo. La secuencia pausa los fotogramas al ocultar la pestaña y libera sus recursos al salir. Los proyectos mantienen su propio control de pausa. `npm run check` verifica también el juego completo y que ninguna pieza salga del encuadre durante el giro en cinco relaciones de aspecto, de móvil a ultrapanorámica.

## Contenido y alcance

Perfil basado en los CV de Descargas, el perfil GitHub del autor y su corrección explícita del cargo a Technical Sales Engineer. Proyectos contrastados con sus README locales y repositorios a 25/10/2026. El archivo agrupa sensores/procesamiento LiDAR en una entrada y evita duplicar los checkouts de ChessPrep. Los repositorios de configuración, esta propia web y el material interno de MAHLE no se cuentan como productos del portfolio.

«Realizados» agrupa entregas o aplicaciones funcionales; «En desarrollo» identifica productos experimentales o con funciones principales pendientes. No se presenta como certificación de producción. Las imágenes de ChessBot, Pipα y MapForge son capturas reales de las aplicaciones. Las portadas las componen mediante CSS; los proyectos secundarios utilizan diagramas editoriales. No se utiliza una fotografía sustitutiva del autor.

La visibilidad del código es independiente del estado de desarrollo y de la clasificación en destacados o complementarios. Hay 7 proyectos públicos y 8 privados, comprobados en GitHub el 25/10/2026; Deriva se incluye entre los privados porque es local y no tiene remoto. Las fichas privadas muestran el proyecto sin enlazar su código. `visibility` es explícito en cada proyecto y debe actualizarse si cambia la visibilidad del repositorio; solo los públicos tienen `repo`. No hay sincronización automática con GitHub.

La reconstrucción del CV conserva la trayectoria y recoge la corrección del cargo. La cifra de Elo del PDF anterior se sustituye por la descripción de evaluación experimental que documenta ChessBot. Las fuentes y los PDF finales quedan incluidos para que puedan mantenerse sincronizados.

## Dirección visual

La portada toma como referencia la composición tipográfica y la navegación de [Calder, de Chayan Panda](https://www.framer.com/marketplace/templates/calder/). Es una implementación propia en este repositorio, con contenido y capturas del autor. Utiliza Instrument Serif para nombre y titulares editoriales, DM Sans para contenido y proyectos, un fondo azul noche con acentos azul verdoso y transiciones entre páginas. Software, IA y hardware ocupan la jerarquía principal; el tablero 3D aparece como detalle personal.

La vista inicial muestra tarjetas con capturas reales, el reto, la aportación del autor y componentes técnicos. Pipα y MapForge preceden a ChessBot. La vista alternativa representa los proyectos en órbita con una cámara estable; el 3D sólo se carga al mostrar esa vista. Las siluetas, los reflejos, los cambios de perspectiva y los materiales físicos dan volumen a cada proyecto. El fondo espacial mantiene estrellas a distintas profundidades y trazas orbitales sutiles. La interacción sigue en HTML nativo para conservar acceso por teclado y enlaces de respaldo. La escena no intercepta el scroll y se pausa cuando está oculta. La proyección de etiquetas actualiza la cámara antes del primer fotograma, también con movimiento reducido.

## Licencias de recursos

DM Sans se distribuye con su licencia OFL en `public/assets/fonts/OFL.txt`. Instrument Serif procede de Google Fonts y conserva su licencia en `public/assets/fonts/InstrumentSerif-OFL.txt`. Capturas procedentes de los proyectos locales del autor; la imagen de Pipα muestra únicamente la vista de resumen del panel. No se han incorporado código ni imágenes de la plantilla de referencia.

Three.js 0.180.0 se incluye con licencia MIT en `public/assets/vendor/THREE-LICENSE.txt`. El fondo estelar procede de [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/), bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), y se ha convertido a WebP. Los créditos del pie enlazan a `public/assets/credits.txt`; la atribución del fondo está en `public/assets/space/ATTRIBUTION.txt`. Las geometrías de los objetos orbitales y su iluminación son propias. Las piezas de la entrada utilizan los modelos Staunton de [clarkerubber](https://github.com/clarkerubber/Staunton-Pieces), con su licencia MIT y atribución en `public/assets/chess/`. El tablero, los materiales de madera y la iluminación de la entrada son propios.

Los modelos de ajedrez se preparan con `python scripts/prepare-staunton.py` a partir de los STL de la revisión indicada en `public/assets/chess/ATTRIBUTION.txt`. Este paso requiere NumPy sólo al actualizar los modelos; el build normal no lo necesita. Si cambian los modelos, la cámara o la iluminación, hay que regenerar `staunton-poster.webp` con la misma vista cenital para conservar la continuidad durante la carga.
