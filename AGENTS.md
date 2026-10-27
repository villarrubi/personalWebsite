# Instrucciones del proyecto

## Publicación

El usuario ha autorizado expresamente hacer push ahora y después de cada conjunto de cambios terminado en esta web. Esta preferencia se mantiene para futuras tareas en este repositorio.

- Tras implementar y validar los cambios solicitados, crear un commit descriptivo y hacer push a `origin/main`, sin volver a pedir confirmación.
- Antes del push, comprobar el estado remoto y ejecutar las validaciones pertinentes (`npm run build` y `npm run check` para cambios de la web). Comprobar también `SITE_BASE_PATH=personalWebsite` cuando se modifiquen rutas o recursos.
- Incluir únicamente los archivos del trabajo solicitado. No subir capturas de revisión, registros, fuentes descargadas ni otros materiales temporales de `artifacts/`, y no incluir cambios ajenos.
- No usar force push ni descartar trabajo existente. Si el remoto ha avanzado, integrar sus cambios conservando el trabajo de ambas partes.
- Después del push, comprobar el despliegue de GitHub Pages y que la versión nueva está accesible en https://villarrubi.github.io/personalWebsite/ antes de afirmar que está publicada.
- Si existe un bloqueo de autenticación, validación o despliegue, explicar qué falta. No dar por publicada una versión solo porque el commit o el push hayan terminado.

La preferencia se aplica a los cambios realizados como parte de las tareas de esta web; no requiere un proceso que vigile o publique automáticamente cualquier edición externa.
