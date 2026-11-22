/* Modelo concentrado didáctico: presión de colector, válvula 5/2 y carrera normalizada. */
Miki.Pneumatics={
 create(fault){return {supply:6,setpoint:fault==='pressure'?1.2:6,pressure:fault==='pressure'?1.2:6,airOpen:true,vent:false,position:0,secured:false}},
 advance(p,energized,dt){if(p.vent&&!p.airOpen)p.pressure=Math.max(0,p.pressure-8*dt);else if(p.airOpen)p.pressure=Math.min(p.setpoint,p.pressure+5*dt);if(p.secured||p.pressure<2.5)return;const speed=.8*Math.min(1,p.pressure/6);p.position=Math.max(0,Math.min(1,p.position+(energized?1:-1)*speed*dt))},
 snapshot(p,energized){return {supply:p.supply,pressure:p.pressure,setpoint:p.setpoint,airOpen:p.airOpen,vent:p.vent,secured:p.secured,cylinder:p.position,valve:energized?'1→4 · 2→3':'1→2 · 4→5',chamberA:energized?p.pressure:0,chamberB:energized?0:p.pressure,a0physical:p.position<=.001,a1physical:p.position>=.999}}
};
