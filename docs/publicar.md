# Publicar v0.6.0 después de aprobar

La entrega está disponible para revisión local. No se han modificado GitHub, main ni la web pública.

1. Extrae el ZIP, abre index.html y revisa Práctica libre. Conserva el respaldo de v0.5.0 y exporta el progreso del navegador.
2. Cuando apruebes, consulta **Settings → Pages** en tu repositorio para identificar la rama y carpeta de publicación reales.
3. Crea una rama **revision-v0.6.0** desde main. Una rama permite revisar una copia de trabajo antes de unirla a la pública.
4. En esa rama, **Add file → Upload files**: sube index.html y las carpetas completas css, js y levels a la carpeta usada por Pages. El índice no debe quedar dentro de una carpeta adicional MIKI_Lab_v0.6.0.
5. Guarda un commit con un mensaje como **Añadir clasificación electroneumática v0.6.0**. Es un guardado identificado de los cambios.
6. Abre una **Pull request** hacia main para comparar. Comprueba que incluye level-05.js, sorting.css, sequence-runtime.js y los seis módulos pneumatic-model/sorting, además de los archivos compartidos modificados.
7. Solo tras revisar y aprobar, usa **Merge**. Si Pages publica desde main, esto actualizará la web. Si usa otra rama o un flujo Actions, sigue esa configuración real.
8. Comprueba Actions y la web: versión 0.6.0, cinco niveles, herramientas, casos, recarga y progreso. Guarda la versión anterior para poder restaurarla mediante otro commit si fuese necesario.

README, docs y tests pueden acompañar al código. Los respaldos ZIP, capturas y preview.cjs no son necesarios para que Pages funcione. Mantén la estructura de carpetas y no borres datos del navegador para actualizar: la clave y formato siguen siendo compatibles.

Referencia de [GitHub Pages sobre la fuente de publicación](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). No se ha consultado ni alterado la configuración real del repositorio para esta entrega.
