# Pruebas ejecutadas · v0.6.0

**Revisión de arquitectura:** 92 pruebas superadas. Incluye las 88 anteriores y cuatro de reordenación/persistencia. Véase revision-arquitectura.md para las comprobaciones nuevas. El recorrido en navegador de esta revisión conserva 1500 XP, quince casos y dieciséis informes al reordenar.

## Validación de la primera entrega v0.6.0

Validación local del 22 de noviembre de 2026. Base comprobada antes de modificar: **71/71 pruebas de v0.5.0**. Resultado final: **88 pruebas superadas, 0 fallos**. Salida TAP completa en **pruebas-automaticas.tap**. Ejecución sin dependencias: **node --test tests/*.test.cjs**.

## Cobertura automática

Se conservan las 71 pruebas anteriores y se añaden 17 de clasificación. Se ejecutan los doce casos previos y los tres nuevos con diagnóstico, preparación, reparación, recuperación, verificación y recompensa.

Las nuevas pruebas cubren caja alta desviada, baja recta sin Y1, posición inicial, extensión/retorno, tres evidencias de fallo diferentes, presión retenida y descarga, aseguramiento, Paro y retorno real, pérdida de aire durante movimiento, falta de a0, falta de a1, tensiones con bobina abierta y aislamiento, rechazo de presión como lectura de multímetro, descarga/manómetro/aseguramiento obligatorios, ajuste acotado, desbloqueo tras dos causas diferentes, datos anteriores, Práctica aislada, repetición sin XP infinito, conteo único, tamaños de avance y entradas inválidas. Se comprueba además que los bornes del plano 5 son nodos reales y que el monitor representa las transiciones del programa.

El motor del nivel 4 se ensaya también con el núcleo de transición compartido cargado. Mantiene sus pruebas de TON, captura, igualdad B3/PT y diferencias de ±0,0001 s. Estas igualdades se ensayaron automáticamente, no por pulsación manual.

## Recorrido real en navegador

Vista HTTP local en puerto 4190, con controles visibles, selección de puntas y medidas reales de la aplicación. No se alteraron variables internas para completar casos. Carrera comenzó con 0 XP en ese origen de ensayo.

| Nivel | Casos completados en Carrera | Resultado observado |
| --- | --- | --- |
| 1 | S0 abierto, F2 abierto, K1 | 3/3, 100/100 y +100 XP por caso |
| 2 | F3 abierta, B1 desalineado, W1 | 3/3, 100/100 y +100 XP por caso |
| 3 | W2 abierto, K2, F4 abierta | 3/3, 100/100 y +100 XP por caso |
| 4 | B3 alto sin caja, atasco, PT corto | 3/3, 100/100 y +100 XP por caso |
| 5 | Y1 abierta, FR5 bajo, a1 sin confirmación | 3/3, 100/100 y +100 XP por caso |

Los tres casos nuevos también se completaron en Práctica libre, con informes de 0 XP. La intervención de presión no obligó a usar el multímetro; las de Y1/a1 exigieron referencia antes/después y dos conductores, además de las condiciones neumáticas. Se probó el ajuste vacío: rechazado sin autorizar reparación.

## Evidencias de proceso

- Y1: captura con Q0.2=1, accionamiento magnético=0, presión 6 bar, carrera 0 %, a1=0.
- Presión: Q0.2=1, Y1 accionada, presión 1,2 bar, carrera 0 %, a1=0.
- a1: carrera física 100 %, presión 6 bar, Q0.2/Y1 activos y señal a1=0. Después del timeout, el retorno por muelle modifica la posición en directo; la captura conserva la extensión.
- Tras reparar a1, una nueva caja alta completó extensión y retorno. Se repitió después otra alta y una baja: el contador mostró **3 clasificadas, 1 principal y 2 lateral**, sin otra recompensa de Carrera.
- Cambiar de nivel durante E5 retiró órdenes. Al volver se observó A1 aún retornando (36 %), Y1=0 y sin avance del GRAFCET. Se esperó a la retracción y se rearmó deliberadamente.
- La pérdida manual de aire durante E4 produjo presión de zona 0 bar, A1 detenido a media carrera (34 % en la observación) y alarma por falta de posición. Las dos cámaras mostraron 0 bar.
- En preparación se observó suministro 6 bar, zona 0 bar, V5 cerrada y D5 descargando; la fase activa pasó a Intervenir. La descarga, el manómetro y el aseguramiento precedieron a la reparación.

## Carrera y persistencia

El nivel 5 permaneció bloqueado con una causa de nivel 4 y se desbloqueó con la segunda distinta. Completar las tres nuevas otorgó dominio. La recarga conservó **1500 XP y quince casos**, con quince registros iniciales en historial. Repetir FR5 a 100/100 produjo **+0 XP**, mantuvo los quince casos distintos y añadió otro informe. Práctica conservó esos 1500 XP.

Las pruebas de almacenamiento preservan mejores marcas y registros v0.5.0; no se cambia la clave ni el formato. No se leyó ni modificó el progreso del sitio público. Los datos de ensayo permanecen en el navegador local y no se exportan dentro de la aplicación entregada.

## Pantallas y herramientas

Revisado en Chromium integrado sobre Windows:

| Resolución | Comprobación |
| --- | --- |
| 1920 × 1080 | Planta ampliada, neumática, GRAFCET, procedimientos y lateral |
| 1366 × 768 | Monitor/esquema desplazables, lateral de unos 416 px y panel de 704 px de alto |
| 820 × 1180 | Tablet: herramientas apiladas y navegación interna |
| 390 × 844 | Móvil: esquema neumático con desplazamiento horizontal, herramientas y multímetro |

El documento midió 1351, 805 y 375 px dentro de 1366, 820 y 390 px respectivamente: sin desbordamiento horizontal de página. En móvil se midieron fuente 24 V y Y1 0 V en alarma, se seleccionó un borne, se navegó por zona y se aplicó zoom 150 %. Se inspeccionaron EV1 y A1 en neumática. Planta principal y miniatura recibieron el mismo snapshot.

La sesión final de revisión no registró errores ni advertencias JavaScript y no tuvo IDs duplicados. Se corrigieron durante desarrollo el botón de reparación al pasar a reposición y varias etiquetas/conexiones; no se ocultan los límites de las pruebas.

## Integridad y límites

Se valida sintaxis de todos los JavaScript y existencia de las referencias locales de index.html. Se comparan exactamente los SVG de esquemas 1–4 con la base. El respaldo v0.5.0 coincide por SHA-256; la auditoría por archivo acompaña al proyecto.

No se han probado dispositivos físicos, Safari, Firefox, PLC, electroválvulas ni cilindros reales. La presión es un modelo concentrado, con aproximaciones detalladas en senales-neumatica.md; no se declara cálculo de fuerza o fluidos ni certificación de seguridad. Se probó mediante HTTP local; la aplicación no usa módulos remotos ni peticiones necesarias para abrir su HTML, pero no se ha hecho un despliegue público. Las capturas están en **screenshots-v060/**. GitHub y Pages no han cambiado.
