# MIKI Industrial Lab · v0.6.0 · Revisión local

Cinco niveles y quince averías. La nueva estación clasifica cajas al final de CV-02 mediante B4/B5, EV1, Y1 y un cilindro A1 de doble efecto. Electricidad, presión, posiciones, PLC y GRAFCET proceden del mismo modelo simulado.

## Ejecutar

1. Extrae el ZIP completo en una carpeta nueva.
2. Abre **index.html** con tu navegador. Mantén juntas las carpetas **css**, **js** y **levels**.
3. Selecciona **Práctica libre** y **05 Clasificación electroneumática** para probar directamente el nivel nuevo.

No requiere instalación de paquetes, compilación, cuenta, pago ni conexión a Internet. Si tienes Node puedes ejecutar **node preview.cjs** desde esta carpeta y abrir **http://127.0.0.1:4190/**. Ctrl+C detiene la vista local.

## El nivel 5

- La caja alta se desvía mediante A1; la baja sigue recta sin activar Y1. El selector y **Preparar caja seleccionada** permiten comparar ambos comportamientos cuando el ciclo está preparado o completado.
- Cada caso contiene un único fallo inicial. La verificación de la incidencia exige **reparación y una caja alta nueva**, con extensión, confirmación a1 y retorno confirmado por a0. Pasar una caja baja sin reparar sirve como contraste, pero no resuelve la avería ni concede XP.
- Usa **Secuencia PLC / GRAFCET**, **PLC online**, **Registro**, el esquema eléctrico y el multímetro. **Esquema neumático** añade presión, cámaras del cilindro y posiciones de EV1.
- El multímetro mide diferencia de potencial en **V CC**. P5 mide presión en **bar**. Una salida PLC activa no garantiza accionamiento magnético, presión ni movimiento.
- Selecciona componentes para relacionar ubicación, función, esquema y señales. El resaltado indica selección o señal; no identifica automáticamente la causa.
- La captura de alarma conserva el instante del disparo. El cilindro puede haber retornado después: compara la captura con la posición y el TON en directo.
- Paro retira Y1. EV1 vuelve por muelle y, con aire disponible, A1 puede retraerse. No confundir Paro con inmovilización ni cerrar V5 con descargar la presión.
- Sigue la guía de intervención. Los casos eléctricos incluyen instrumento antes/después y conductores; el ajuste neumático utiliza manómetro, descarga, aseguramiento e inspección, sin medidas eléctricas irrelevantes.

La mesa mantiene sus herramientas y desplazamientos independientes. Puedes ampliar planta y esquema; Escape cierra la ampliación. En pantallas pequeñas, **Ir al esquema / Ir a herramientas** navega por la mesa; los dibujos amplios tienen desplazamiento horizontal propio.

## Carrera y respaldo

El nivel 5 se desbloquea tras dos causas distintas del nivel 4. Tres causas completan el dominio. Se conservan XP por mejor marca, rangos, insignias e historial; repetir solo concede la mejora sobre la marca anterior. Práctica no modifica Carrera.

La clave y los datos anteriores se conservan; se añaden metadatos compatibles de accesos e itinerario. El progreso pertenece al navegador y origen utilizados: una dirección local, un puerto o una ubicación de archivo distintos pueden tener almacenes diferentes. **Exportar progreso** permite guardar un respaldo JSON; no se añade un importador. La recarga conserva Carrera y reinicia las incidencias en curso. El ZIP no contiene el progreso de ensayo del navegador.

Respaldo íntegro: **original/MIKI_Lab_v0.5.0_Revision.zip**. Se conserva también la documentación de v0.5.0 en **original/documentacion-v050/** y sus materiales históricos. No se han modificado GitHub ni la web pública.

## Revisión de arquitectura

Identidades permanentes separadas del orden formativo, accesos anteriores preservados y ayudas neumáticas reforzadas. El orden original se mantiene. Véase [revisión de arquitectura](docs/revision-arquitectura.md).

## Documentación

- [Cambios](docs/cambios.md)
- [Arquitectura y secuencia del nivel 5](docs/arquitectura-v060.md)
- [Señales eléctricas, neumática y límites del modelo](docs/senales-neumatica.md)
- [Pruebas efectivamente ejecutadas](docs/pruebas.md)
- [Publicar después de aprobar](docs/publicar.md)
- Capturas nuevas: **screenshots-v060/**. Las carpetas anteriores son históricas.
- Comparación de integridad: **audit-v050.json**.

Con Node, sin instalar dependencias: **node --test tests/*.test.cjs**. Resultado final: **92 pruebas superadas, 0 fallos**.

Simulación educativa web. No es un proyecto TIA Portal, una certificación normativa ni un procedimiento autorizado para intervenir sobre equipos eléctricos o neumáticos reales.
