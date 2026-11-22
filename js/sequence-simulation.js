/* Adaptador entre el motor secuencial puro y el controlador compartido. */
Miki.SequenceSimulation=(()=>{
 const E=Miki.SequenceEngine;
 function init(s){s.sequence=E.create({fault:s.fault});s.box=true;s.parameterPT=null;s.postRepairStart=false;s.repairCount=0}
 function flush(s){for(const e of s.sequence.events.splice(0))Miki.Simulation.log(s,e.text,'sequence',{stage:e.stage,time:e.time,...(e.capture?{capture:e.capture}:{})});s.count=s.sequence.count;s.requested=s.sequence.requested}
 function snapshot(s){const m=s.sequence,v=E.snapshot(m),live=!s.isolated,local=live?24:0;const alias={E0:'ready',E1:'approach',E2:'preparing',E3:'transfer',E4:'confirmed',EA:'timeout'};
  const labels={E0:'E0 · preparada; espera Marcha y recepción libre',E1:'E1 · transporte hacia B2',E2:'E2 · comprobación de recepción libre',E3:'E3 · transferencia supervisada',E4:'E4 · recepción confirmada',EA:'EA · alarma de transferencia'};
  const nodes={source:24,local,b2brown:local,b2black:v.b2detect?24:0,b2input:v.b2input?24:0,b3brown:local,b3black:v.b3detect?24:0,b3input:v.b3input?24:0,q1:v.q1?24:0,q2:v.q2?24:0,f4in:local,f4out:local,k2out:v.motor2?24:0,m2:v.motor2?24:0,zero:0};
  return {...v,nodes,sequence:alias[v.stage],live,motor:v.motor1||v.motor2,q:v.q1,coil:v.q2,coil2:v.q2,detect:v.b2detect,input:v.b2input,output:nodes.b2black,phase:s.isolated?'Campo aislado · ambas cintas detenidas':v.stage==='E0'&&v.b3input?'E0 · permiso pendiente: recepción indicada como ocupada':!v.run&&['E1','E2','E3'].includes(v.stage)?labels[v.stage]+' · pausa por Paro':labels[v.stage],count:s.count,box:true,ready:live&&!v.alarm&&!v.rearmRequired&&!v.b3input&&v.stage==='E0',stopOk:live,start:s.startHeld,supervision:v.timer.PT,ticking:live&&v.run&&!v.alarm&&['E1','E2','E3'].includes(v.stage)};
 }
 function action(s,type,value){const m=s.sequence,I=Miki.Intervention,p=I.state(s);m.recoveryPermission=s.repaired&&!p.locked&&!s.isolated;
  if(type==='tick'){E.advance(m,value);flush(s);return}
  if(type==='start'){if(s.isolated||p.locked)return;s.startHeld=true;if(E.start(m)&&s.repaired)s.postRepairStart=true;flush(s);return}
  if(type==='stop'){E.stop(m);s.startHeld=false;flush(s);return}
  if(type==='releaseStart'){s.startHeld=false;return}
  if(type==='load'){if(p.locked)return;E.load(m);flush(s);return}
  if(type==='rearm'){if(p.locked||!s.repaired||s.isolated){Miki.Simulation.log(s,'Recuperación pendiente: termina la intervención y prepara la reposición.');return}E.rearm(m);flush(s);return}
  if(type==='inspect'||type==='observe'){const o=E.inspect(m);s.checks.add('inspect');s.lastObservation={...o};flush(s);return o}
  if(type==='isolate'){s.isolated=!s.isolated;s.isolationEpoch++;s.absence.clear();s.startHeld=false;E.isolate(m,s.isolated);I.onIsolation(s,!s.isolated);flush(s)}
 }
 function onRepair(s){s.repairCount=s.count;const PT=s.parameterPT??s.selectedPT;if(s.fault==='timing'&&!E.constants.PT_CHOICES.includes(Number(PT)))throw Error('Configuración de supervisión no validada');E.afterRepair(s.sequence,s.fault==='timing'?Number(PT):undefined);s.postRepairStart=false;s.box=true;flush(s)}
 function verify(s){const v=snapshot(s),p=Miki.Intervention.state(s);return Boolean(s.repaired&&p.authorizedRepair&&!p.locked&&!s.isolated&&!v.rearmRequired&&!v.alarm&&s.postRepairStart&&v.stage==='E4'&&v.b3input&&v.b3physical&&s.count>s.repairCount)}
 Miki.Simulation.registerModel('sequence',{init,snapshot,action,onRepair,verify});return {init,snapshot,action,onRepair,verify};
})();
