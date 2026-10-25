# Alejandro Villarrubia · Personal website

Portfolio bilingüe español/inglés con dirección visual de cuaderno editorial. Sitio estático con navegación convencional, 15 proyectos, filtros y búsqueda, páginas de detalle y CV en ambos idiomas.

## Abrir en Windows

Doble clic en **Abrir web.cmd**. Requiere Node.js 22 o posterior. No instala dependencias.

```powershell
npm run dev
```

Vista local: http://127.0.0.1:4173/es/ . La carpeta `dist/` se puede servir en cualquier alojamiento estático. No hay despliegue público configurado.

## Editar

- `src/content.mjs`: perfil, textos, traducciones, proyectos y estados.
- `scripts/build.mjs`: plantillas de las páginas estáticas.
- `public/styles.css`: diseño y adaptación a pantallas.
- `public/app.js`: filtros, menú móvil, copiar correo y navegación de idioma.
- `public/assets/cv/`: PDF descargable en cada idioma.
- `cv/`: fuentes LaTeX del CV; `main.tex` en español y `cv-en.tex` en inglés. `generate-source.py` regenera ambos desde su contenido estructurado.

```powershell
npm run build
npm run check
```

El movimiento respeta `prefers-reduced-motion`. Las transiciones entre páginas usan View Transitions si el navegador las admite; el resto mantiene navegación HTML normal. Todas las fuentes y recursos se sirven localmente. Los filtros y la búsqueda se conservan en la sesión del navegador.

## Contenido y alcance

Perfil basado en los CV de Descargas, el perfil GitHub del autor y su corrección explícita del cargo a Technical Sales Engineer. Proyectos contrastados con sus README locales y repositorios a 25/10/2026. El archivo agrupa sensores/procesamiento LiDAR en una entrada y evita duplicar los checkouts de ChessPrep. Los repositorios de configuración, esta propia web y el material interno de MAHLE no se cuentan como productos del portfolio.

«Realizados» agrupa entregas o aplicaciones funcionales; «En desarrollo» identifica productos experimentales o con funciones principales pendientes. No se presenta como certificación de producción. Las ilustraciones de ChessBot y Pipα son esquemas editoriales; las imágenes de MapForge y entrenamiento ChessBot son capturas reales. No se utiliza una fotografía sustitutiva del autor.

La reconstrucción del CV conserva la trayectoria y recoge la corrección del cargo. La cifra de Elo del PDF anterior se sustituye por la descripción de evaluación experimental que documenta ChessBot. Las fuentes y los PDF finales quedan incluidos para que puedan mantenerse sincronizados.

## Licencias de recursos

DM Sans se distribuye con su licencia OFL en `public/assets/fonts/OFL.txt`. Diagramas y estilo propios. Capturas procedentes de los proyectos locales del autor.
