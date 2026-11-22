// Controlador v0.3.2: el modo Carrera altera progreso; Práctica libre es aislada.
(()=>{
 const $=id=>document.getElementById(id),sim=Miki.Simulation,ui=Miki.UI,levels=Miki.Learning.availableLevels();
 const states=Object.fromEntries(levels.map(l=>[l,sim.create(l)]));
 let store;try{store=localStorage}catch{store={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}}
 const loaded=Miki.Storage.load(store),progress=loaded.data,journey=Miki.Learning.session(progress);
 Miki.Learning.rememberAccess(progress);
 let recoverySafe=true;
 for(const item of loaded.recovery){try{store.setItem(item.key+'-recovery-'+Date.now(),item.raw)}catch{recoverySafe=false}}
 let stored=recoverySafe&&Miki.Storage.save(store,progress),activeLevel=levels[0];
 function refreshProgress(){ui.careerRender(progress,stored,loaded.warnings);ui.updateJourney(progress,journey)}
 function save(){Miki.Learning.rememberAccess(progress);stored=recoverySafe&&Miki.Storage.save(store,progress);refreshProgress()}
 function render(l){
  sim.settle(states[l]);const s=states[l];
  if(journey.mode==='career'){
   const nextLevel=Miki.Curriculum.next(l),wasNext=Miki.Learning.access(progress,nextLevel,'career').unlocked;
   const record=Miki.Progression.complete(s,progress);
   ui.render(s);
   if(record){record.intervention=Miki.Intervention.summary(s);record.newUnlocked=!wasNext&&Miki.Learning.access(progress,nextLevel,'career').unlocked;save();ui.report(record)}
  }else{
   const completed=sim.verify(s)&&!s.done;
   if(completed){s.done=true;sim.log(s,'Verificación superada en Práctica libre. No se modifican los XP de Carrera.');journey.markPractice(l,s.fault)}
   ui.render(s);
   if(completed){const def=Miki.levels[l].faults[s.fault];ui.report({mode:'practice',id:s.id,level:l,fault:s.fault,name:def.name,explanation:def.explanation,evidence:def.evidence,repair:def.repair,verification:l>=4?Miki.levels[l].verification:l===3?'Nueva transferencia confirmada por B3 e I0.4; contador incrementado.':l===1?'M1 arranca tras restablecer alimentación y dar Marcha.':'Una nueva caja activa I0.2 y aumenta el contador.',score:null,xp:0,checkCount:s.checks.size,mistakes:s.mistakes,events:s.events.slice(),intervention:Miki.Intervention.summary(s)})}
  }
  ui.updateJourney(progress,journey);
 }
 function next(l){const nextFault=journey.next(l,states[l].fault);if(nextFault)reset(l,nextFault)}
 function reset(l,fault=states[l].fault){
  states[l]=sim.create(l,fault);
  document.querySelectorAll('input[name="'+ui.ids[l].cause+'"]').forEach(e=>e.checked=false);
  sim.log(states[l],'Incidencia preparada. Investiga antes de intervenir.');
  ui.tab(l,ui.ids[l].scheme);render(l);
 }
 function action(l,type,value){sim.action(states[l],type,value);render(l)}
 function exportProgress(){
  const blob=new Blob([JSON.stringify({application:'MIKI Industrial Lab',exportedAt:new Date().toISOString(),...progress},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='MIKI-progreso-carrera-v032.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function openLevel(l){
  const result=journey.access(l);
  if(!result.unlocked){ui.accessMessage(result.reason);return false}
  if(activeLevel>=4&&l!==activeLevel&&sim.snapshot(states[activeLevel]).ticking){sim.action(states[activeLevel],'stop');ui.render(states[activeLevel])}
  activeLevel=l;ui.showLevel(l);ui.accessMessage('');ui.updateJourney(progress,journey);window.scrollTo({top:0,behavior:'smooth'});return true;
 }
 function changeMode(mode){
  if(!journey.change(mode))return;
  // No se permite terminar en Carrera un caso iniciado en Práctica, o viceversa.
  for(const l of levels)reset(l,Miki.Learning.faults(l)[0]);
  if(!journey.access(activeLevel).unlocked)activeLevel=levels[0];
  ui.showLevel(activeLevel);
  ui.accessMessage(mode==='practice'?'Práctica libre: puedes investigar cualquier nivel disponible sin modificar XP, insignias, historial ni desbloqueos.':'Modo Carrera: completa dos casos distintos de cada nivel para avanzar.');
  refreshProgress();window.scrollTo({top:0,behavior:'smooth'});
 }
 ui.setup({
  sequenceView:l=>{const s=states[l];s.checks.add('grafcet');sim.action(s,'observe');if(sim.snapshot(s).timer?.IN||sim.snapshot(s).lastTrip)s.checks.add('timer');ui.render(s)},
  sortingProcedure:(l,kind,value)=>{Miki.SortingIntervention.perform(states[l],kind,value);render(l)},
  sequenceProcedure:(l,kind,value)=>{Miki.SequenceIntervention.perform(states[l],kind,value);render(l)},
  getProgress:()=>progress, getJourney:()=>journey, exportProgress,next,openLevel,changeMode,
  procedureAction:(l,type)=>{const s=states[l],I=Miki.Intervention;const fn={begin:I.begin,lock:I.lock,motion:I.confirmStopped,release:I.release,restart:I.restart}[type];if(fn)fn(s);if(type==='begin')ui.tab(l,ui.ids[l].scheme);render(l)},
  selection:l=>ui.render(states[l]),
  isolate:l=>{action(l,'isolate');if(states[l].isolated)ui.tab(l,ui.ids[l].scheme)},
  plc:l=>{const s=states[l],v=sim.snapshot(s);s.checks.add('plc');sim.log(s,l===4?`PLC: etapa=${v.stage}, I0.3=${+v.b2input}, I0.4=${+v.b3input}, Q0.0=${+v.q1}, Q0.1=${+v.q2}, TON IN=${+v.timer.IN}, PT=${v.timer.PT}, ET=${v.timer.ET.toFixed(2)}, Q=${+v.timer.Q}.`:l===3?`PLC: I0.3=${+v.b2input}, I0.4=${+v.b3input}, Q0.0=${+v.q1}, Q0.1=${+v.q2}, etapa=${v.sequence}, contador=${s.count}.`:l===1?`PLC: I0.0=${+v.stopOk}, Q0.0=${+v.q}.`:`PLC: I0.2=${+v.input}, contador=${s.count}.`);ui.render(s)}
 });
 for(const l of levels){const i=ui.ids[l];
  $(i.reset).onclick=()=>reset(l);
  $(i.next).onclick=()=>next(l);
  $(i.measure).onclick=()=>{const p=ui.selection(l);Miki.Measurements.take(states[l],p.red,p.black);render(l)};
  $(i.repair).onclick=()=>{sim.repair(states[l]);render(l)};
  $(i.answer).onclick=()=>{
   const s=states[l],sel=document.querySelector('input[name="'+ui.ids[l].cause+'"]:checked');
   if(s.repaired){s.feedback='La reparación ya está aplicada. Comprueba el funcionamiento.';s.feedbackError=false}
   else if(!sel){s.feedback='Selecciona una causa.';s.feedbackError=true}
   else if(sel.value!==s.fault){s.mistakes++;s.feedback='Esta hipótesis no encaja. Contrasta alimentación, señal y continuidad.';s.feedbackError=true;sim.log(s,'Hipótesis de diagnóstico descartada.')}
   else{s.diagnosed=true;s.feedback='Diagnóstico correcto. La incidencia sigue abierta. Pulsa Preparar intervención en la guía para continuar.';s.feedbackError=false;sim.log(s,'Causa identificada: '+Miki.levels[l].faults[s.fault].name)}render(l);
  };
  $(i.inspect).onclick=()=>{
   const s=states[l];s.checks.add('inspect');if(l>=4){sim.action(s,'inspect');ui.tab(l,i.logTab);render(l);return}
   const note=l===3?'Caja, sensores y motores observables en planta. Contrasta LED de B2 con I0.3, orden Q0.1 y movimiento real de M2.':l===1?'No hay bloqueos mecánicos ni cables sueltos visibles.':s.fault==='align'&&!s.repaired?'El soporte de B1 parece desplazado. Comprueba alimentación y salida.':sim.snapshot(s).detect?'El LED de B1 cambia ante la caja. Contrasta I0.2.':'El sensor no cambia su LED ante la caja. Comprueba alimentación y detección.';
   sim.log(s,'Inspección: '+note);ui.tab(l,i.logTab);render(l);
  };
 }
 for(const [id,type,release] of [['startBtn','start','releaseStart'],['stopBtn','stop','releaseStop']])$(id).onclick=()=>{
  const idBefore=states[1].id;action(1,type);setTimeout(()=>{if(states[1].id===idBefore)action(1,release)},700)
 };
 for(const [id,type]of [['sortingStartBtn','start'],['sortingStopBtn','stop'],['sortingLoadBtn','load'],['sortingRearmBtn','rearm'],['sortingAirCutBtn','airCut']])$(id).onclick=()=>action(5,type,type==='load'?$('sortingBoxType').value:undefined);
 for(const [id,type] of [['sequenceStartBtn','start'],['sequenceStopBtn','stop'],['sequenceLoadBtn','load'],['sequenceRearmBtn','rearm']])$(id).onclick=()=>action(4,type);
 for(const [id,type] of [['transferStartBtn','start'],['transferStopBtn','stop'],['transferLoadBtn','load']])$(id).onclick=()=>action(3,type);
 $('boxPresentBtn').onclick=()=>action(2,'box',true);
 $('boxRemoveBtn').onclick=()=>action(2,'box',false);
 for(const l of levels)reset(l,Miki.Learning.faults(l)[0]);
 ui.showLevel(activeLevel);save();
 let lastTick=performance.now();setInterval(()=>{const now=performance.now(),dt=Math.min(.3,(now-lastTick)/1000);lastTick=now;for(const l of [3,4,5]){const s=states[l],v=sim.snapshot(s);if(l>=4?v.ticking:['approach','transfer'].includes(v.sequence)){sim.action(s,'tick',dt);render(l)}}},200);
 document.addEventListener('visibilitychange',()=>{lastTick=performance.now()});
 let motion=0;setInterval(()=>{motion=(motion+3)%180;const s1=sim.snapshot(states[1]),s2=sim.snapshot(states[2]);if(s1.motor)$('movingCrate').setAttribute('x',String(435+motion));if(s2.motor)$('beltpat2').setAttribute('patternTransform','translate('+motion+' 0)')},70);
})();
