/* Plano didáctico continuo. Nodos y cálculos pertenecen al modelo existente. */
Miki.Schematics=(()=>{
 const text=(x,y,label,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${label}</text>`;
 const wire=(d,rel='')=>`<path class="wire" d="${d}"${rel?` data-relation="${rel}"`:''}/>`;
 const dot=(x,y)=>`<circle class="junction" cx="${x}" cy="${y}" r="3.5"/>`;
 function point(level,key,x,y,label,dx=12,dy=-16){return `<g role="button" tabindex="0" data-point="${key}" data-circuit-label="${label} · ${Miki.levels[level].points[key]}" aria-label="Medir ${label}"><title>${label} · ${Miki.levels[level].points[key]}</title><circle class="hitArea" cx="${x}" cy="${y}" r="26"/><circle class="terminal" cx="${x}" cy="${y}" r="7"/>${text(x+dx,y+dy,label,'point-label')}</g>`}
 function part(id,name,x,y,w,h,body,rel=id){return `<g role="button" tabindex="0" data-component="${id}" data-relation="${rel}" aria-label="Relacionar ${name}"><title>Seleccionar relaciones: ${name}</title><rect class="relation-outline" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>${body}</g>`}
 const zone=(n,title,y)=>`<path class="zone-rule" d="M100 ${y-23}H660"/>${text(100,y,`${n} · ${title}`,'zone-title')}`;
 function contact(x,y,nc,name,terminals,push=false){return `${wire(`M${x} ${y}L${nc?x+80:x+73} ${nc?y:y-30} M${x+80} ${y-12}V${y+12}`)}<circle class="symbol pivot" cx="${x}" cy="${y}" r="3"/>${push?`<path class="actuator" d="M${x+40} ${y-25}V${y-50} M${x+25} ${y-50}H${x+55}"/><path class="mechanical" d="M${x+40} ${y-25}V${y-7}"/>`:''}${text(x-10,y-12,terminals[0],'terminal-reference')}${text(x+84,y-12,terminals[1],'terminal-reference')}${text(x+5,y+36,name,'component-reference')}`}
 function supply(level,end){const q='QS'+level;return zone('01','ALIMENTACIÓN GENERAL',28)+text(100,55,'Fuente ideal de 24 V CC','secondary')+
 wire(`M70 60V95H200 M240 95H340V195H70V${end} M690 60V${end} M70 75H550V100 M600 190V215H690`)+dot(70,75)+dot(690,215)+
 `<circle class="symbol" cx="70" cy="60" r="4"/><circle class="symbol" cx="690" cy="60" r="4"/>`+
 part(q,q+' · seccionamiento local',185,78,80,88,`<circle class="symbol" cx="200" cy="95" r="3"/><circle class="symbol" cx="240" cy="95" r="3"/><path class="wire" data-isolator d="M200 95H240"/><path class="mechanical" d="M220 104V126"/><path class="actuator" d="M209 126H231"/>${text(205,153,q,'component-reference')}`)+
 part('PLC','CPU PLC · alimentación independiente',500,95,160,103,`<rect class="symbol module" x="510" y="100" width="140" height="90"/>${text(523,128,'PLC · CPU','component-reference')}${text(523,152,'Alimentación','secondary')}${text(523,173,'antes de '+q,'secondary')}`)+
 point(level,level===1?'supply':'source',130,95,'Fuente +24 V',-37,30)+point(level,'local',340,155,'L+ local',15,5)+point(level,'zero',690,95,'0 V / M',-80,-23)+
 text(100,239,'L+ local alimenta las ramas inferiores; CPU y fuente siguen aguas arriba.','secondary');}
 function motorLevel(){let s=supply(1,1040);
  s+=zone('02','MANDO Y ENTRADAS PLC',260)+wire('M70 335H240 M320 335H560','S0')+wire('M70 440H240 M320 440H560','S1')+dot(70,335)+dot(70,440);
  s+=part('S0','S0 · paro NC',224,278,126,104,contact(240,335,true,'S0 · NC',['11','12'],true));
  s+=part('S1','S1 · marcha NO',224,383,126,104,contact(240,440,false,'S1 · NO',['13','14'],true));
  s+='<rect class="symbol module" x="560" y="300" width="100" height="200"/>'+text(577,380,'PLC','component-reference')+text(577,402,'Entradas','secondary')+wire('M660 480H690')+dot(690,480)+text(610,490,'M','terminal-reference');
  s+=part('S0','entrada I0.0 asociada a S0',565,308,90,42,text(578,333,'I0.0','component-reference'))+part('S1','entrada I0.1 asociada a S1',565,415,90,42,text(578,440,'I0.1','component-reference'));
  s+=point(1,'s0in',160,335,'S0:11',-35,-18)+point(1,'s0out',420,335,'S0:12 / I0.0',-30,-18)+point(1,'start',420,440,'S1:14 / I0.1',-30,-18);
  s+=zone('03','SALIDA PLC Y BOBINA',560)+wire('M70 585H200V600 M200 710V745H690')+dot(70,585)+dot(690,745);
  s+=part('PLC','PLC · salida Q0.0',120,593,168,132,`<rect class="symbol module" x="130" y="600" width="150" height="110"/>${text(145,622,'PLC · salida','secondary')}${text(160,655,'Q0.0','component-reference')}${text(170,694,'L+ local','secondary')}${text(207,724,'M','terminal-reference')}`);
  s+=wire('M280 655H450 M545 655H690','K1')+dot(690,655);
  s+=part('K1','bobina K1 · contacto en zona 04',430,598,139,119,`<rect class="symbol coil" x="450" y="630" width="95" height="50"/>${text(497,662,'K1','component-reference','middle')}${text(433,620,'A1','terminal-reference')}${text(548,620,'A2','terminal-reference')}${text(450,708,'Contacto en zona 04','secondary')}`);
  s+=point(1,'q',355,655,'Q0.0 / A1',-35,-18)+point(1,'zero',625,655,'A2 / 0 V',-30,-18);
  s+=zone('04','POTENCIA · MOTOR 24 V CC',815)+wire('M70 920H200 M255 920H365','F2')+wire('M445 920H545','F2 K1 M1')+wire('M615 920H690','M1 F2')+dot(70,920)+dot(690,920);
  s+=part('F2','F2 · protección de la rama de M1',185,864,88,93,`<rect class="symbol fuse" x="200" y="905" width="55" height="30"/>${wire('M200 920H255')}${text(207,892,'F2','component-reference')}`);
  s+=part('K1','contacto NO K1 · bobina en zona 03',350,864,117,137,contact(365,920,false,'K1 · NO',['13','14'])+text(365,985,'Bobina en zona 03','secondary'));
  s+=part('M1','M1 · motor de corriente continua',535,870,103,151,`<circle class="symbol" cx="580" cy="920" r="35"/>${text(580,927,'M','motor-symbol','middle')}${wire('M565 935H595 M565 941H573 M578 941H586 M591 941H595')}${text(565,985,'M1','component-reference')}${text(550,1010,'24 V CC','secondary')}`,'F2 M1');
  s+=point(1,'f2in',145,920,'F2:1',-30,-18)+point(1,'f2out',300,920,'F2:2',-25,-18)+point(1,'k1out',490,920,'K1:14',-25,-38)+point(1,'motor',545,920,'M1 +',6,-38);
  s+='<path class="zone-rule" d="M100 1055H660"/>'+text(100,1082,'Contactos representados en reposo: S0 NC; S1 y K1 NO.','secondary')+text(100,1107,'A1/A2 y 13/14 pertenecen al mismo relé didáctico K1.','secondary')+text(100,1132,'Entradas y cargas referidas a 0 V; no es un plano completo de cableado real.','secondary');return s;
 }
 function sensorLevel(){let s=supply(2,742);
  s+='<path class="zone-rule" d="M100 250H660 M390 252V520 M390 615V742"/>'+text(100,270,'02 · SENSOR B1','zone-title')+text(100,294,'Alimentación y detección','secondary')+text(410,270,'03 · SEÑAL AL PLC','zone-title')+text(410,294,'PNP · W1 · I0.2','secondary');
  s+=wire('M70 310H200V320 M200 365V450','F3 B1')+dot(70,310);
  s+=part('F3','F3 · alimentación protegida de B1',171,314,119,78,`<rect class="symbol fuse" x="185" y="320" width="30" height="45"/>${wire('M200 320V365')}${text(236,350,'F3','component-reference')}`,'F3 B1');
  s+=part('B1','B1 · sensor fotoeléctrico con salida PNP',130,444,199,220,`<rect class="symbol sensor" x="140" y="450" width="180" height="205"/>${text(155,485,'B1','component-reference')}${text(155,510,'PNP · NO','secondary')}${wire('M200 450V465H280V520 M240 530V575 M240 565L280 590H320 M200 635V655 M180 635H220')}<path class="pnp-emitter" d="M280 520L240 545" marker-end="url(#sch-arrow-2)"/><path class="optical" d="M155 548H205 M155 568H205" marker-end="url(#sch-arrow-2)"/>${text(280,580,'BK','terminal-reference')}`);
  s+=wire('M320 590H565','B1 W1')+part('W1','W1 · conductor BK hasta I0.2',397,549,92,66,text(425,570,'W1','component-reference'),'B1 W1');
  s+=part('PLC','I0.2 · entrada receptora del PLC',555,514,116,177,`<rect class="symbol module" x="565" y="520" width="100" height="160"/>${text(582,549,'PLC','component-reference')}${text(582,580,'I0.2','component-reference')}${wire('M565 590H615V615 M615 641V680')}<rect class="symbol load" x="607" y="615" width="16" height="26"/>${text(627,669,'M','terminal-reference')}`,'B1 W1 PLC');
  s+=wire('M200 655V735H690 M615 680V735','B1')+dot(615,735)+dot(690,735);
  s+=point(2,'fuseIn',200,310,'F3:1',50,5)+point(2,'fuseOut',200,380,'F3:2',22,5)+point(2,'brown',200,440,'BN +',22,-3)+point(2,'black',365,590,'BK',-19,-18)+point(2,'terminal',520,590,'I0.2',-25,-18)+point(2,'zero',200,695,'BU / 0 V',22,5)+point(2,'zero',690,735,'M / 0 V',-80,25);
  s+='<path class="zone-rule" d="M100 780H660"/>'+text(100,805,'BN marrón: +24 V · BU azul: 0 V · BK negro: salida PNP.','secondary')+text(100,830,'PNP: BK entrega positivo al detectar; I0.2 es una entrada receptora.','secondary')+text(100,855,'Motor operativo: Q0.0 gobierna K1/M1; abrir QS2 detiene la rama local.','secondary')+text(100,880,'B1 es un bloque funcional simplificado, no su circuito electrónico completo.','secondary');return s;
 }
 function svg(level){return `<svg class="circuit technical-diagram" data-schematic-level="${level}" viewBox="0 0 760 ${level===1?1155:905}" role="group" aria-label="Esquema eléctrico continuo del nivel ${level}"><defs><marker id="sch-arrow-${level}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L6 3L0 6Z" fill="#40566a"/></marker></defs>${level===1?motorLevel():sensorLevel()}</svg>`}
 function updateIsolation(container,isolated){container.querySelector('[data-isolator]').setAttribute('d',isolated?'M200 95L233 75':'M200 95H240')}
 const relations={
  K1:['K1 · bobina y contacto NO','A1/A2 (zona 03) y 13/14 (zona 04) son el mismo relé. Resaltar no significa que la bobina esté energizada.'],
  S0:['S0 · paro NC e I0.0','El contacto NC alimenta I0.0 en reposo. Su selección identifica el recorrido de mando, sin comprobar si el contacto está sano.'],
  S1:['S1 · marcha NO e I0.1','El contacto de marcha está abierto en reposo. Su señal llega a I0.1 al pulsar Marcha.'],
  F2:['F2 · rama de potencia de M1','F2 protege la alimentación que pasa por el contacto K1 y llega a M1. El azul indica relación, no continuidad real.'],
  M1:['M1 · motor de 24 V CC','M1 recibe alimentación a través de F2 y del contacto K1. Su retorno es el 0 V común.'],
  B1:['B1 · alimentación, salida e I0.2','BN recibe positivo por F3; BU vuelve a 0 V; BK llega a I0.2 por W1. El símbolo PNP representa la función de salida.'],
  F3:['F3 · alimentación del sensor B1','F3 está en la rama de B1. La protección no alimenta el motor ni revela aquí su estado interno.'],
  W1:['W1 · enlace BK–I0.2','Es el conductor de señal entre B1 y el PLC. Los dos extremos pueden medirse por separado.'],
  PLC:['PLC · control y referencia común','La CPU sigue alimentada aguas arriba. Los circuitos de campo toman alimentación local y sus entradas se refieren a 0 V.'],
  QS1:['QS1 · aislamiento local','Aísla mando y potencia locales. La fuente y CPU anteriores al seccionamiento permanecen alimentadas.'],
  QS2:['QS2 · aislamiento local','Aísla las ramas locales de cinta y sensor. La fuente y CPU anteriores al seccionamiento permanecen alimentadas.']
 };
 function attach(scheme,root,level){const box=document.createElement('section');box.className='schematic-relations';box.setAttribute('aria-label','Relaciones entre componentes');const select=document.createElement('select');select.setAttribute('aria-label','Componente relacionado del esquema');select.append(new Option('Relacionar un componente',''));for(const id of level===1?['K1','S0','S1','F2','M1','PLC','QS1']:['B1','F3','W1','PLC','QS2'])select.append(new Option(relations[id][0],id));
  const title=document.createElement('strong'),desc=document.createElement('p'),buttons=document.createElement('div'),locate=document.createElement('button'),clear=document.createElement('button');locate.textContent='Localizar en la planta';clear.textContent='Quitar resaltado';for(const b of [locate,clear]){b.type='button';b.className='btn'}buttons.append(locate,clear);box.append(select,title,desc,buttons);scheme.querySelector('.circuit-scroll').before(box);box.setAttribute('aria-live','polite');let selected='';
  function choose(id){selected=id;select.value=id;scheme.querySelectorAll('[data-relation]').forEach(e=>e.classList.toggle('is-related',e.dataset.relation.split(' ').includes(id)&&!!id));root.querySelectorAll('.schematic-physical-link').forEach(e=>e.classList.remove('schematic-physical-link'));title.textContent=id?relations[id][0]:'Relaciones en azul · puntas roja y negra';desc.textContent=id?relations[id][1]:'Pulsa un símbolo o elige un componente. Los bornes ámbar siguen colocando las puntas del multímetro.';const physical=id&&root.querySelector('.plant [data-component="'+(id==='S1'?'S0':id)+'"]');locate.classList.toggle('hidden',!physical);clear.classList.toggle('hidden',!id)}
  select.onchange=()=>choose(select.value);clear.onclick=()=>choose('');locate.onclick=()=>{const target=root.querySelector('.plant [data-component="'+(selected==='S1'?'S0':selected)+'"]');if(!target)return;Miki.UI.closeZoom();target.classList.add('schematic-physical-link');target.dispatchEvent(new MouseEvent('click',{bubbles:true}));target.focus({preventScroll:true});target.scrollIntoView({block:'center',behavior:'smooth'})};
  function clicked(e){if(e.target.closest('[data-point]'))return;const part=e.target.closest('[data-component]');if(part&&scheme.contains(part))choose(part.dataset.component)}scheme.addEventListener('click',clicked);scheme.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-component]')){e.preventDefault();clicked(e)}});choose('');
 }
 return {svg,updateIsolation,attach};
})();
