# MIKI Industrial Lab · v0.3.4 — esquemas eléctricos

Entrega local para revisión, basada exclusivamente en el ZIP v0.3.3 recibido del usuario. No se ha publicado ni modificado GitHub. Conserva los dos niveles y seis averías; no se crea el nivel 3.

## Probar

1. Extrae el ZIP completo en una carpeta nueva.
2. Abre `index.html` en tu navegador. Mantén juntas las carpetas `css`, `js` y `levels`.

No requiere instalar paquetes, cuentas, compilación ni conexión. Alternativa si tienes Node: ejecuta `node preview.cjs` en esta carpeta y visita <http://127.0.0.1:4185>. Ctrl+C detiene el servidor.

El progreso se guarda en el navegador y origen utilizados. Archivo local, servidor local y GitHub Pages pueden tener almacenamientos distintos. Usa «Exportar progreso» antes de cambiar de ubicación. La clave y formato de almacenamiento de v0.3.3 se conservan.

## Revisar

- Un esquema continuo por nivel, dividido visualmente en zonas.
- Pulsa K1 para relacionar bobina y contacto en azul. Los bornes ámbar siguen colocando las puntas roja y negra.
- B1 relaciona alimentación por F3, retorno BU y salida BK hacia I0.2 mediante W1.
- «Localizar en la planta» identifica el componente y abre su ficha existente cuando tiene representación física.
- «Ampliar esquema» conserva el caso, las puntas y la lectura. Multímetro a la derecha en escritorio; herramientas apiladas y plano desplazable en móvil.
- PLC, Registro y Diagnóstico conservan sus pestañas independientes.

## Documentación y capturas

- [Cambios y criterios eléctricos](docs/cambios.md)
- [Pruebas ejecutadas](docs/pruebas.md)
- [Publicar después de aprobar](docs/publicar.md)

`screenshots/` contiene nivel 1 ampliado, relaciones K1, nivel 2 ampliado, sensor B1, localización física y móvil.

## Respaldo e integridad

`original/MIKI_Lab_v0.3.3.zip` es copia íntegra del recibido. SHA-256:

`3468447A7DD3D3650792CFED6907F350464945F7C743EFE9ACA2C39C8F1AA359`

`audit-v033.json` compara los archivos con ese ZIP. Además del README, solo cambian tres archivos preexistentes: `index.html`, `js/ui.js` y `js/schematics.js`. Se añaden estilos de esquemas, documentación, pruebas y capturas. Planta, simulación, mediciones, intervención, progresión y almacenamiento conservan su contenido original.

## Pruebas automáticas

Con Node, sin dependencias adicionales:

```text
node --test tests/intervention.test.cjs tests/schematics.test.cjs
```

Simulación educativa: no constituye un plano completo de instalación ni una certificación normativa. Se mantienen las limitaciones didácticas anteriores.
