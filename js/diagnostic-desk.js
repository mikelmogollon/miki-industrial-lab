/* Ergonomía compartida. No escribe en el estado eléctrico, las puntas o el progreso. */
Miki.DiagnosticDesk=(()=>{
 const views=new Map();
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n};
 function button(label,action){const b=el('button','btn',label);b.type='button';b.onclick=action;return b}
 function capture(bench){const v=[...views.values()].find(v=>v.bench===bench);if(!v)return null;const r=v.svg.getBoundingClientRect();return {v,y:(v.scroll.scrollTop+v.scroll.clientHeight/2)/r.height,x:(v.scroll.scrollLeft+v.scroll.clientWidth/2)/r.width}}
 function restore(anchor){if(!anchor)return;requestAnimationFrame(()=>{const {v}=anchor,r=v.svg.getBoundingClientRect();v.scroll.scrollTop=anchor.y*r.height-v.scroll.clientHeight/2;v.scroll.scrollLeft=anchor.x*r.width-v.scroll.clientWidth/2})}
 function reveal(scroll,target,center=false){const a=scroll.getBoundingClientRect(),b=target.getBoundingClientRect();let y=scroll.scrollTop,x=scroll.scrollLeft;
  if(center||b.top<a.top+16||b.bottom>a.bottom-16)y+=b.top-a.top-(center?scroll.clientHeight/2-b.height/2:16);
  if(b.left<a.left+16||b.right>a.right-16)x+=b.left-a.left-scroll.clientWidth/2+b.width/2;
  scroll.scrollTo({top:y,left:x,behavior:'instant'});
 }
 function mount(level,c){const {bench,scheme,meter,root,workflow,plantView}=c;bench.classList.add('diagnostic-desk');bench.setAttribute('role','group');bench.setAttribute('aria-label','Mesa de diagnóstico del nivel '+level);
  const card=bench.closest('.card');card.classList.add('diagnostic-card');root.append(card);
  const workspace=el('div','desk-workspace'),tools=el('aside','desk-tools');tools.setAttribute('aria-label','Intervención, multímetro y miniplanta');
  scheme.setAttribute('role','tabpanel');scheme.setAttribute('aria-labelledby','tab-'+bench.id);root.querySelector('['+Miki.UI.ids[level].attr+'="'+scheme.id+'"]').setAttribute('aria-controls',scheme.id);meter.setAttribute('role','group');meter.setAttribute('aria-label','Multímetro virtual');
  workspace.append(scheme);for(const tab of root.querySelectorAll('['+Miki.UI.ids[level].attr+']')){const id=tab.getAttribute(Miki.UI.ids[level].attr);if(id!==Miki.UI.ids[level].scheme){const panel=document.getElementById(id);if(panel&&panel!==meter)workspace.append(panel)}}
  tools.append(workflow.panel,meter);const mini=el('details','desk-mini'),miniTitle=el('summary',null,'Miniplanta en directo');mini.append(miniTitle,plantView.dock);tools.append(mini);
  bench.replaceChildren(workspace,tools);
  const mobile=el('nav','desk-mobile-nav');mobile.setAttribute('aria-label','Secciones de la mesa');mobile.append(button('Ir al esquema',()=>workspace.scrollIntoView({block:'start'})),button('Ir a herramientas',()=>tools.scrollIntoView({block:'start'})));bench.prepend(mobile);
  const secondary=el('details','desk-procedure-details');secondary.append(el('summary',null,'Ayuda y comprobaciones'));
  for(const n of workflow.panel.querySelectorAll('.workflow-why,.workflow-completed,.workflow-scope,.workflow-notice'))secondary.append(n);workflow.panel.append(secondary);
  const meterDetails=el('details','desk-meter-details');meterDetails.append(el('summary',null,'Detalles de la medida'));
  const intro=meter.querySelector(':scope>p');if(intro)meterDetails.append(intro);for(const n of meter.querySelectorAll('.measurement .note,:scope>.insight,:scope>.liveMeasure'))meterDetails.append(n);meter.append(meterDetails);
  const redundant=meter.querySelector('label');redundant?.classList.add('desk-sr-only');
  const relation=scheme.querySelector('.schematic-relations'),relationDetails=el('details','desk-relation-details');relationDetails.append(el('summary',null,'Relaciones y localización'));for(const n of [...relation.children])if(n.tagName!=='SELECT')relationDetails.append(n);relation.append(relationDetails);
  const scroll=scheme.querySelector('.circuit-scroll'),svg=scroll.querySelector('svg');scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Esquema desplazable del nivel '+level);
  const zones=el('nav','desk-zones');zones.setAttribute('aria-label','Zonas eléctricas');
  const headers=[...svg.querySelectorAll('.zone-title')];const zoneButtons=[];
  for(const [n,h]of headers.entries()){const label=level===2?['Alimentación','Sensor B1','Señal PLC'][n]:['Alimentación','Mando y entradas','Salidas y bobinas','Potencia'][n];const b=button(label,()=>{const a=scroll.getBoundingClientRect(),r=h.getBoundingClientRect();scroll.scrollTo({top:scroll.scrollTop+r.top-a.top-12,left:0,behavior:'instant'});updateZone()});zones.append(b);zoneButtons.push(b)}scroll.before(zones);
  const located=el('p','desk-location-note');located.setAttribute('aria-live','polite');located.classList.add('hidden');zones.after(located);
  const v={level,bench,workspace,tools,scheme,meter,scroll,svg,located,headers,zoneButtons};views.set(level,v);
  const scale=scheme.querySelector('.benchTools select'),values=[100,125,150,200],controls=el('div','desk-zoom');scale.before(controls);controls.append(button('−',()=>changeZoom(-1)),scale,button('+',()=>changeZoom(1)),button('100 %',()=>setZoom(100)));
  controls.children[0].setAttribute('aria-label','Reducir zoom');controls.children[2].setAttribute('aria-label','Aumentar zoom');controls.children[3].setAttribute('aria-label','Restablecer zoom al 100 %');
  function setZoom(value){const a=capture(bench);scale.value=value;svg.style.width=value+'%';restore(a);updateZone()}
  function changeZoom(delta){setZoom(values[Math.max(0,Math.min(values.length-1,values.indexOf(Number(scale.value))+delta))])}scale.onchange=()=>setZoom(Number(scale.value));
  function updateZone(){const top=scroll.getBoundingClientRect().top;let active=0;headers.forEach((h,n)=>{if(h.getBoundingClientRect().top<=top+50)active=n});zoneButtons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===active)))}v.updateZone=updateZone;scroll.addEventListener('scroll',updateZone,{passive:true});updateZone();
  // El botón explícito abre la mesa en el documento; medir o seleccionar no mueve la página.
  const open=button('Abrir mesa de diagnóstico',()=>{bench.scrollIntoView({block:'start',behavior:'instant'});scroll.focus({preventScroll:true})});open.classList.add('desk-open');card.querySelector('.cardhead').append(open);
 }
 function locate(level,key){const v=views.get(level);if(!v)return;const points=[...v.svg.querySelectorAll('[data-point="'+key+'"]')];const point=points.find(p=>{const r=p.getBoundingClientRect(),a=v.scroll.getBoundingClientRect();return r.top>=a.top&&r.bottom<=a.bottom})||points[0];if(!point)return;
  v.svg.querySelectorAll('.desk-target').forEach(n=>n.classList.remove('desk-target'));point.classList.add('desk-target');reveal(v.scroll,point,true);v.located.dataset.locatedPoint=key;v.located.textContent='Localizado: '+Miki.levels[level].points[key]+'. Coloca las puntas y pulsa Medir tensión.';v.located.classList.remove('hidden');
  const measure=document.getElementById(Miki.UI.ids[level].measure);if(matchMedia('(min-width:1100px)').matches)reveal(v.tools,measure);measure.focus({preventScroll:true});
 }
 function stepChanged(level,step){const v=views.get(level);if(v&&v.located.dataset.locatedPoint&&v.located.dataset.locatedPoint!==step.point){v.svg.querySelectorAll('.desk-target').forEach(n=>n.classList.remove('desk-target'));v.located.classList.add('hidden');delete v.located.dataset.locatedPoint}}
 function beforeExpand(bench){const a=capture(bench);if(a){const {v}=a;v.page={x:scrollX,y:scrollY};v.placeholder=el('div','desk-placeholder');v.placeholder.style.height=bench.getBoundingClientRect().height+'px';bench.before(v.placeholder)}return a}
 function afterCollapse(bench,a){if(a){const {v}=a;v.placeholder?.remove();v.placeholder=null;if(v.page)window.scrollTo({left:v.page.x,top:v.page.y,behavior:'instant'})}restore(a)}
 return {mount,locate,stepChanged,capture,restore,beforeExpand,afterCollapse,refresh:level=>requestAnimationFrame(()=>views.get(level)?.updateZone())};
})();
