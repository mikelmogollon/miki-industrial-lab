Miki.Progression=(()=>{
 const ranks=[[0,'Aprendiz de mantenimiento'],[300,'Operario de mantenimiento'],[900,'Técnico junior'],[2000,'Técnico de mantenimiento'],[4000,'Técnico de automatización'],[7000,'Especialista en diagnóstico'],[12000,'Responsable de mantenimiento']];
 const xp=d=>Object.values(d.best).reduce((a,b)=>a+b,0);
 function career(d){const total=xp(d),rank=ranks.filter(r=>total>=r[0]).at(-1),next=ranks.find(r=>total<r[0]);return {total,rank:rank[1],next:next?.[1],remaining:next?next[0]-total:0,value:total-rank[0],max:next?next[0]-rank[0]:1}}
 function complete(s,d){if(!Miki.Simulation.verify(s)||s.done)return null;
  const def=Miki.levels[s.level],fault=def.faults[s.fault],technical=Miki.Measurements.relevant(s),score=60+(technical?20:0)+(s.mistakes===0?20:0),key=s.level+':'+s.fault,earned=Math.max(0,score-(d.best[key]||0));d.best[key]=Math.max(score,d.best[key]||0);if(!d.completed.includes(key))d.completed.push(key);
  const eligible=['Primera avería resuelta','Reparación segura'];if(s.mistakes===0)eligible.push('Diagnóstico limpio');if(['stop','fuse','coil'].every(f=>d.completed.includes('1:'+f)))eligible.push('Experto en circuitos de mando');if(['power','align','wire'].every(f=>d.completed.includes('2:'+f)))eligible.push('Especialista en sensores');if(['bsignal','kcoil','fpower'].every(f=>d.completed.includes('3:'+f)))eligible.push('Especialista en transferencia automática');if(d.completed.length>=5)eligible.push('Cinco averías verificadas');
  if(Miki.Learning.mastery(d,s.level))eligible.push('Dominio completo · Nivel '+s.level);
  const badges=eligible.filter(b=>!d.badges.includes(b));d.badges=[...new Set([...d.badges,...eligible])];s.done=true;Miki.Simulation.log(s,'Verificación funcional superada. Incidencia completada.');
  const record={mode:'career',mastery:Miki.Learning.mastery(d,s.level),id:s.id,date:new Date().toLocaleString('es-ES'),level:s.level,moduleId:Miki.Curriculum?.uid(s.level),fault:s.fault,...fault,score,xp:earned,badges,technical,mistakes:s.mistakes,checks:s.checks.size,verification:def.verification||(s.level===1?'M1 arranca tras restablecer alimentación y pulsar Marcha.':'Nueva caja: I0.2 pasa a 1 y aumenta el contador.'),events:s.events.slice(),measurements:s.measurements.slice(),safe:true,career:career(d)};
  if(!d.records.some(r=>r.id===record.id))d.records.unshift(record);return record;
 }
 return {ranks,xp,career,complete};
})();
