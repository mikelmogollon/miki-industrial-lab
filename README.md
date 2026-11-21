# MIKI Industrial Lab · v0.3.3 — diagnóstico guiado

Simulador educativo original de diagnóstico industrial: cinta transportadora, motor 24 V CC, PLC didáctico y sensor PNP. Conserva los niveles 1 y 2 y sus seis averías. El alumno observa, mide, diagnostica, aísla, repara y verifica.

Entrega local para revisión, sin publicar. Parte del ZIP más reciente con la planta industrial mejorada, conservado íntegramente en original/MIKI_Lab_Planta_Mejorada.zip. Compatible con GitHub Pages, sin cuentas ni dependencias de pago.

La mejora de esta revisión es el recorrido **Investigar → Diagnosticar → Intervenir → Completar**, con acciones contextuales junto a las herramientas y procedimientos distintos para las seis averías. Ver [decisiones técnicas](docs/arquitectura.md), [cambios](docs/cambios.md) y [pruebas reales](docs/pruebas.md).

## Ejecutar

Extrae el ZIP y abre index.html en un navegador. Mantén juntas las carpetas css, js y levels: el HTML ya no es autónomo. No hace falta instalar paquetes ni compilar.

Alternativa con Node instalado: ejecuta `node preview.cjs` y abre http://127.0.0.1:4184. Ctrl+C detiene la vista local. Solo sirve archivos de aplicación en el propio equipo, no los respaldos. No hace falta instalar paquetes.

## Estructura

| Ruta | Función |
| --- | --- |
| index.html | Estructura, tarjetas y planta SVG |
| css/ | Estilos base, distribución y componentes |
| js/app.js | Controlador y ciclo de los casos |
| js/simulation.js | Estado eléctrico, acciones y reparación |
| js/measurements.js | Dos puntas, muestras y evidencias |
| js/progression.js | Puntuación, XP, rangos e insignias |
| js/storage.js | Persistencia y migración |
| js/schematics.js | Símbolos y esquemas interactivos |
| js/ui.js | Presentación, ventanas, pestañas y foco |
| js/intervention.js | Procedimientos por caso y pruebas de preparación |
| js/workflow.js | Guía de fases y acciones contextuales |
| js/completion.js | Ventana de cierre e informe técnico |
| levels/ | Definiciones de los dos niveles |
| docs/ | Arquitectura, pruebas, cambios, GitHub y capturas |
| tests/ | Pruebas sin librerías adicionales |
| versions/v0.3/ | Copia íntegra anterior y huellas SHA-256 |

Plantas y símbolos son SVG incluidos en el HTML y el módulo de esquemas. No se descargan imágenes externas. assets queda reservado a recursos futuros, sin ser una dependencia actual.

## Modelo y uso

Cada nivel tiene tres casos diferentes. En Carrera se desbloquea el siguiente nivel publicado al verificar **dos averías distintas** del anterior; la tercera completa el dominio. Repetir la misma causa no aumenta el número de casos completados. En Práctica libre puedes entrar en ambos niveles publicados sin afectar a XP, insignias, desbloqueos ni historial de Carrera. Al cambiar de modo se reinicia el caso activo para impedir que se atribuya al modo equivocado. Siguiente caso prioriza las averías aún no completadas en Carrera y no anuncia la causa del nuevo fallo. Esquema y multímetro muestra ambas herramientas juntas; PLC, Registro y Diagnóstico sustituyen esa vista sin perder estado.

Un único cálculo obtiene nodos y señales desde alimentación, protecciones, contactos, bobina, sensor, cableado y reparación. El multímetro resta esos potenciales: V(roja) − V(negra). Cambios de caja o pulsador actualizan la lectura sin inventar nuevas comprobaciones en el registro.

Para reparar: confirma el diagnóstico y pulsa Preparar intervención. La guía indica la comprobación del instrumento, aislamiento, bloqueo didáctico y puntos propios de ese trabajo. Seleccionar no equivale a medir: usa Medir tensión. Se comprueba el instrumento antes y después con una referencia conocida. No se aceptan ceros entre puntos arbitrarios. La fuente antes de QS conserva 24 V y la CPU sigue en RUN.

Una vez reparado, retira el bloqueo, restablece y da una nueva orden de Marcha o presenta una caja. Puedes hacerlo con la acción contextual sin buscar controles en otra parte de la página. Solo después aparece la recompensa. Continuar al siguiente caso es una acción explícita; Revisar informe permite consultar el detalle sin avanzar.

## XP y carrera

60 puntos por diagnóstico, reparación segura y verificación; 20 por medidas técnicas relevantes antes de reparar; 20 por diagnóstico sin hipótesis incorrectas. Consultar e investigar más no resta puntos. Solo se suma la mejora de la mejor puntuación de cada avería. Repetir un 100 añade 0 XP; los seis casos permiten hasta 600.

