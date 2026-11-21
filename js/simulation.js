// Pure electrical snapshots: UI, PLC and meter consume the same calculation.
Miki.Simulation=(()=>{
 // Future equipment can register a different model without replacing this controller.
 const models={};
 function registerModel(name,adapter){if(typeof adapter.snapshot!=='function'||typeof adapter.verify!=='function')throw Error('A model requires snapshot and verify');models[name]=adapter}
 function create(level,fault){const def=Miki.levels[level];return {level,fault:fault||Object.keys(def.faults)[0],isolated:false,isolationEpoch:0,absence:new Set(),repaired:false,diagnosed:false,done:false,requested:false,startHeld:false,stopHeld:false,box:false,count:0,previousInput:false,mistakes:0,checks:new Set(),events:[],measurements:[],lastMeasurement:null,feedback:'',feedbackError:false,postRepairStart:false,postRepairBox:false,id:globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random()}}
 function snapshot(s){const adapter=models[Miki.levels[s.level].model];if(adapter)return adapter.snapshot(s);const live=!s.isolated,local=live?24:0,active=k=>s.fault===k&&!s.repaired;
  const stopOk=live&&!s.stopHeld&&!active('stop'),q=s.level===1?stopOk&&s.requested:live;
  const coil=q&&!active('coil'),fuseOk=!active('fuse'),motor=s.level===1?coil&&fuseOk:live;
  const sensorSupply=live&&!active('power')?24:0,detect=s.box&&sensorSupply===24&&!active('align'),output=detect?24:0,terminal=active('wire')?0:output;
  const nodes=s.level===1?{supply:24,local,s0in:local,s0out:stopOk?24:0,start:live&&s.startHeld?24:0,q:q?24:0,f2in:local,f2out:live&&fuseOk?24:0,k1out:motor?24:0,motor:motor?24:0,zero:0}:{source:24,local,fuseIn:local,fuseOut:sensorSupply,brown:sensorSupply,black:output,terminal,zero:0};
  let phase=s.done?'Caso completado':s.isolated?'Alimentación local aislada':s.repaired?'Reparación pendiente de verificar':s.level===1?(motor?'Máquina en funcionamiento':s.requested||!stopOk?'Detenida por avería':'Parada por orden · circuito por comprobar'):'Motor en marcha · detección por comprobar';
  return {nodes,stopOk,start:live&&s.startHeld,q,coil,motor,sensorSupply,detect,input:terminal>12,output,count:s.count,phase,live};
 }
 function log(s,message,kind='action',data){const previous=s.events.at(-1);if(previous?.message===message&&previous?.kind===kind)return;s.events.push({t:new Date().toLocaleTimeString('es-ES'),message,kind,...(data?{data}:{})});if(s.events.length>200)s.events.shift()}
 function settle(s){const adapter=models[Miki.levels[s.level].model];if(adapter){adapter.settle?.(s);return snapshot(s)}const v=snapshot(s);if(!v.stopOk&&s.level===1)s.requested=false;if(s.level===2){if(v.input&&!s.previousInput)s.count++;s.previousInput=v.input}return snapshot(s)}
 function action(s,type,value){
  if(type==='isolate'&&s.isolated&&Miki.Intervention.state(s).locked){const message='Reposición bloqueada: termina la reparación y retira el bloqueo didáctico.';s.feedback=message;s.feedbackError=true;Miki.Intervention.state(s).hint=message;log(s,message,'procedure');return snapshot(s)}
 
  const adapter=models[Miki.levels[s.level].model];if(adapter?.action){adapter.action(s,type,value);return settle(s)}
  if(type==='start'){s.startHeld=true;s.requested=snapshot(s).stopOk;if(s.repaired&&!s.isolated)s.postRepairStart=true;log(s,'Marcha pulsada.');}
  if(type==='releaseStart')s.startHeld=false;
  if(type==='stop'){s.stopHeld=true;s.requested=false;log(s,'Paro operativo pulsado: cae la orden PLC.');}
  if(type==='releaseStop')s.stopHeld=false;
  if(type==='box'){const change=s.box!==value;s.box=value;if(change){log(s,value?'Caja colocada frente a B1.':'Caja retirada.');if(s.repaired&&value&&!s.isolated)s.postRepairBox=true}}
  if(type==='isolate'){s.isolated=!s.isolated;s.isolationEpoch++;s.absence.clear();s.requested=false;s.startHeld=false;s.stopHeld=false;log(s,s.isolated?'QS'+s.level+' abierto: rama local aislada; fuente aguas arriba a 24 V.':'QS'+s.level+' cerrado: alimentación local restablecida.');}
  if(type==='isolate')Miki.Intervention.onIsolation(s,!s.isolated);
  return settle(s);
 }
 function canRepair(s){return Miki.Intervention.canRepair(s)}
 function repair(s){if(s.repaired)return false;if(!canRepair(s)){s.feedback='Preparación incompleta. Sigue la guía: instrumento antes, aislamiento, bloqueo, zona e instrumento después.';s.feedbackError=true;return false}Miki.Intervention.markRepair(s);s.repaired=true;s.requested=false;s.box=false;s.previousInput=false;log(s,'Reparación aplicada con aislamiento y ausencia de tensión comprobada.');s.feedback='Reparación aplicada. Restablece alimentación y '+(s.level===1?'pulsa Marcha.':'coloca una nueva caja.');s.feedbackError=false;settle(s);return true}
 function verify(s){const adapter=models[Miki.levels[s.level].model];if(adapter)return adapter.verify(s);const v=snapshot(s);return s.repaired&&Miki.Intervention.state(s).authorizedRepair&&!Miki.Intervention.state(s).locked&&!s.isolated&&(s.level===1?v.motor&&s.postRepairStart:v.input&&s.postRepairBox&&s.count>0)}
 return {create,snapshot,settle,action,log,canRepair,repair,verify,registerModel};
})();
