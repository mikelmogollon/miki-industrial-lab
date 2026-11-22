# Señales eléctricas y neumática · nivel 5

## Mapa completo y ampliación

| Señal | Elemento | Función |
| --- | --- | --- |
| I0.0 | S0 | Paro operativo NC del nivel 1, conservado |
| I0.1 | S1 | Marcha del nivel 1, conservada |
| I0.2 | B1 | Detección del nivel 2, conservada |
| I0.3 | B2 | Llegada a transferencia, conservada |
| I0.4 | B3 | Recepción CV-02, conservada |
| I0.5 | B4 | Presencia en clasificación, nueva |
| I0.6 | B5 | Detección de altura, nueva |
| I0.7 | a0 | Cilindro retraído, nueva |
| I1.0 | a1 | Cilindro extendido, nueva |
| Q0.0 | K1 / M1 | Accionamiento de CV-01, conservado |
| Q0.1 | K2 / M2 | Accionamiento de CV-02, conservado |
| Q0.2 | Y1 / EV1 | Orden de extensión, nueva |

No se reutiliza ninguna dirección con otra función. No se ha añadido un presostato digital: **P5 es un instrumento de presión**, sin asignación de entrada PLC. El indicador de presión suficiente en PLC online es una observación didáctica del modelo, no una entrada cableada ni una señal analógica de un PLC real.

B4, B5, a0 y a1 se modelan como sensores PNP NO de 24 V CC: BN a L+ local, BU a 0 V, BK alto a 24 V cuando detectan y bajo a 0 V cuando no. QS5 corta el campo; la fuente conocida permanece antes del aislamiento. Las lecturas son V(roja) − V(negra), admitiendo −24 V con puntas invertidas. La bobina abierta puede tener 24 V en bornes sin generar accionamiento magnético.

B4 habilita la identificación. En E2 se memoriza alta si B5=1 y baja si B5=0, siempre con B4 presente. Fuera de B4 no se evalúa una clasificación. a0 físico se alcanza con carrera ≤0,1 % y a1 con ≥99,9 %. Su señal eléctrica se calcula por separado; el fallo de a1 mantiene su salida a 0 sin alterar la posición física.

El plano eléctrico del nivel 5 representa alimentación de campo, sensores, receptores PLC y bobinas, con común y puntos medibles. La potencia de K1/K2 hacia M1/M2 se conserva en los planos de transferencia de los niveles 3–4; no se inventa un accionamiento directo desde la salida PLC al motor.

## Circuito neumático

| Referencia | Función |
| --- | --- |
| Suministro | Red ideal a 6 bar, sin simular compresor |
| V5 | Aislamiento del suministro local |
| D5 | Descarga simulada del volumen posterior |
| FR5 | Preparación/regulación simplificada de presión |
| P5 | Manómetro virtual de zona; escala representada 0–8 bar |
| EV1 | Distribuidor 5/2 monoestable |
| Y1 | Bobina 24 V CC de EV1 |
| A1 | Cilindro de doble efecto, carrera normalizada 0–100 % |
| a0 / a1 | Confirmaciones de retracción/extensión |

EV1 dispone de **1=P**, **4=A** hacia la cámara sin vástago, **2=B** hacia la cámara del vástago, **5 y 3** a atmósfera. Reposo por muelle: 1→2 y 4→5, ordenando retracción. Y1 accionada: 1→4 y 2→3, ordenando extensión. El muelle pertenece a la válvula; no es un cilindro de simple efecto con retorno mecánico.

Presión nominal: **6 bar**. Ventana de ajuste autorizada: **5 o 6 bar**. Umbral didáctico de movimiento: **2,5 bar**. Consigna averiada: **1,2 bar**. La velocidad de carrera a 6 bar es 0,8 carreras/s; de 2,5 a 6 bar se escala con presión/6. Por debajo del umbral se detiene la carrera. Ambas posiciones intermedias y finales son reales dentro del modelo.

Con V5 abierto, la presión de zona sube hacia la consigna a 5 bar/s. Cerrar V5 conserva la presión almacenada. Abrir D5 con suministro cerrado la reduce a 8 bar/s hasta 0. El manómetro, las cámaras y la capacidad de mover A1 consumen esa misma variable. La reposición cierra D5 y abre V5; el reajuste de FR5 no llena mágicamente una zona aislada.

No hay presostato que inhiba automáticamente Y1 por baja presión: esto permite comparar orden eléctrica y fallo de movimiento en el caso B. La supervisión de las posiciones limita el intento mediante TON. Durante una intervención, el bloqueo didáctico sí impide el rearranque.

## Aproximaciones declaradas

Modelo concentrado de energía y posición, no cálculo de fluidos. No se resuelven caudal, volumen de cámaras, masa de caja, rozamiento, fuerza ni compresibilidad. La presión retenida se trata de forma conservadora como disponible hasta descargar, sin consumo volumétrico por carrera. No hay gravedad ni movimientos por cargas externas. El aseguramiento mecánico es una condición explícita del modelo, y no una garantía derivada de 0 bar.

Los casos iniciales contienen un solo fallo. **Simular pérdida de aire** es una perturbación manual adicional para ensayar límites; puede coexistir con la avería activa. Reiniciar el caso recupera sus condiciones iniciales. El fallo a0 se prueba como variante automática del modelo, sin convertirse en un cuarto caso ni un nuevo nivel.

Referencia pública de [ISO 1219-1](https://www.iso.org/standard/60184.html) para principios de símbolos y de [Festo sobre válvulas neumáticas](https://www.festo.com/ie/en/e/blog/in-practice/pneumatic-valves-id_1517727) para funciones de vías/posiciones. La representación es didáctica; no se ha consultado el texto íntegro de pago de la norma ni se declara certificación o conformidad normativa completa.
