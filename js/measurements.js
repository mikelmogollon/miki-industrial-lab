Miki.Measurements=(()=>{
 function value(s,red,black){const v=Miki.Simulation.snapshot(s).nodes;if(!(red in v)||!(black in v))return null;return v[red]-v[black]}
 function take(s,red,black){const sim=Miki.Simulation,v=sim.snapshot(s),volts=value(s,red,black);if(volts===null)return null;const sample={red,black,volts,nodes:{...v.nodes},box:s.box,requested:s.requested,isolated:s.isolated,repaired:s.repaired,epoch:s.isolationEpoch};s.lastMeasurement=sample;
  const key=JSON.stringify(sample);if(!s.measurements.some(m=>JSON.stringify(m)===key)){s.measurements.push(sample);s.checks.add('measure:'+key);const points=Miki.levels[s.level].points;sim.log(s,`${points[red]} ↔ ${points[black]} : ${volts.toFixed(1)} V · ${s.isolated?'aislada':'alimentada'}${s.level===2?(s.box?' · con caja':' · sin caja'):''}`,'measure',sample)}
  Miki.Intervention.record(s,sample);return sample;
 }
 function relevant(s){const samples=s.measurements.filter(m=>!m.isolated&&!m.repaired);
  const measured=(m,p,v)=>((m.red===p&&m.black==='zero')||(m.black===p&&m.red==='zero'))&&m.nodes[p]===v;
  const has=(p,v,predicate=()=>true)=>samples.some(m=>measured(m,p,v)&&predicate(m));
  const pair=(a,b,volts,predicate=()=>true)=>samples.some(m=>((m.red===a&&m.black===b&&m.volts===volts)||(m.red===b&&m.black===a&&m.volts===-volts))&&predicate(m));
  if(s.fault==='stop')return pair('s0in','s0out',24)||(has('s0in',24)&&has('s0out',0));
  if(s.fault==='fuse')return pair('f2in','f2out',24,m=>m.requested)||(has('f2in',24,m=>m.requested)&&has('f2out',0,m=>m.requested));
  if(s.fault==='coil')return has('q',24)&&has('f2out',24)&&(has('motor',0,m=>m.requested)||has('k1out',0,m=>m.requested));
  if(s.fault==='power')return pair('fuseIn','brown',24)||pair('fuseIn','fuseOut',24)||(has('fuseIn',24)&&(has('brown',0)||has('fuseOut',0)));
  if(s.fault==='align')return has('brown',24,m=>m.box)&&has('black',0,m=>m.box)&&s.checks.has('inspect');
  if(s.fault==='wire')return pair('black','terminal',24,m=>m.box)||(has('black',24,m=>m.box)&&has('terminal',0,m=>m.box));return false;
 }
 return {value,take,relevant};
})();