| XP | Rango |
| --- | --- |
| 0 | Aprendiz de mantenimiento |
| 300 | Operario de mantenimiento |
| 900 | Técnico junior |
| 2.000 | Técnico de mantenimiento |
| 4.000 | Técnico de automatización |
| 7.000 | Especialista en diagnóstico |
| 12.000 | Responsable de mantenimiento |

Son logros internos, no acreditaciones profesionales. Los umbrales son ajustables para un catálogo futuro mayor. Mi carrera muestra detalles, insignias e insignias anteriores como legado. No se concede ningún logro que necesite niveles inexistentes.

## Progreso

Se migran el historial y las mejores marcas desde v0.3.1 (`miki-industrial-lab-progress-v031`), o desde las claves v0.2/v0.3 cuando no exista una versión más reciente. La nueva clave es `miki-industrial-lab-progress-v032`; ninguna clave antigua se borra. Se conserva XP, se recalcula el rango y se separan las insignias antiguas. Exportar progreso descarga JSON gratuitamente. No hay importación automática ni sincronización entre equipos.

Archivo, localhost y GitHub Pages pueden tener almacenes diferentes. Al recargar se reinicia el caso activo y la sesión de Práctica libre, pero se conserva Carrera e historial. El modo por defecto es Carrera. Si no se puede guardar, se avisa y la práctica sigue en memoria.

## Pruebas y ampliación

Ejecuta `node --test tests/intervention.test.cjs` con Node instalado. No requiere instalar paquetes. El informe en docs distingue las 18 pruebas automáticas de los seis recorridos realmente ejecutados en navegador.

Para añadir un nivel: crea definición en levels, registra un modelo si necesita otra física, añade su vista y controles, define evidencias y escribe pruebas. Simulation dispone de registerModel. Progreso e historial aceptan nuevas claves; `Miki.Learning` consulta dinámicamente los niveles publicados, aunque cada nueva vista debe construirse. Un equipo nuevo no funciona solo con añadir un título. Los contratos y pasos están en [arquitectura](docs/arquitectura.md).

## Límites

Modelo ideal de 24 V CC y cargas/entradas referidas a 0 V. No calcula impedancias, tensiones flotantes, transitorios ni todos los comportamientos de un PLC real. Un punto desconocido devuelve lectura no definida. Símbolos en reposo salvo QS, que refleja su posición real.

Es una simulación didáctica, no formación certificada ni autorización para intervenir en equipos eléctricos reales. El paro PLC no equivale a una parada de emergencia certificada.

## Documentación

- [Arquitectura y migración](docs/arquitectura.md)
- [Pruebas](docs/pruebas.md)
- [Cambios](docs/cambios.md)
- [Publicar en GitHub después de aprobar](docs/github.md)

No se ha añadido el nivel 3 ni publicado la v0.3.3. Es una carpeta de revisión independiente; no se ha modificado main ni la web pública. El formato y la clave de progreso v0.3.2 se conservan.

## Histórico: cambios de la base v0.3.2

- Dos modalidades: **Carrera** (desbloqueo secuencial, puntuación e historial) y **Práctica libre** (sin recompensas ni modificaciones de Carrera).
- Necesitas 2 de 3 averías diferentes para avanzar; terminar 3/3 da insignia de dominio.
- Botones de nivel muestran bloqueo, progreso y requisitos; el nivel 3 figura «En preparación», no se simula que esté disponible.
- La selección de siguiente caso prioriza las averías sin resolver, pero nunca revela cuál es su causa.
- Migración no destructiva de progreso v0.3.1. No modificar la rama main hasta aprobar la versión.


### Histórico: variante de presentación ancha (noviembre 2026)
Esta copia conserva la funcionalidad v0.3.2. En pantallas grandes amplía el área de trabajo, distribuye mejor esquema y multímetro y compacta espacios verticales. Solo se ha modificado `css/components.css`. El archivo de producción en GitHub no se ha actualizado.


## Histórico: vista compacta de planta

En pantallas de escritorio de más de 1250 px, la columna derecha incluye una vista reducida y fija de la planta durante el diagnóstico. Es una representación del mismo SVG: se actualizan motor, sensor, detección, movimiento y señales, sin ejecutar un segundo simulador. El botón **Ver planta ↑** vuelve al esquema principal. En pantallas estrechas se oculta para evitar duplicar información y ocupar la zona útil. No modifica las averías, las mediciones, la progresión ni los datos guardados.

## Histórico: revisión visual de planta
Esta copia incorpora una mejora visual específica sobre el ZIP original v0.3.2. Consulta REVISION-PLANTA.md para cambios, comprobaciones y capturas. La simulación y los sistemas de Carrera y Práctica conservan sus archivos originales. No publicada.

