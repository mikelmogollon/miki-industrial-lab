/* Intervención sobre dos energías; ninguna autorización procede de la presentación. */
Miki.SortingIntervention=(()=>{
 const points={coil:['y1','local'],feedback:['a1brown','a1black'],pressure:[]};
 const state=s=>s.sortProcedure||(s.sortProcedure={entered:false,locked:false,before:false,after:false,checks:new Set(),audit:[],hint:'',authorizedRepair:false,stopped:false,gauge:false,secured:false,reviewed:false,setting:null});
 const plan=s=>({title:s.fault==='pressure'?'Regulación neumática FR5':s.fault==='coil'?'Bobina Y1':'Sensor a1',type:s.fault==='pressure'?'pneumatic':'electrical',zone:'Estación de clasificación · A1 / EV1 / FR5',points:points[s.fault],reason:'Controlar energía eléctrica y aire almacenado según la intervención. Descarga no equivale a asegurar mecánicamente el actuador.',sources:['24 V CC de campo QS5','Aire 6 bar por V5 y FR5']});
 function next(s){const p=state(s),m=s.sorting,a=m.pneumatic,elec=s.fault!=='pressure';let kind='investigate',point;
  if(s.done)kind='done';else if(!s.diagnosed)kind='investigate';else if(!p.entered)kind='begin';else if(s.repaired){kind=p.locked?'release':s.isolated?'restore':!a.airOpen?'airRestore':a.pressure<4?'waitPressure':a.secured?'unsecure':m.rearmRequired||m.alarm||m.stage!=='E0'&&m.stage!=='E7'?'rearm':'verify'}
  else if(!p.stopped)kind='stop';else if(elec&&!p.before){kind='referenceBefore';point='source'}else if(elec&&!s.isolated)kind='isolate';else if(!p.locked)kind='lock';else if(a.airOpen)kind='airIsolate';else if(!a.vent||a.pressure>.05)kind='vent';else if(!p.gauge)kind='gauge';else if(!a.secured)kind='secure';else if(elec&&plan(s).points.some(x=>!p.checks.has(x))){kind='point';point=plan(s).points.find(x=>!p.checks.has(x))}else if(elec&&!p.after){kind='referenceAfter';point='source'}else if(!p.reviewed)kind='review';else if(!elec&&!p.setting)kind='regulate';else kind='repair';
  return {kind,point,text:labels[kind]||kind};
 }
 const labels={investigate:'Contrasta orden, presión, posición física y señal del PLC.',begin:'Preparar intervención',stop:'Parar y observar retorno por muelle',referenceBefore:'Comprobar instrumento antes con fuente de 24 V',isolate:'Aislar campo eléctrico con QS5',lock:'Bloquear rearranque y reposición',airIsolate:'Cerrar alimentación neumática V5',vent:'Descargar con D5 y esperar a 0 bar',gauge:'Leer manómetro y comprobar zona a 0 bar',secure:'Asegurar mecánicamente A1 y comprobar inmovilidad',point:'Verificar el conductor indicado respecto de 0 V',referenceAfter:'Comprobar instrumento después con fuente conocida',review:'Inspeccionar componente y condiciones de la zona',regulate:'Validar ajuste de FR5: 5 o 6 bar',repair:'Aplicar intervención simulada',release:'Retirar bloqueo didáctico',restore:'Restablecer campo eléctrico',airRestore:'Cerrar descarga y reponer aire controladamente',waitPressure:'Esperar y comprobar recuperación de presión',unsecure:'Retirar aseguramiento mecánico de A1',rearm:'Rearmar y preparar caja alta nueva',verify:'Dar Marcha y verificar clasificación nueva',done:'Continuar al siguiente caso'};
 function perform(s,kind,value){const p=state(s),m=s.sorting,a=m.pneumatic;if(next(s).kind!==kind){p.hint='Completa primero: '+next(s).text;return false}let ok=true;
  if(kind==='begin')p.entered=true;
  else if(kind==='stop'){Miki.Sorting.stop(m);p.stopped=true}
  else if(kind==='isolate'){s.isolated=true;m.isolated=true;s.isolationEpoch++;}
  else if(kind==='lock')p.locked=true;
  else if(kind==='airIsolate')a.airOpen=false;
  else if(kind==='vent')a.vent=true;
  else if(kind==='gauge'){ok=!a.airOpen&&a.vent&&a.pressure<=.05;if(ok)p.gauge=true}
  else if(kind==='secure'){ok=!m.run&&a.pressure<=.05;if(ok){a.secured=true;p.secured=true}}
  else if(kind==='review'){ok=a.secured&&a.pressure<=.05;if(ok){p.reviewed=true;Miki.Simulation.log(s,s.fault==='pressure'?'Inspección aislada de FR5: consigna mecánica 1,2 bar; comprobar ajuste frente a la ventana didáctica 5–6 bar.':s.fault==='coil'?'Inspección simulada de la bobina aislada: devanado abierto, sin accionamiento magnético.':'Inspección simulada del sensor a1: no conmuta su salida al alcanzar el fin de carrera.')}}
  else if(kind==='regulate'){ok=[5,6].includes(Number(value));if(ok)p.setting=Number(value)}
  else if(kind==='release')p.locked=false;
  else if(kind==='restore'){s.isolated=false;m.isolated=false}
  else if(kind==='airRestore'){a.vent=false;a.airOpen=true}
  else if(kind==='waitPressure')ok=a.pressure>=4;
  else if(kind==='unsecure')a.secured=false;
  else if(kind==='rearm'){m.recoveryPermission=true;ok=Miki.Sorting.rearm(m)}
  else ok=false;
  p.hint=ok?'':'La condición real aún no se cumple. Revisa presión, posición o valor seleccionado.';if(ok){p.audit.push({action:kind});Miki.Simulation.log(s,labels[kind],'procedure')}return ok;
 }
 function record(s,m){const p=state(s);if(!p.entered||s.repaired)return;const k=next(s);if(['referenceBefore','referenceAfter'].includes(k.kind)&&((m.red==='source'&&m.black==='zero')||(m.black==='source'&&m.red==='zero'))&&Math.abs(m.volts)===24){p[k.kind==='referenceBefore'?'before':'after']=true;p.hint='';}if(k.kind==='point'&&s.isolated&&p.locked&&s.sorting.pneumatic.secured&&s.sorting.pneumatic.pressure<=.05&&m.volts===0){const point=m.red==='zero'?m.black:m.black==='zero'?m.red:null;if(point===k.point)p.checks.add(point)}}
 function canRepair(s){const p=state(s),a=s.sorting.pneumatic;return next(s).kind==='repair'&&p.locked&&!a.airOpen&&a.vent&&a.pressure<=.05&&a.secured&&(!plan(s).points.length||s.isolated&&p.before&&p.after&&plan(s).points.every(x=>p.checks.has(x)))}
 function markRepair(s){if(!canRepair(s))return false;state(s).authorizedRepair=true;return true}
 function summary(s){const p=state(s);return {...plan(s),proof:p.authorizedRepair?{points:[...p.checks],description:'Parada, bloqueo, aislamiento neumático, descarga y manómetro, aseguramiento mecánico, inspección específica'+(s.fault==='pressure'?'; ajuste validado de FR5.':'; instrumento antes/después y conductores aislados comprobados.')}:null,audit:p.audit.slice()}}
 return {state,plan,next,perform,record,canRepair,markRepair,summary,labels};
})();
(()=>{const base=Miki.Intervention,I=Miki.SortingIntervention,out={...base};for(const name of ['state','plan','next','record','canRepair','markRepair','summary'])out[name]=(s,...args)=>s.level===5?I[name](s,...args):base[name](s,...args);for(const [name,kind]of Object.entries({begin:'begin',lock:'lock',release:'release'}))out[name]=(s,...args)=>s.level===5?I.perform(s,kind):base[name](s,...args);out.onIsolation=(s,...args)=>s.level===5?undefined:base.onIsolation(s,...args);Miki.Intervention=out})();
