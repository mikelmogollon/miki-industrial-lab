/* Adaptador determinista de transferencia. tick recibe segundos, nunca lee el reloj. */
Miki.TransferSimulation=(()=>{
 const B2=.45,B3=.90,SPEED1=.14,SPEED2=.17,APPROACH_LIMIT=12,TRANSFER_LIMIT=10;
 function init(s){s.transfer={position:.08,sequence:'ready',run:false,elapsed:0,cycle:1,counted:false,alarm:'',repairCount:0};s.box=true}
 function snapshot(s){
  const t=s.transfer,live=!s.isolated,active=f=>s.fault===f&&!s.repaired;
  const b2detect=live&&s.box&&t.position>=.43&&t.position<=.55,b3detect=live&&s.box&&t.position>=B3-1e-8&&t.position<=.97;
  const b2input=b2detect&&!active('bsignal'),b3input=b3detect;
  const running=live&&t.run&&!t.alarm;
  const q1=running&&(t.sequence==='approach'||(t.sequence==='transfer'&&t.position<=.55));
  const q2=running&&t.sequence==='transfer',coil2=q2&&!active('kcoil');
  const motor1=q1,motor2=coil2&&!active('fpower'),local=live?24:0;
  const nodes={source:24,local,b2brown:local,b2black:b2detect?24:0,b2input:b2input?24:0,b3brown:local,b3black:b3detect?24:0,b3input:b3input?24:0,q1:q1?24:0,q2:q2?24:0,f4in:local,f4out:live&&!active('fpower')?24:0,k2out:motor2?24:0,m2:motor2?24:0,zero:0};
  const labels={ready:'Caja preparada · solicita Marcha',approach:'CV-01 transporta hacia B2',transfer:'Transferencia supervisada hacia B3',confirmed:'Recepción confirmada · transferencia registrada',timeout:'Tiempo de supervisión agotado · repite Marcha para contrastar señales'};
  const phase=s.done?'Caso completado · '+labels[t.sequence]:s.isolated?'Campo aislado · ambas cintas detenidas':t.alarm?labels.timeout:!t.run&&['approach','transfer'].includes(t.sequence)?'Secuencia pausada por paro operativo':labels[t.sequence];
  return {nodes,live,phase,motor:motor1||motor2,motor1,motor2,q:q1,q1,q2,coil2,coil:coil2,b2detect,b2input,b3detect,b3input,detect:b2detect,input:b2input,output:nodes.b2black,count:s.count,position:t.position,sequence:t.sequence,alarm:t.alarm,elapsed:t.elapsed,supervision:t.sequence==='approach'?APPROACH_LIMIT:TRANSFER_LIMIT,cycle:t.cycle,box:s.box,stopOk:live,start:s.startHeld,ready:live&&!t.run&&!t.alarm};
 }
 function enter(s,sequence){const t=s.transfer;if(t.sequence===sequence)return;t.sequence=sequence;t.elapsed=0;Miki.Simulation.log(s,sequence==='transfer'?'I0.3 confirma llegada. PLC ordena Q0.1 y coordina ambas cintas.':'Secuencia: '+sequence,'sequence')}
 function timeout(s){const t=s.transfer;t.run=false;t.alarm='Supervisión: no se ha confirmado la llegada esperada.';enter(s,'timeout');Miki.Simulation.log(s,'Supervisión agotada: se detienen ambas órdenes. Comprueba posición, entradas, salidas y potencia; Marcha repite la prueba.','sequence')}
 function tick(s,delta){
  const t=s.transfer;if(s.isolated||!t.run||t.alarm||!s.box)return;
  const duration=Math.min(30,Math.max(0,Number(delta)||0));
  // Subpasos evitan saltar sensores o diferencias de comportamiento por tamaño de tick.
  let remaining=duration;while(remaining>1e-9&&t.run){const dt=Math.min(.05,remaining);remaining-=dt;
   let v=snapshot(s);t.elapsed+=dt;
   if(t.sequence==='approach'){
    if(v.motor1)t.position=Math.min(B2,t.position+SPEED1*dt);
    v=snapshot(s);if(v.b2input)enter(s,'transfer');else if(t.elapsed>=APPROACH_LIMIT)timeout(s);
   }else if(t.sequence==='transfer'){
    // La caja atraviesa la interfaz solo con ambas cintas, luego continúa solo en CV-02.
    if(v.motor2&&(t.position>.55||v.motor1))t.position=Math.min(B3,t.position+SPEED2*dt);
    v=snapshot(s);if(v.b3input&&t.position>=B3-1e-8){
     t.position=B3;t.run=false;enter(s,'confirmed');if(!t.counted){t.counted=true;s.count++;Miki.Simulation.log(s,'B3 → I0.4: transferencia '+t.cycle+' confirmada. Contador = '+s.count+'.','sequence')}
    }else if(t.elapsed>=TRANSFER_LIMIT)timeout(s);
   }
  }
 }
 function action(s,type,value){const t=s.transfer;
  if(type==='tick'){tick(s,value);return}
  if(type==='start'){
   if(s.isolated||Miki.Intervention.state(s).locked)return;
   if(t.sequence==='confirmed'){Miki.Simulation.log(s,'Caja ya recibida. Prepara otra caja antes de repetir la secuencia.');return}
   s.startHeld=true;s.requested=true;t.run=true;t.alarm='';t.elapsed=0;
   t.sequence=t.position>=.55||(t.position>=.43&&snapshot(s).b2input)?'transfer':'approach';
   if(s.repaired)s.postRepairStart=true;
   Miki.Simulation.log(s,'Marcha solicitada: secuencia automática habilitada.','sequence');return;
  }
  if(type==='releaseStart'){s.startHeld=false;return}
  if(type==='stop'){t.run=false;s.requested=false;s.startHeld=false;Miki.Simulation.log(s,'Paro operativo: se detienen las dos órdenes; la caja conserva su posición.');return}
  if(type==='load'){
   if(t.run||s.isolated||Miki.Intervention.state(s).locked)return;
   t.position=.08;t.sequence='ready';t.alarm='';t.elapsed=0;t.counted=false;t.cycle++;s.box=true;s.requested=false;
   Miki.Simulation.log(s,'Nueva caja preparada en CV-01; hace falta una nueva orden de Marcha.');return;
  }
  if(type==='isolate'){
   s.isolated=!s.isolated;s.isolationEpoch++;s.absence.clear();s.requested=false;s.startHeld=false;t.run=false;
   Miki.Simulation.log(s,s.isolated?'QS3 abierto: ambas cintas y sensores aislados. Fuente y CPU permanecen alimentadas.':'QS3 cerrado: campo restablecido; se requiere Marcha.');
   Miki.Intervention.onIsolation(s,!s.isolated);
  }
 }
 function onRepair(s){const t=s.transfer;t.repairCount=s.count;t.position=.08;t.sequence='ready';t.run=false;t.alarm='';t.elapsed=0;t.counted=false;t.cycle++;s.box=true;s.postRepairStart=false}
 function verify(s){const t=s.transfer,p=Miki.Intervention.state(s);return Boolean(s.repaired&&p.authorizedRepair&&!p.locked&&!s.isolated&&s.postRepairStart&&t.sequence==='confirmed'&&s.count>t.repairCount&&snapshot(s).b3input)}
 const adapter={init,snapshot,action,onRepair,verify};Miki.Simulation.registerModel('transfer',adapter);return {constants:{B2,B3,SPEED1,SPEED2,APPROACH_LIMIT,TRANSFER_LIMIT},...adapter};
})();
