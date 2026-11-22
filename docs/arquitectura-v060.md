# Arquitectura y secuencia · v0.6.0

## Integración en la base

La aplicación conserva HTML/CSS/JavaScript sin framework. Los niveles anteriores mantienen sus datos y modelos. **SequenceRuntime** extrae el registro y cambio de etapa común; el motor de nivel 4 lo utiliza manteniendo su integración específica por eventos. El programa de clasificación utiliza el mismo núcleo, TON del motor existente y la interfaz GrafcetUI parametrizada con su grafo y disposición.

El programa **sorting-sequence.js** declara receptividades y acciones. El núcleo evalúa ese grafo para evolucionar el proceso; el monitor consume el mismo grafo y snapshot. No hay una segunda secuencia decorativa en la UI ni posibilidad de forzar una etapa. Se conservan PLC, registro, diagnóstico, medidas, guía lateral y miniplanta en la misma mesa.

**pneumatic-model.js** calcula presión y posición. **sorting-simulation.js** adapta señales y nodos eléctricos al controlador compartido. **sorting-intervention.js** valida la preparación y prueba de reparación. **sorting-views.js** representa planta, neumática y plano eléctrico. **sorting-ui.js** construye la estación y muestra los valores; no calcula causas eléctricas ni autoriza por sí sola una reparación.

## GRAFCET

| Etapa | Acción / condición | Transición |
| --- | --- | --- |
| E0 | Reposo; A1 retraído y a0 recibido; sin alarma, aislamiento o bloqueo | T01: Marcha autorizada |
| E1 | M1 y M2 transportan una caja según posición, con solape de entrega | T12: B4 confirma presencia |
| E2 | Detener transporte y memorizar altura con B4 presente; 0,25 s | T23: identificación disponible |
| E3 | Baja: M2 continúa; alta: posicionada con M2 parado y a0 | T37: baja sale por principal; T34: alta lista tras 0,25 s |
| E4 | Q0.2 solicita extensión; EV1 solo conmuta si Y1 funciona | T45: orden estable 0,2 s |
| E5 | Mantener Y1 y esperar a1; TON de extensión iniciado en E4 | T56: a1 confirma; T5A: 4 s sin a1, alarma |
| E6 | Y1=0; retorno neumático; TON de retorno independiente reiniciado | T67: a0 confirma; T6A: 4 s sin a0, alarma |
| E7 | Una recepción contabilizada en la ruta correspondiente | T70: acción explícita para retirar y preparar otra caja |
| EA | Retirar órdenes, capturar disparo y enclavar alarma | TAR: recuperación autorizada tras intervención |

La confirmación se evalúa antes del timeout en cada paso del programa. TON no retentivo: IN=0 reinicia ET y Q; al disparar EA se preserva una captura independiente del estado anterior, incluida carrera física, presión, orden Y1, accionamiento y señales. La integración del nivel 5 subdivide el tiempo en intervalos de hasta 10 ms simulados; se limita un avance solicitado a 120 s. El nivel 4 conserva su prioridad exacta B3/PT por eventos, cubierta por sus pruebas anteriores.

Una sola caja por ciclo. Posición inicial 0,08, B4 en 0,82; recorrido principal terminado en 1,12. Velocidad lineal 0,25 unidades/s. M2 empieza el acompañamiento a 0,30 y M1 se retira a 0,36; B2 y B3 conservan su papel de observación de transferencia. Las cajas altas se posicionan junto a A1; el desplazamiento lateral depende de la extensión física del cilindro, no de Q0.2.

## Paro, alarmas y recuperación

Paro retira órdenes y reinicia TON, conservando etapa. Si se interrumpe un ciclo exige rearme deliberado. EV1 monoestable vuelve a reposo: con presión A1 puede retraerse después de Paro o alarma, también mientras se consulta otro nivel. Esto no reanuda el transporte ni cuenta una caja. Al cambiar de nivel se ordena Paro al nivel 5 activo; la presión y el retorno físico siguen siendo coherentes.

Paro sin alarma, fuera de intervención, admite recuperación desde el control de rearme cuando A1 ha retornado y las condiciones de aire lo permiten; la causa original no se repara. Una alarma exige reparación preparada, liberación, reposición, retirada del aseguramiento y rearme. El rearme no pulsa Marcha. La presión no se restaura por una simple orden PLC.

Al recargar se reinician los estados de las incidencias y se conserva Carrera. Preparar otra caja solo es posible en E0/E7, con A1 retraído y sin ciclo/alarma/recuperación pendiente. E7 no cuenta de nuevo al permanecer ahí; cada nueva caja reinicia únicamente su indicador de conteo.

## Intervención y verificación

Y1/a1: parada, instrumento antes, aislamiento eléctrico, bloqueo, aislamiento de aire, descarga, lectura real de 0 bar, aseguramiento, dos conductores a 0 V e instrumento después, inspección y sustitución. FR5: parada, bloqueo, aislamiento/descarga, manómetro, aseguramiento, inspección de consigna y validación de 5/6 bar; no exige medidas eléctricas.

La reparación no se autoriza con pruebas anteriores al aislamiento ni con ceros debidos a la avería. Reponer presión con A1 asegurado no lo mueve. Tras liberar el aseguramiento puede producirse el retorno; el rearme espera a0. La verificación exige reparación autorizada, bloqueo retirado, campo restablecido, Marcha nueva, E7, A1 retraído, a0 recibido, una caja alta desviada nueva y ninguna alarma. Solo entonces el sistema compartido calcula recompensa e historial.

Almacenamiento y progresión mantienen su clave/formato. El nivel 5 se incorpora mediante los datos del nivel; el desbloqueo exige dos causas distintas de nivel 4 y el dominio tres causas de nivel 5. Los nuevos casos permiten hasta 300 XP adicionales; total actual 1500 XP. No se ejecuta el rediseño general reservado por el usuario.


## Identidad y orden formativo

La revisión posterior separa ambos conceptos mediante curriculum.js. Las claves de niveles/modelos son permanentes; solo cambia la lista de itinerario. El acceso histórico se conserva por módulo, con metadatos compatibles. Véase revision-arquitectura.md.
