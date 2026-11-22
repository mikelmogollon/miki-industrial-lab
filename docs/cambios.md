# Cambios · v0.6.0

## Revisión de arquitectura

Se añade curriculum.js para separar identidades permanentes y posiciones. Se actualizan learning, storage, progression, app, ui y completion para conservar accesos, marcas e informes y usar el predecesor/siguiente configurados. Se amplían las ayudas contextuales en sorting-ui. Sin cambios de averías, simulación, distribución o número de niveles. Pruebas finales: 92/92. Detalle en revision-arquitectura.md.

## Primera entrega

Entrega de revisión del 22 de noviembre de 2026, construida sobre el ZIP local completo v0.5.0. La base superó sus 71 pruebas antes de modificarla; se conservó una copia íntegra con SHA-256 **F231A5D674F6ABD6F9A9CD22D26B070B6DAC7DC5910D6C066E3659351687B8A4**.

- Nivel 5: **La caja no se clasifica correctamente**. Tres causas: Y1 abierta, FR5 ajustado a presión insuficiente y a1 sin confirmación pese a extensión física.
- Dos tipos de caja: rama principal para baja y desvío lateral para alta, con conteos independientes y sin duplicar recepciones.
- Modelo neumático concentrado con presión variable, suministro, regulación, aislamiento, presión retenida, descarga y aseguramiento del actuador.
- EV1 5/2 monoestable: Y1 acciona la extensión; el muelle devuelve la válvula. Ambas carreras del cilindro dependen del aire.
- Esquema neumático seleccionable: cinco puertos, escapes, dos posiciones, bobina, muelle, cilindro y manómetro. Piston y lectura responden al modelo.
- GRAFCET de clasificación con rama de caja baja, supervisión de extensión y retorno, alarma y captura del disparo.
- Intervenciones sobre dos energías: las eléctricas conservan comprobación de instrumento y conductores; la neumática exige descarga, manómetro, aseguramiento, revisión y ajuste acotado.
- Se reutilizan TON, el núcleo de transición/registro y la UI GRAFCET. La física de clasificación se separa de la presentación. El motor del nivel 4 conserva su integración por eventos.
- Carrera amplía a quince casos, desbloqueo por dos causas del nivel 4 e insignia de dominio del nivel 5, conservando almacenamiento y progresión anteriores.
- Se añadieron 17 pruebas; las 88 actuales pasan. Se completaron los quince casos en Carrera y los tres nuevos también en Práctica.

Se corrigió durante la validación una pérdida de referencia al botón Reparar al pasar a la reposición. Se mantiene aparcado en la guía igual que en los niveles anteriores. Se ajustaron etiquetas, ramas del grafo, conexiones eléctricas, símbolos, posición del manómetro y fases de intervención a partir de la revisión visual.

## Alcance de archivos

Nuevos: level-05.js, sequence-runtime.js, pneumatic-model.js, sorting-sequence.js, sorting-intervention.js, sorting-simulation.js, sorting-views.js, sorting-ui.js, sorting.css y pruebas/documentos de v0.6.0.

Compartidos ampliados: index.html, app.js, ui.js, simulation.js, workflow.js, measurements.js, schematics.js, sequence-engine.js y grafcet-ui.js. Se conservan los datos de niveles 1–4, modelos anteriores, intervención base, almacenamiento, aprendizaje y progresión; la auditoría detalla los hashes. La salida SVG de los esquemas 1–4 se comparó con la base y permanece idéntica.

No se añade nivel 6, pagos, cuentas, tutorial general ni rediseño global. La futura unificación gráfica, animaciones, vista general de fábrica y presentación pública quedan reservadas para una actualización posterior, tras aprobar el nivel 5. No se ha publicado nada.
