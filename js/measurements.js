Miki.Measurements=(()=>{
 function value(s,red,black){const v=Miki.Simulation.snapshot(s).nodes;if(!(red in v)||!(black in v))return null;return v[red]-v[black]}
 function take(s,red,black){const sim=Miki.Simulation,v=sim.snapshot(s),volts=value(s,red,black);if(volts===null)return null;const sample={red,black,volts,nodes:{...v.nodes},box:s.box,requested:s.requested,isolated:s.isolated,repaired:s.repaired,epoch:s.isolationEpoch,...(s.level===4?{sequenceEvidence:{stage:v.stage,position:v.position,b3physical:v.b3physical,boxMoving:v.boxMoving,timer:{...v.timer},lastTrip:v.lastTrip?{...v.lastTrip}:null}}:{})};s.lastMeasurement=sample;
  const key=JSON.stringify(sample);if(!s.measurements.some(m=>JSON.stringify(m)===key)){s.measurements.push(sample);s.checks.add('measure:'+key);const points=Miki.levels[s.level].points;sim.log(s,`${points[red]} ↔ ${points[black]} : ${volts.toFixed(1)} V · ${s.isolated?'aislada':'alimentada'}${s.level===2?(s.box?' · con caja':' · sin caja'):''}`,'measure',sample)}
  Miki.Intervention.record(s,sample);return sample;
 }
 function relevant(s){const samples=s.measurements.filter(m=>!m.isolated&&!m.repaired);
  const measured=(m,p,v)=>((m.red===p&&m.black==='zero')||(m.black===p&&m.red==='zero'))&&m.nodes[p]===v;
  const has=(p,v,predicate=()=>true)=>samples.some(m=>measured(m,p,v)&&predicate(m));
  const pair=(a,b,volts,predicate=()=>true)=>samples.some(m=>((m.red===a&&m.black===b&&m.volts===volts)||(m.red===b&&m.black===a&&m.volts===-volts))&&predicate(m));
  if(s.level===5){const evidence=s.sorting.observations.concat(s.sorting.lastTrip?[s.sorting.lastTrip]:[]);return s.checks.has('inspect')&&evidence.some(o=>s.fault==='coil'?o.y1&&!o.energized&&o.pressure>=4:s.fault==='pressure'?o.y1&&o.energized&&o.pressure<2.5:o.cylinder>=.999&&!o.a1&&o.pressure>=4);}
  if(s.level===4){
   const examined=s.checks.has('grafcet')&&s.checks.has('inspect'),observations=s.sequence?.observations||[],trip=Miki.Simulation.snapshot(s).lastTrip;
   if(s.fault==='stuck')return examined&&has('b3brown',24)&&has('b3black',24,m=>m.sequenceEvidence?.b3physical===false)&&observations.some(o=>!o.physicalOccupiedB3&&o.sensorSignalB3);
   const timed=examined&&s.checks.has('timer')&&trip?.Q===true&&trip.ET+1e-8>=trip.PT;
   if(s.fault==='jam')return timed&&trip.moving===false&&observations.some(o=>o.obstructionVisible&&o.position>=.59);
   if(s.fault==='timing')return timed&&trip.PT<4&&trip.moving===true&&observations.some(o=>o.noObstruction);
   return false;
  }
  if(s.level===3){
   if(s.fault==='bsignal')return has('b2brown',24)&&(pair('b2black','b2input',24)||(has('b2black',24)&&has('b2input',0)));
   if(s.fault==='kcoil')return has('q2',24)&&has('f4out',24)&&(has('k2out',0)||has('m2',0));
   if(s.fault==='fpower')return has('q2',24)&&(pair('f4in','f4out',24)||(has('f4in',24)&&has('f4out',0)));
  }
  if(s.fault==='stop')return pair('s0in','s0out',24)||(has('s0in',24)&&has('s0out',0));
  if(s.fault==='fuse')return pair('f2in','f2out',24,m=>m.requested)||(has('f2in',24,m=>m.requested)&&has('f2out',0,m=>m.requested));
  if(s.fault==='coil')return has('q',24)&&has('f2out',24)&&(has('motor',0,m=>m.requested)||has('k1out',0,m=>m.requested));
  if(s.fault==='power')return pair('fuseIn','brown',24)||pair('fuseIn','fuseOut',24)||(has('fuseIn',24)&&(has('brown',0)||has('fuseOut',0)));
  if(s.fault==='align')return has('brown',24,m=>m.box)&&has('black',0,m=>m.box)&&s.checks.has('inspect');
  if(s.fault==='wire')return pair('black','terminal',24,m=>m.box)||(has('black',24,m=>m.box)&&has('terminal',0,m=>m.box));return false;
 }
 return {value,take,relevant};
})();
