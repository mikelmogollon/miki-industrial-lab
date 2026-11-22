/* Motor secuencial determinista. No accede al DOM, almacenamiento ni reloj real. */
Miki.TON=(()=>{
 function valid(PT){if(!Number.isFinite(PT)||PT<=0)throw RangeError('PT debe ser positivo y finito');return PT}
 const create=PT=>({IN:false,PT:valid(PT),ET:0,Q:false});
 function update(t,IN,PT,dt=0){t.PT=valid(PT);t.IN=Boolean(IN);const seconds=Number.isFinite(Number(dt))?Math.max(0,Number(dt)):0;if(!t.IN){t.ET=0;t.Q=false}else{t.ET=Math.min(PT,t.ET+seconds);t.Q=t.ET>=PT-1e-10}return t}
 return {create,update};
})();
Miki.SequenceEngine=(()=>{
 const C={START:.08,B2:.43,B3:.90,BRIDGE_END:.55,JAM:.60,SPEED1:.14,SPEED2:.17,PREPARE:.35,PT:5,PT_MIN:4,PT_MAX:6,PT_CHOICES:[4,5,6],NORMAL_TRANSFER:(.90-.43)/.17};
 const stages={
  E0:['Instalación preparada','Sin acciones de transporte. Espera Marcha y recepción libre.'],
  E1:['Transporte en CV-01','Q0.0 activa M1 hasta recibir I0.3 de B2.'],
  E2:['Preparación de transferencia','Ambas órdenes paradas; comprueba disponibilidad de CV-02.'],
  E3:['Transferencia supervisada','Q0.1 activa M2; Q0.0 acompaña hasta que la caja abandona CV-01. TON supervisa B3.'],
  E4:['Transferencia completada','Una recepción registrada. Se retira la caja y se prepara otra antes de un nuevo ciclo.'],
  EA:['Alarma de transferencia','Ambas órdenes retiradas. Corregir, recuperar y dar una nueva Marcha.']
 };
 function create({fault=null,PT=fault==='timing'?1.2:C.PT}={}){return {fault,PT,stage:'E0',position:C.START,run:false,requested:false,isolated:false,rearmRequired:false,recoveryPermission:false,alarm:'',timer:Miki.TON.create(PT),lastTrip:null,elapsed:0,time:0,count:0,cycle:1,counted:false,blocked:false,stationaryFor:0,events:[],history:[],trace:[],lastTransition:null,lastCommand:'',observations:[]}}
 function emit(m,text,data={}){const e={time:m.time,text,stage:m.stage,...data};m.events.push(e);m.history.push(e);if(m.history.length>100)m.history.shift()}
 function sensors(m){const physicalB3=m.position>=C.B3-1e-10&&m.position<=.97,b2=m.position>=C.B2-1e-10&&m.position<=C.BRIDGE_END+1e-10;return {b2physical:b2,b3physical:physicalB3,b2:!m.isolated&&b2,b3:!m.isolated&&(physicalB3||m.fault==='stuck')}}
 function outputs(m){const live=!m.isolated&&m.run&&!m.alarm&&!m.rearmRequired;return {q1:Boolean(live&&(m.stage==='E1'||m.stage==='E3'&&m.position<=C.BRIDGE_END+1e-10)),q2:Boolean(live&&m.stage==='E3')}}
 function transition(m,to,id){if(m.stage===to&&id!=='TR0')return;if(Miki.SequenceRuntime)Miki.SequenceRuntime.enter(m,to,id);else{const from=m.stage;m.stage=to;m.elapsed=0;m.lastTransition=id;emit(m,`${from} → ${to} · ${id}`,{from,to,transition:id})}Miki.TON.update(m.timer,to==='E3'&&m.run,m.PT)}
 function start(m){if(m.isolated||m.alarm||m.rearmRequired)return false;m.lastCommand='start';m.requested=true;if(m.stage==='E4')return false;if(m.stage==='E0'){if(sensors(m).b3){emit(m,'Marcha pendiente: la recepción no está libre.');return false}m.run=true;transition(m,'E1','T01')}else m.run=true;if(m.stage==='E3')Miki.TON.update(m.timer,true,m.PT);emit(m,'Marcha habilita la secuencia.');return true}
 function stop(m){m.run=false;m.requested=false;m.lastCommand='stop';Miki.TON.update(m.timer,false,m.PT);emit(m,'Paro: posición y etapa conservadas; TON deshabilitado y reiniciado.')}
 function isolate(m,value){m.isolated=value;stop(m);emit(m,value?'Circuitos de campo aislados.':'Campo restablecido: se requiere una orden explícita.')}
 function load(m){if(m.run||m.isolated||m.alarm||m.rearmRequired||!['E0','E4'].includes(m.stage))return false;m.position=C.START;m.counted=false;m.blocked=false;m.stationaryFor=0;m.cycle++;m.requested=false;m.lastCommand='load';transition(m,'E0','T40');emit(m,'Recepción retirada y nueva caja preparada.');return true}
 function rearm(m){if(m.isolated||!m.recoveryPermission||m.run||!m.rearmRequired||m.fault)return false;const id=m.stage==='E0'?'TR0':'TAR';m.alarm='';m.rearmRequired=false;m.requested=false;m.position=C.START;m.blocked=false;m.stationaryFor=0;m.counted=false;m.lastCommand='rearm';transition(m,'E0',id);Miki.TON.update(m.timer,false,m.PT);emit(m,'Recuperación autorizada: E0 preparado; falta Marcha.');return true}
 function confirm(m){m.position=C.B3;m.run=false;m.requested=false;transition(m,'E4','T34');if(!m.counted){m.counted=true;m.count++;emit(m,'B3 confirma una nueva recepción; contador = '+m.count+'.',{count:m.count,cycle:m.cycle})}}
 function trip(m,moving){m.lastTrip={IN:m.timer.IN,PT:m.timer.PT,ET:m.timer.ET,Q:m.timer.Q,position:m.position,moving,stage:'E3',time:m.time};m.run=false;m.requested=false;m.alarm='A_TRANSFER · recepción B3 no confirmada en plazo';m.rearmRequired=true;transition(m,'EA','T3A');emit(m,'Alarma A_TRANSFER: órdenes retiradas; captura de TON y posición guardada.',{capture:{...m.lastTrip}})}
 function advance(m,delta){if(!Number.isFinite(Number(delta)))return;let remaining=Math.min(120,Math.max(0,Number(delta)||0));if(!m.run||m.isolated||m.alarm||m.rearmRequired)return;
  let loops=0;while(remaining>1e-10&&m.run&&++loops<10000){
   if(m.stage==='E1'){const arrival=Math.max(0,(C.B2-m.position)/C.SPEED1),dt=Math.min(remaining,arrival);m.position=Math.min(C.B2,m.position+C.SPEED1*dt);m.time+=dt;m.elapsed+=dt;remaining-=dt;if(sensors(m).b2)transition(m,'E2','T12');else break}
   else if(m.stage==='E2'){const dt=Math.min(remaining,Math.max(0,C.PREPARE-m.elapsed));m.time+=dt;m.elapsed+=dt;remaining-=dt;if(m.elapsed>=C.PREPARE-1e-10&&!sensors(m).b3)transition(m,'E3','T23');else break}
   else if(m.stage==='E3'){
    const physicallyBlocked=m.fault==='jam'&&m.position>=C.JAM-1e-10,limit=m.fault==='jam'?C.JAM:C.B3;
    const untilPosition=physicallyBlocked?Infinity:Math.max(0,(limit-m.position)/C.SPEED2),untilTimeout=Math.max(0,m.PT-m.timer.ET),dt=Math.min(remaining,untilPosition,untilTimeout);
    const old=m.position;if(!physicallyBlocked)m.position=Math.min(limit,m.position+C.SPEED2*dt);const moving=m.position>old+1e-12;
    m.time+=dt;m.elapsed+=dt;remaining-=dt;m.stationaryFor=moving?0:m.stationaryFor+dt;Miki.TON.update(m.timer,true,m.PT,dt);
    // Confirmación tiene prioridad incluso si el vencimiento cae en el mismo instante.
    if(sensors(m).b3){confirm(m);break}
    if(m.timer.Q){trip(m,moving);break}
    if(m.fault==='jam'&&m.position>=C.JAM-1e-10&&!m.blocked){m.blocked=true;emit(m,'La posición de la caja deja de avanzar mientras continúa la orden de M2.',{position:m.position})}
    if(dt<=1e-12&&!physicallyBlocked)break;
   }else break;
  }
  const out=outputs(m);m.trace.push({time:m.time,stage:m.stage,position:m.position,ET:m.timer.ET,PT:m.PT,q1:out.q1,q2:out.q2});if(m.trace.length>80)m.trace.shift();
 }
 function afterRepair(m,PT){m.fault=null;if(Number.isFinite(PT)&&C.PT_CHOICES.includes(PT))m.PT=PT;m.position=C.START;m.run=false;m.requested=false;m.rearmRequired=true;m.counted=false;m.blocked=false;m.stationaryFor=0;m.cycle++;Miki.TON.update(m.timer,false,m.PT);if(m.stage!=='EA')transition(m,'E0','REPAIR');emit(m,'Intervención aplicada; recuperación controlada pendiente.')}
 function inspect(m){const sig=sensors(m),o={physicalOccupiedB3:sig.b3physical,sensorSignalB3:sig.b3,position:m.position,obstructionVisible:m.blocked,noObstruction:!m.blocked&&m.fault!=='jam',stationaryFor:m.stationaryFor,stage:m.stage,moving:snapshot(m).boxMoving};m.observations.push(o);if(m.observations.length>20)m.observations.shift();emit(m,'Inspección registrada: recepción '+(o.physicalOccupiedB3?'ocupada':'sin caja')+'; señal B3 '+(+o.sensorSignalB3)+'; '+(o.obstructionVisible?'caja retenida en la zona de transferencia.':'sin obstrucción visible.'),{observation:o});return o}
 function grafcet(m){const sig=sensors(m),out=outputs(m),ready=!m.isolated&&!m.alarm&&!m.rearmRequired;const defs=[
  ['T01','E0','E1','Marcha ∧ recepción libre ∧ permiso',m.requested&&ready&&!sig.b3,'Solo se inicia si CV-02 está libre y no hay alarma o recuperación pendiente.'],
  ['T12','E1','E2','I0.3 · llegada B2',sig.b2,'La llegada detectada termina el transporte por CV-01.'],
  ['T23','E2','E3','Preparación cumplida ∧ ¬I0.4',m.elapsed>=C.PREPARE-1e-10&&!sig.b3,'Se comprueba el destino libre antes de activar ambas cintas.'],
  ['T34','E3','E4','I0.4 · recepción B3',sig.b3,'La confirmación prevalece sobre un vencimiento coincidente.'],
  ['T3A','E3','EA','TON.Q ∧ ¬I0.4',m.timer.Q&&!sig.b3,'Si no hay recepción y vence la supervisión, se enclava la alarma.'],
  ['T40','E4','E0','Retirar recepción y preparar otra caja',m.lastCommand==='load','Una acción explícita evita contar dos veces la misma caja.'],
  ['TAR','EA','E0','Orden de rearme autorizado',m.recoveryPermission&&m.lastCommand==='rearm'&&!m.isolated,'Recuperación desde alarma tras terminar la intervención. La orden de rearme no solicita Marcha.'],
  ['TR0','E0','E0','Orden de rearme tras intervenir',m.recoveryPermission&&m.lastCommand==='rearm'&&!m.isolated,'Una intervención de sensor puede requerir recuperación estando ya en E0, sin inventar una alarma previa.']
 ];
  return {stage:m.stage,steps:Object.entries(stages).map(([id,[title,description]])=>({id,label:title,title,description,active:id===m.stage,actions:id==='E1'?['Q0.0 → M1']:id==='E3'?['Q0.0 acompaña el cruce','Q0.1 → M2','TON supervisión']:id==='EA'?['Q0.0 = 0','Q0.1 = 0','Alarma enclavada']:id==='E4'?['Registrar recepción una vez']:['Sin orden de movimiento']})),transitions:defs.map(([id,from,to,label,condition,description])=>({id,from,to,label,condition:Boolean(condition),enabled:m.stage===from&&(['T40','TAR','TR0'].includes(id)?!m.run:m.run)&&Boolean(condition),description,lastFired:m.lastTransition===id})),lastTransition:m.lastTransition,actions:{Q00:out.q1,Q01:out.q2}};
 }
 function snapshot(m){const sig=sensors(m),out=outputs(m),boxMoving=(out.q1&&m.stage==='E1')||(out.q2&&!(m.fault==='jam'&&m.position>=C.JAM-1e-10));const observation={physicalOccupiedB3:sig.b3physical,sensorSignalB3:sig.b3,position:m.position,obstructionVisible:m.blocked,noObstruction:!m.blocked&&m.fault!=='jam',stationaryFor:m.stationaryFor};return {stage:m.stage,position:m.position,run:m.run,requested:m.requested,count:m.count,cycle:m.cycle,elapsed:m.elapsed,timer:{...m.timer},lastTrip:m.lastTrip?{...m.lastTrip}:null,alarm:m.alarm,rearmRequired:m.rearmRequired,b2detect:sig.b2,b2input:sig.b2,b3detect:sig.b3,b3input:sig.b3,b3physical:sig.b3physical,motor1:out.q1,motor2:out.q2,q1:out.q1,q2:out.q2,boxMoving:Boolean(boxMoving),physicalJammed:m.blocked,noObstruction:observation.noObstruction,observation,trace:m.trace.map(x=>({...x})),grafcet:grafcet(m)}}
 return {constants:C,create,start,stop,isolate,load,rearm,advance,afterRepair,inspect,snapshot};
})();
