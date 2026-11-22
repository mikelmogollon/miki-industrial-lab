/* Mismo equipo y mesa. El nivel añade diagnóstico de secuencia, no otra máquina. */
Miki.SequenceUI=(()=>{
 const $=id=>document.getElementById(id);
 function create(){
  const nav=document.createElement('button');nav.type='button';nav.className='levelNav';nav.dataset.level='4';nav.innerHTML='<span class="number">04</span><span>Secuencias y alarmas<small>La transferencia se queda bloqueada</small></span>';document.querySelector('.courseNav').insertBefore(nav,$('courseProgress'));
  const root=$('level3Content').cloneNode(true);root.id='level4Content';root.classList.add('hidden');
  for(const n of root.querySelectorAll('*'))for(const a of [...n.attributes]){
   if(a.name==='data-transfer-tab'){n.setAttribute('data-sequence-tab',a.value.replace(/^transfer/,'sequence'));n.removeAttribute(a.name)}
   else if(['id','for','name','aria-controls','aria-labelledby'].includes(a.name)&&a.value.startsWith('transfer'))n.setAttribute(a.name,a.value.replace(/^transfer/,'sequence'));
  }
  root.querySelector('h2').textContent='Secuencias y alarmas · CV-01 / CV-02';root.querySelector('aside .flag').textContent='NIVEL 04';root.querySelector('aside .callout').innerHTML='<b>El operario informa:</b><br>«La transferencia queda esperando o dispara una alarma antes de completarse».';
  root.querySelector('aside .sideKpi:last-of-type b')?.replaceChildren(document.createTextNode('GRAFCET · TON · señales PLC'));
  const steps=root.querySelectorAll('aside .step');steps[0].querySelector('p').textContent='Solicita Marcha. Observa la etapa, las receptividades y la posición de la caja.';steps[1].querySelector('p').textContent='Contrasta sensores, movimiento físico y tiempo configurado con el monitor.';steps[2].querySelector('p').textContent='Aplica el procedimiento de sensor, proceso o configuración; rearma y prueba un ciclo nuevo.';
  $('caseArchive').before(root);
  $('sequenceStartBtn').textContent='▶ Marcha / reanudar';$('sequenceStopBtn').textContent='■ Paro operativo';$('sequenceInspectBtn').textContent='Inspección del proceso';
  const rearm=document.createElement('button');rearm.id='sequenceRearmBtn';rearm.className='btn';rearm.type='button';rearm.textContent='Rearmar secuencia';$('sequenceStopBtn').after(rearm);
  root.querySelector('.ctrl+p.note').textContent='Una caja por ciclo. E0 comprueba disponibilidad; E3 supervisa la recepción. Una alarma retira las órdenes. Rearmar no corrige por sí mismo la causa.';
  const tabs=root.querySelector('.tabs'),tab=document.createElement('button');tab.type='button';tab.dataset.sequenceTab='sequenceGrafcet';tab.setAttribute('role','tab');tab.setAttribute('aria-selected','false');tab.textContent='Secuencia PLC / GRAFCET';tabs.children[0].after(tab);
  const panel=document.createElement('div');panel.id='sequenceGrafcet';panel.className='tabview';panel.setAttribute('role','tabpanel');$('sequenceScheme').after(panel);
  $('sequenceDiagnose').innerHTML='<h3>¿Qué impide completar la secuencia?</h3><p>Identifica la etapa y la condición pendiente; contrasta posición física, señales y temporización.</p><div class="diagnoses"><label class="choice"><input type="radio" name="sequenceCause" value="stuck"><span>Salida PNP de B3 bloqueada en alto: indica presencia sin caja</span></label><label class="choice"><input type="radio" name="sequenceCause" value="jam"><span>Obstrucción mecánica que retiene la caja durante la transferencia</span></label><label class="choice"><input type="radio" name="sequenceCause" value="timing"><span>PT de supervisión demasiado corto para el recorrido normal</span></label></div><div class="ctrl"><button id="sequenceAnswerBtn" class="btn primary">Comprobar diagnóstico</button></div><div id="sequenceFeedback" aria-live="polite"></div><div id="sequenceRepairActions" class="hidden"><button id="sequenceRepairBtn" class="btn alt">Aplicar intervención simulada</button></div>';
  $('sequencePlc').querySelector('h3').textContent='PLC online · secuencia y permisos';$('sequencePlc').querySelector('p').textContent='Compara etapa, entradas, órdenes y movimiento. El GRAFCET y el TON proceden del mismo motor que mueve la caja.';
  const alarm=document.createElement('p');alarm.id='sequencePlcAlarm';$('sequencePlcStep').after(alarm);
  root.querySelector('aside h2:last-of-type')?.setAttribute('data-preserved','true');
 }
 function render(s,v){const set=(id,t)=>$(id).textContent=t,bit=(id,b)=>{set(id,b?'1':'0');$(id).className=b?'on':'off'};
  for(const n of [1,2]){set('sequenceMotor'+n,v['motor'+n]?'EN MARCHA':'PARADO');$('sequenceMotor'+n).className=v['motor'+n]?'good':'bad'}
  set('sequenceInputB2',`Sensor: ${+!!v.b2detect} · I0.3: ${+!!v.b2input}`);set('sequenceInputB3',`Sensor: ${+!!v.b3detect} · I0.4: ${+!!v.b3input}`);
  set('sequenceSequence',v.phase);set('sequenceCount',`${s.count} transferencias confirmadas`);set('sequenceAlarm',v.alarm||'');bit('sequencePlcB2',v.b2input);bit('sequencePlcB3',v.b3input);bit('sequencePlcQ1',v.q1);bit('sequencePlcQ2',v.q2);
  set('sequencePlcStep','Etapa activa: '+v.stage+' · '+v.phase);set('sequencePlcAlarm',v.alarm?'Alarma: '+v.alarm:'Sin alarma activa');set('sequencePlcCount','Transferencias registradas: '+s.count);
  const t=v.timer;set('sequencePlcTimer',`TON · IN=${+t.IN} · PT=${t.PT.toFixed(2)} s · ET=${t.ET.toFixed(2)} s · Q=${+t.Q}`);
  $('sequenceStartBtn').disabled=s.isolated; $('sequenceLoadBtn').disabled=s.isolated||v.motor||Boolean(v.alarm)||v.rearmRequired||!['E0','E4'].includes(v.stage);$('sequenceRearmBtn').disabled=s.isolated||!(v.rearmRequired||v.alarm);
 }
 return {create,render};
})();
Miki.SequenceUI.create();
