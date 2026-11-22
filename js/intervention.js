/* Configuración por intervención y pruebas de preparación. No calcula tensiones. */
Miki.Intervention=(()=>{
 const plans={
  '1:stop':{title:'Contacto S0',zone:'Bornes 11 y 12 del pulsador de paro.',points:['s0in','s0out'],reason:'Se interviene sobre ambos conductores del contacto NC; I0.0 es una entrada pasiva referida a 0 V.'},
  '1:fuse':{title:'Protección F2',zone:'Entrada y salida de la protección de potencia.',points:['f2in','f2out'],reason:'Se comprueban ambos lados del elemento que se sustituye. La salida ya puede estar a 0 V por la avería: eso no acredita aislamiento.'},
  '1:coil':{title:'Relé K1',zone:'Bobina A1–A2 y contacto de potencia 13–14 de K1.',points:['q','f2out','k1out'],reason:'Sustituir K1 afecta a mando y potencia: A1, entrada del contacto y salida del contacto. A2 está conectado al 0 V común del modelo.'},
  '2:power':{title:'Protección F3',zone:'Entrada y salida de F3 en la alimentación de B1.',points:['fuseIn','fuseOut'],reason:'Se revisan los dos lados de F3. El marrón de B1 pertenece al mismo nodo que su salida y no requiere otra lectura repetida.'},
  '2:align':{title:'Ajuste de B1',zone:'Soporte del sensor, junto a la cinta.',points:['brown'],motion:true,reason:'No se desconectan conductores: se comprueba alimentación local de B1 y, de forma separada, que la cinta esté detenida antes del ajuste mecánico.'},
  '2:wire':{title:'Cable W1',zone:'Extremos de la señal: B1 BK e I0.2.',points:['black','terminal'],reason:'Se interviene sobre ambos extremos del cable. B1 puede alimentar la señal; la entrada PLC es receptora pasiva, sin realimentación en este modelo.'}
 };
 plans['3:bsignal']={title:'Cable W2 de B2',zone:'Extremos BK de B2 e I0.3 del PLC.',points:['b2black','b2input'],reason:'Se reparan ambos extremos de señal. B2 puede aportar positivo; la entrada PLC es receptora pasiva y no realimenta el conductor.'};
 plans['3:kcoil']={title:'Relé K2',zone:'Bobina A1–A2 y contacto NO 13–14 de K2.',points:['q2','f4out','k2out'],reason:'Sustituir K2 afecta a mando y potencia: comprobar A1 y ambos lados del contacto; A2 es el 0 V común.'};
 plans['3:fpower']={title:'Protección F4',zone:'Entrada y salida de F4 en la potencia de M2.',points:['f4in','f4out'],reason:'Ambos lados del elemento deben verificarse tras aislar; una salida a cero debida a la avería no acredita aislamiento.'};
 const feeds={
  '1:stop':['Barra local QS1 → S0:11; I0.0 es receptor pasivo'],
  '1:fuse':['Barra local QS1 → F2:1; motor conectado a 0 V como carga'],
  '1:coil':['Barra local QS1 → Q0.0 → bobina','Barra local QS1 → F2 → contacto K1'],
  '2:power':['Barra local QS2 → F3 → alimentación de B1'],
  '2:align':['Barra local QS2 → alimentación de B1','Barra local QS2 → accionamiento de la cinta'],
  '2:wire':['B1 PNP desde la rama local → BK → W1','I0.2: entrada receptora pasiva, sin retorno de alimentación']
 };
 feeds['3:bsignal']=['Barra local QS3 → B2 PNP → BK → W2','I0.3: receptor pasivo respecto a M'];
 feeds['3:kcoil']=['Barra local QS3 → Q0.1 → bobina K2','Barra local QS3 → F4 → contacto K2'];
 feeds['3:fpower']=['Barra local QS3 → F4 → contacto K2 → motor M2'];
 for(const [key,p] of Object.entries(plans)){const level=Number(key.split(':')[0]);p.reference=level===1?'supply':'source';p.isolator='QS'+level;p.sources=feeds[key]}
 const plan=s=>plans[s.level+':'+s.fault];
 function state(s){return s.procedure||(s.procedure={entered:false,before:false,beforeEpoch:-1,locked:false,epoch:null,checks:new Set(),after:false,motion:false,authorizedRepair:false,audit:[],hint:''})}
 function audit(s,action,data={}){const p=state(s);p.audit.push({action,...data,at:new Date().toISOString()});Miki.Simulation.log(s,action,'procedure',data)}
 function begin(s){if(!s.diagnosed||s.repaired||s.done)return false;const p=state(s);if(p.entered)return true;p.entered=true;p.hint='';audit(s,'Preparación iniciada: '+plan(s).title);return true}
 function onIsolation(s,wasIsolated){const p=state(s);const validBefore=p.before&&p.beforeEpoch===s.isolationEpoch-1&&!wasIsolated;p.before=validBefore;p.epoch=s.isolationEpoch;p.checks.clear();p.after=false;p.motion=false;p.locked=false;s.absence.clear();if(p.entered)audit(s,s.isolated?'Zona local aislada con QS'+s.level+'. Fuente y CPU aguas arriba permanecen alimentadas.':'Alimentación local restablecida.');}
 function lock(s){const p=state(s);if(!p.entered||!p.before||!s.isolated||s.repaired)return false;p.locked=true;p.epoch=s.isolationEpoch;p.hint='';audit(s,'Bloqueo didáctico colocado en QS'+s.level+'.');return true}
 function confirmStopped(s){const p=state(s);if(!plan(s).motion||!s.isolated||!p.locked||Miki.Simulation.snapshot(s).motor)return false;p.motion=true;p.hint='';audit(s,'Observación confirmada: cinta detenida antes del ajuste de B1.');return true}
 function zonesDone(s){const p=state(s);return plan(s).points.every(k=>p.checks.has(k))&&(!plan(s).motion||p.motion)}
 function canRepair(s){const p=state(s);return Boolean(s.diagnosed&&p.entered&&p.before&&s.isolated&&p.locked&&p.epoch===s.isolationEpoch&&zonesDone(s)&&p.after&&!s.repaired)}
 function record(s,sample){const p=state(s);if(!p.entered||!s.diagnosed||s.repaired||s.done)return;const current=Miki.Simulation.snapshot(s).nodes;if(sample.epoch!==s.isolationEpoch||sample.isolated!==s.isolated||!(sample.red in current)||!(sample.black in current)||sample.volts!==current[sample.red]-current[sample.black])return;
  const reference=plan(s).reference,isReference=(sample.red===reference&&sample.black==='zero')||(sample.black===reference&&sample.red==='zero');
  p.hint='';
  if(isReference&&Math.abs(sample.volts)===24){
   if(!s.isolated&&!p.locked){const fresh=!p.before||p.beforeEpoch!==s.isolationEpoch;p.before=true;p.beforeEpoch=s.isolationEpoch;if(fresh)audit(s,'Multímetro comprobado ANTES en referencia conocida: '+sample.volts+' V.',{red:sample.red,black:sample.black,volts:sample.volts});return}
   if(s.isolated&&p.locked&&p.before&&p.epoch===s.isolationEpoch&&zonesDone(s)){if(!p.after)audit(s,'Multímetro comprobado DESPUÉS en referencia conocida: '+sample.volts+' V.',{red:sample.red,black:sample.black,volts:sample.volts});p.after=true;return}
  }
  const node=sample.black==='zero'?sample.red:sample.red==='zero'?sample.black:null;
  const canonical=k=>s.level===1&&k==='motor'?'k1out':s.level===2&&k==='brown'?'fuseOut':s.level===3&&k==='m2'?'k2out':k;
  const required=node&&plan(s).points.find(k=>canonical(k)===canonical(node));
  if(s.isolated&&p.before&&p.locked&&p.epoch===s.isolationEpoch&&sample.epoch===s.isolationEpoch&&sample.isolated&&required&&sample.volts===0&&Miki.Simulation.snapshot(s).nodes[node]===0){
   const fresh=!p.checks.has(required);p.checks.add(required);s.absence.add(required);if(fresh)audit(s,'Ausencia local comprobada: '+Miki.levels[s.level].points[node]+' respecto a 0 V.',{point:required,measuredAt:node,epoch:p.epoch});return;
  }
  p.hint='Medida registrada para investigar. Para la preparación cuenta la referencia indicada o un conductor de esta zona respecto a 0 V, tras aislar y bloquear.';
 }
 function markRepair(s){const p=state(s);p.authorizedRepair=true;p.repairProof={before:p.before,after:p.after,points:[...p.checks],motion:p.motion,epoch:p.epoch,locked:p.locked};audit(s,'Reparación simulada autorizada: '+plan(s).title);}
 function release(s){const p=state(s);if(!s.repaired||!p.authorizedRepair||!s.isolated||!p.locked)return false;p.locked=false;audit(s,'Bloqueo didáctico retirado después de reparar.');return true}
 function restart(s){if(s.repaired)return false;const p=state(s);p.before=false;p.beforeEpoch=-1;p.after=false;p.locked=false;p.checks.clear();p.motion=false;p.hint='Preparación reiniciada. Las comprobaciones anteriores ya no autorizan reparación.';s.absence.clear();audit(s,'Preparación cancelada y pruebas invalidadas, sin aplicar reparación.');return true}
 function next(s){const p=state(s),cfg=plan(s),reference=cfg.reference;
  if(s.done)return {kind:'done',text:'Incidencia verificada y completada. Consulta el informe o continúa cuando quieras.'};
  if(!s.diagnosed)return {kind:'investigate',text:'Contrasta el síntoma con el esquema, las señales PLC y tus medidas antes de formular una causa.'};
  if(!p.entered)return {kind:'begin',text:'Diagnóstico confirmado. La incidencia sigue abierta: prepara la intervención antes de reparar.'};
  if(s.repaired){if(p.locked)return {kind:'release',text:'Reparación aplicada, todavía sin verificar. Retira el bloqueo didáctico para preparar la reposición.'};if(s.isolated)return {kind:'restore',text:'Bloqueo retirado. Restablece la alimentación local; aún no se concede recompensa.'};return {kind:'verify',text:s.level===1?'Da una nueva orden de Marcha y comprueba que M1 responde.':s.level===3?'Da una nueva orden de Marcha y espera la recepción por B3, I0.4 y el incremento único del contador.':'Presenta una nueva caja y comprueba B1, I0.2 y el contador.'}}
  if(!p.before){if(s.isolated)return {kind:'restore',text:'La zona ya estaba aislada: restablece antes de iniciar una preparación nueva y comprobar el instrumento.'};return {kind:'referenceBefore',point:reference,text:'Comprueba el multímetro en la referencia conocida de 24 V, antes del aislamiento local.'}}
  if(!s.isolated)return {kind:'isolate',text:'Instrumento comprobado. Abre QS'+s.level+' para aislar la zona local. La fuente aguas arriba y CPU siguen alimentadas.'};
  if(!p.locked)return {kind:'lock',text:'Zona aislada. Coloca el bloqueo didáctico de QS'+s.level+' para impedir la reposición durante la intervención.'};
  if(cfg.motion&&!p.motion)return {kind:'motion',text:'Comprueba que la cinta está detenida antes de ajustar el soporte de B1.'};
  const point=cfg.points.find(k=>!p.checks.has(k));if(point)return {kind:'point',point,text:'Comprueba '+Miki.levels[s.level].points[point]+' respecto a 0 V en la zona aislada. Se esperan 0 V.'};
  if(!p.after)return {kind:'referenceAfter',point:reference,text:'Zona comprobada. Vuelve a medir la referencia conocida de 24 V para comprobar el instrumento después.'};
  return {kind:'repair',text:'Preparación didáctica completada: instrumento, aislamiento, bloqueo y zona comprobados. Puedes aplicar la reparación simulada.'};
 }
 function summary(s){const p=state(s),cfg=plan(s);return {plan:s.level+':'+s.fault,title:cfg.title,zone:cfg.zone,reason:cfg.reason,source:cfg.reference,sources:cfg.sources.slice(),isolator:cfg.isolator,requiredPoints:[...cfg.points],motionRequired:!!cfg.motion,proof:p.repairProof||null,audit:p.audit.slice()}}
 return {plans,plan,state,begin,onIsolation,lock,confirmStopped,canRepair,record,markRepair,release,restart,next,summary};
})();
