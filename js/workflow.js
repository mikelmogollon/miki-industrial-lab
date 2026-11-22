/* Guía compartida. Solo las pruebas del modelo autorizan cada etapa. */
Miki.Workflow=(()=>{
 const views=new Map(),$=id=>document.getElementById(id);
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
 function button(text,fn,cls='btn'){const b=el('button',text,cls);b.type='button';b.onclick=fn;return b}
 const steps={
  referenceBefore:[1,'Comprobar instrumento antes','±24 V entre la fuente conocida y 0 V.','Comprobar que el multímetro simulado responde ante una referencia conocida.','Aislar la instalación'],
  isolate:[2,'Aislar la instalación','Campo local sin alimentación; fuente y CPU siguen aguas arriba.','Desconectar la alimentación de todos los circuitos de la zona que se va a intervenir.','Colocar bloqueo didáctico'],
  lock:[3,'Colocar bloqueo didáctico','Reposición impedida durante la intervención.','Representar la prevención del restablecimiento accidental. El simulador bloquea realmente esa acción.','Verificar la zona'],
  motion:[4,'Verificar la zona','Cinta detenida y alimentación local comprobada.','El ajuste mecánico exige comprobar por separado el movimiento y la alimentación.','Completar las medidas de zona'],
  point:[4,'Verificar la zona','0 V respecto del común en cada conductor indicado.','Un cero previo por avería no acredita aislamiento. Hay que comprobar los conductores afectados después de aislar y bloquear.','Comprobar instrumento después'],
  referenceAfter:[5,'Comprobar instrumento después','±24 V en la misma referencia conocida.','Comprobar que el instrumento sigue respondiendo tras las medidas de la zona.','Aplicar reparación'],
  repair:[6,'Aplicar reparación','Reparación aplicada con la preparación completa.','La reparación solo se habilita si las comprobaciones reales del modelo están acreditadas.','Retirar bloqueo y restablecer'],
  release:[7,'Preparar restablecimiento','Bloqueo retirado después de reparar.','Preparar una reposición deliberada, una vez terminada la intervención.','Restablecer alimentación'],
  restore:[7,'Restablecer alimentación','Campo alimentado; todavía sin recompensa.','Reponer la alimentación no demuestra por sí mismo que la reparación funcione.','Verificar funcionamiento'],
  verify:[8,'Verificar funcionamiento','Respuesta funcional correcta y registrada.','Una nueva prueba de funcionamiento confirma el resultado; solo entonces se concede XP.','Cerrar la incidencia']
 };
 function mount(level,root,cb){const i=Miki.UI.ids[level],panel=el('section',null,'workflow-panel'),stepper=el('ol',null,'incident-phases');stepper.setAttribute('aria-label','Fases de la incidencia');for(const t of ['Investigar','Diagnosticar','Intervenir','Completar'])stepper.append(el('li',t));root.querySelector('.tabs').before(stepper);root.querySelector('.tabs').after(panel);panel.id='workflow'+level;panel.setAttribute('aria-label','Guía de resolución de incidencia');
  const head=el('div',null,'workflow-heading'),title=el('h3'),status=el('span',null,'workflow-stage');head.append(title,status);
  const current=el('strong',null,'workflow-current'),progress=el('progress',null,'workflow-progress');progress.max=8;progress.setAttribute('aria-label','Progreso de la intervención');
  const task=el('p',null,'workflow-task');task.setAttribute('aria-live','polite');const expected=el('p',null,'workflow-expected'),next=el('p',null,'workflow-next');
  const why=el('details',null,'workflow-why'),whyText=el('p');why.append(el('summary','¿Por qué hago esto?'),whyText);
  const completed=el('details',null,'workflow-completed'),trail=el('ul');completed.append(el('summary','Comprobaciones completadas'),trail);
  const actions=el('div',null,'workflow-actions'),more=el('details',null,'workflow-scope');more.append(el('summary','Zona, fuentes y criterios de esta intervención'));const scope=el('p'),reason=el('p');more.append(scope,reason);
  const hint=el('p',null,'workflow-hint'),notice=el('p','Simulación didáctica: no certifica seguridad real ni sustituye formación, procedimientos, instrumentos o autorización. El paro PLC no es una parada de emergencia.','workflow-notice');
  const repair=$(i.repair);repair.textContent='Aplicar reparación simulada';repair.classList.add('workflow-repair');const parking=el('div',null,'hidden');parking.append(repair);panel.append(head,current,progress,task,expected,actions,why,next,completed,parking,more,hint,notice);
  const meterNote=el('div',null,'workflow-meter-note');$(i.meter).prepend(meterNote);const view={level,root,cb,panel,stepper,title,status,current,progress,task,expected,next,why,whyText,completed,trail,actions,parking,more,scope,reason,hint,repair,meterNote,s:null,tool:i.scheme};views.set(level,view);return view;
 }
 function chooseMeasure(v,point){Miki.UI.tab(v.level,Miki.UI.ids[v.level].scheme);Miki.DiagnosticDesk.locate(v.level,point)}
 function primary(v,step){const l=v.level,i=Miki.UI.ids[l],labels={investigate:'Formular diagnóstico',begin:'Preparar intervención',referenceBefore:'Seleccionar referencia de 24 V',referenceAfter:'Volver a referencia de 24 V',point:'Localizar punto indicado',isolate:'Aislar con QS'+l,restore:'Restablecer alimentación local',lock:'Colocar bloqueo didáctico',motion:'Confirmar cinta detenida',repair:'Aplicar reparación simulada',release:'Retirar bloqueo didáctico',verify:l===1?'Dar Marcha y verificar':l===2?'Presentar caja y verificar':'Iniciar transferencia y verificar',done:'Continuar al siguiente caso'};
  if(l===4)Object.assign(labels,{stop:'Parar ambas cintas',inspectZone:'Inspeccionar zona aislada',reviewCapture:'Revisar captura de alarma',inspectProcess:'Inspeccionar proceso detenido',configurePT:'Validar parámetro PT',rearm:'Rearmar secuencia'});
  if(l===4&&step.kind==='configurePT'){const form=el('div',null,'workflow-parameter'),label=el('label','PT de supervisión'),select=el('select');select.id='procedurePT4';label.htmlFor=select.id;select.setAttribute('aria-label','PT de supervisión');select.append(new Option('Elige un tiempo validado',''));for(const value of [4,5,6])select.append(new Option(value+' s',String(value)));const b=button(labels.configurePT,()=>v.cb.sequenceProcedure(l,'configurePT',select.value),'btn primary workflow-primary');b.dataset.action='configurePT';form.append(label,select,b);return form}
  const b=button(labels[step.kind],()=>{
   if(step.kind==='done'){v.cb.next(l);return}
   if(step.kind==='investigate'){Miki.UI.tab(l,i.diagnose);return}
   if(['referenceBefore','referenceAfter','point'].includes(step.kind)){chooseMeasure(v,step.point);return}
   if(['isolate','restore'].includes(step.kind)){v.cb.isolate(l);return}
   if(l===4&&['stop','inspectZone','reviewCapture','inspectProcess','rearm'].includes(step.kind)){v.cb.sequenceProcedure(l,step.kind);return}
   if(step.kind==='repair'){v.repair.click();return}
   if(step.kind==='verify'){$(i.verify).click();return}
   v.cb.procedureAction(l,step.kind);
  },'btn primary workflow-primary');b.dataset.action=step.kind;if(step.point)b.dataset.requiredPoint=step.point;return b;
 }
 function render(v,s){if(s.level===5)return Miki.SortingUI.workflow(v,s);const focus=v.actions.contains(document.activeElement)?'main':v.meterNote.contains(document.activeElement)?'meter':null;v.s=s;const I=Miki.Intervention,p=I.state(s),step=I.next(s),i=Miki.UI.ids[s.level],cfg=I.plan(s),diagnose=v.tool===i.diagnose;
  const viewState=Miki.Simulation.snapshot(s),signature=JSON.stringify([s.id,s.done,s.repaired,s.diagnosed,s.isolated,p.entered,p.before,p.locked,p.after,p.motion,p.epoch,[...p.checks],p.hint,v.tool,viewState.sequence,viewState.motor,s.level===4?step.kind:null,s.level===4?step.point:null,s.level===4?s.parameterPT:null]);if(v.signature===signature)return;v.signature=signature;Miki.DiagnosticDesk?.stepChanged(s.level,step);
  const phase=s.done?3:s.repaired?3:p.entered?2:s.diagnosed||diagnose?1:0;[...v.stepper.children].forEach((e,n)=>{e.classList.toggle('is-current',n===phase);e.classList.toggle('is-finished',n<phase);if(n===phase)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current')});
  v.title.textContent=!s.diagnosed?'Investiga y contrasta tus hipótesis':s.done?'Incidencia completada':'Intervención técnica — '+cfg.title;v.status.textContent=['Investigar','Diagnosticar','Intervenir','Completar'][phase];
  const detail=(s.level===4?Miki.SequenceIntervention.describe(s,step):null)||steps[step.kind],show=p.entered&&!s.done;for(const node of [v.current,v.progress,v.expected,v.next,v.why])node.classList.toggle('hidden',!show||!detail);
  if(detail){const total=detail[5]||8;v.current.textContent=`Paso actual: ${detail[0]} de ${total} — ${detail[1]}`;v.progress.max=total;v.progress.value=s.done?total:detail[0]-1;v.expected.textContent='Resultado esperado: '+(step.kind==='verify'&&s.level===3?'B3 activa I0.4 y aumenta el contador una sola vez.':detail[2]);v.next.textContent='Después: '+detail[4];v.whyText.textContent=detail[3]}
  v.task.textContent=step.text+(step.kind==='motion'?' Estado observado: cinta '+(Miki.Simulation.snapshot(s).motor?'en marcha.':'detenida.'):'');
  if(step.kind==='verify'&&s.level===3&&['approach','transfer'].includes(Miki.Simulation.snapshot(s).sequence))v.task.textContent='Transferencia en curso. Observa la caja y espera la confirmación de B3; todavía no se concede recompensa.';
  if(step.kind==='verify'&&s.level===4&&viewState.ticking)v.task.textContent='Nuevo ciclo en curso: observa etapas y TON hasta que B3 confirme la recepción sin alarma.';
  v.parking.append(v.repair);v.actions.replaceChildren();if(step.kind==='repair'){v.repair.classList.remove('hidden');v.actions.append(v.repair)}else v.actions.append(primary(v,step));
  if(!s.done&&step.kind!=='investigate'&&v.tool!==i.scheme)v.actions.append(button('Ir a las mediciones',()=>Miki.UI.tab(s.level,i.scheme)));
  const done=s.level===4?Miki.SequenceIntervention.completed(s):[['Instrumento antes',p.before],['Aislamiento',s.isolated],['Bloqueo',p.locked],['Zona completa',cfg.points.every(k=>p.checks.has(k))&&(!cfg.motion||p.motion)],['Instrumento después',p.after]].filter(x=>x[1]);v.trail.replaceChildren(...done.map(([label])=>el('li','✓ '+label)));v.completed.classList.toggle('hidden',!p.entered||!done.length||s.repaired);
  v.more.classList.toggle('hidden',!s.diagnosed||s.done);if(s.diagnosed){v.scope.textContent=cfg.zone+' '+(cfg.type==='configuration'?'Se revisa el parámetro con parada y bloqueo lógico del rearranque; no se abren conductores.':Miki.levels[s.level].isolation.label);v.reason.textContent=cfg.reason+' Fuentes: '+cfg.sources.join('; ')+'.';let restart=v.more.querySelector('button');if(!restart){restart=button('Reiniciar preparación',()=>v.cb.procedureAction(s.level,'restart'));v.more.append(restart)}restart.classList.toggle('hidden',!p.entered||s.repaired)}
  v.hint.textContent=p.hint;v.hint.classList.toggle('hidden',!p.hint);v.meterNote.replaceChildren();v.meterNote.classList.toggle('hidden',!p.entered||s.done);if(p.entered&&!s.done){v.meterNote.append(el('strong',step.kind==='point'?Miki.levels[s.level].points[step.point]+' · respecto a 0 V':['referenceBefore','referenceAfter'].includes(step.kind)?'Referencia conocida · se esperan ±24 V':detail?detail[1]:'Intervención'));if(['point','referenceBefore','referenceAfter'].includes(step.kind))v.meterNote.append(primary(v,step));else v.meterNote.append(button('Ver paso actual',()=>{v.title.tabIndex=-1;v.title.focus();v.panel.scrollIntoView({block:'nearest',behavior:'smooth'})}))}
  if(focus)(focus==='meter'?v.meterNote:v.actions).querySelector('button')?.focus({preventScroll:true});
 }
 function toolChanged(level,name){const view=views.get(level);if(view){view.tool=name;if(view.s)render(view,view.s)}}
 return {mount,render,toolChanged};
})();
