# Revisión de identidad e itinerario · v0.6.0

El orden anterior procedía de ordenar las claves numéricas, con referencias a nivel + 1 en avisos y navegación. Cambiar esas claves habría reasignado casos, marcas e insignias. Esta revisión separa identidad e itinerario sin reconstruir el simulador.

## Identidad permanente

| Identidad semántica | Clave interna histórica, inmutable |
| --- | --- |
| motor | 1 |
| sensors | 2 |
| transfer | 3 |
| sequence | 4 |
| pneumatics | 5 |

Las claves numéricas se conservan como identificadores internos permanentes, no como posiciones. Un caso como **5:feedback** sigue siendo el mismo aunque neumática pase a otra posición. No se renumeran niveles, modelos, bornes, casos, mejores marcas o insignias guardadas. Los nuevos informes añaden moduleId semántico. Los nombres antiguos de insignias se conservan en el almacenamiento; el dominio se presenta con el título del módulo, evitando confundir su identidad con su puesto actual.

## Cambiar únicamente el itinerario

En **js/curriculum.js**, la lista order fija el orden. Por ejemplo:

    ['motor','sensors','transfer','pneumatics','sequence']

Mueve neumática a la cuarta posición sin cambiar su identificador interno 5. La lista se valida para rechazar duplicados, omisiones y nombres desconocidos. Curriculum.next sustituye la aritmética número + 1; la navegación y los encabezados usan la posición didáctica.

La entrega mantiene el orden original. No se añade un editor al usuario. Para incorporar un ejercicio futuro habrá que implementar sus datos, modelo y vista, asignarle una identidad nueva e incorporarlo al catálogo y al itinerario; no se deben reutilizar o renumerar las claves actuales. Esta mejora permite reorganizar los módulos existentes y prepara la inserción futura, pero no promete que un nuevo nivel se implemente solo añadiendo un nombre.

## Compatibilidad y accesos

La clave localStorage y version=2 permanecen. Se añaden los metadatos opcionales curriculumVersion y unlockedModules. Para datos antiguos se recuperan los accesos que correspondían al itinerario histórico 1–5 y se guardan por identidad semántica. Los casos iniciados/completados y los accesos ya concedidos se conservan aunque el nuevo predecesor sea distinto. Las carreras nuevas siguen el itinerario configurado y requieren dos causas del predecesor actual. Práctica no escribe progreso de Carrera.

La adaptación es idempotente. No cambia los importes de XP, best, completed, badges, legacyBadges ni los informes históricos. Se conserva el límite por mejor puntuación: reordenar no crea una nueva marca para el mismo caso ni permite repetir premios.

## Ayudas neumáticas

Se revisaron las explicaciones de los componentes y el desplegable Conceptos de electroneumática. Se refuerzan: doble efecto y aire en ambas carreras; cinco vías/dos posiciones y retorno por muelle de EV1; diferencia entre bar y V CC; a0/a1 como confirmaciones separadas de la posición física. Las ayudas no identifican la avería activa. No se cambia distribución, física, averías ni número de casos.

## Verificación de esta revisión

- **92 pruebas automáticas superadas, 0 fallos**: regresión de los quince casos y cuatro pruebas nuevas de identidad/itinerario.
- Perfil antiguo de quince casos y 1500 XP: comparación exacta de marcas, completados, insignias e informes tras reordenar, guardar y recargar.
- Accesos antiguos sin caso propio preservados; carrera nueva usa el nuevo predecesor; Práctica independiente; repetición sin XP adicional; itinerarios inválidos rechazados.
- Navegador: neumática temporalmente en posición 4 y secuencias en 5; se conservaron 1500 XP, quince casos y dieciséis informes del origen local de ensayo. Ayudas abiertas y revisadas; sin errores JavaScript. Se restauró después el orden original.
- Los quince casos se vuelven a recorrer automáticamente en esta revisión. Los recorridos manuales completos de los quince casos de la entrega inicial están documentados en pruebas.md; no se afirma haberlos repetido todos manualmente en esta revisión acotada.

No se modifican GitHub ni la web pública. La entrega anterior se conserva además como MIKI_Lab_v0.6.0_Antes_revision_arquitectura.zip junto al nuevo ZIP.
