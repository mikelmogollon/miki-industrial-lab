/* Símbolos didácticos IEC en reposo; no revelan el fallo activo. */
Miki.Schematics=(()=>{
 function point(level,key,x,y,label){return `<g role="button" tabindex="0" data-point="${key}" aria-label="${label}"><title>${label}</title><circle class="hitArea" cx="${x}" cy="${y}" r="26"/><circle class="terminal" cx="${x}" cy="${y}" r="7"/><text x="${x+12}" y="${y-10}">${label}</text></g>`}
 function wire(d){return `<path class="wire" d="${d}"/>`}
 function text(x,y,s){return `<text x="${x}" y="${y}">${s}</text>`}
 function rect(x,y,w,h){return `<rect class="symbol" x="${x}" y="${y}" width="${w}" height="${h}"/>`}
 function svg(level){let s='';if(level===1){
 s+=text(20,30,'MANDO · 24 V CC / PLC (común M = 0 V)')+text(20,60,'+24 V');
 s+=wire('M30 85H140 M180 85H385 M30 175H140 M180 175H385');
 s+=wire('M140 70V100 M180 70V100 M140 85L180 75');s+=text(125,55,'S0 · NC 11–12');
 s+=wire('M140 160V190 M180 160V190 M140 165L175 145');s+=text(125,145,'S1 · NO 13–14');
 s+=rect(385,60,120,145)+text(400,83,'I0.0')+text(400,174,'I0.1')+text(438,125,'PLC');
 s+=point(1,'s0in',75,85,'S0:11')+point(1,'s0out',280,85,'S0:12 / I0.0')+point(1,'local',30,175,'+24 V local')+point(1,'start',280,175,'S1:14 / I0.1');
 s+=text(20,240,'SALIDA Q0.0 · BOBINA K1');
 s+=wire('M30 285H220 M300 285H505V330H30');s+=rect(220,265,80,40)+text(232,290,'K1')+text(220,255,'A1')+text(300,255,'A2');s+=point(1,'q',120,285,'Q0.0 / A1')+point(1,'zero',400,330,'0 V / M');
 s+=text(20,380,'POTENCIA · MOTOR CC / K1 vinculado a su bobina')+text(20,410,'+24 V');
 s+=wire('M30 440H120 M160 440H245 M285 440H380 M440 440H505V495H30');
 s+=rect(120,425,40,30)+wire('M125 440H155')+text(120,405,'F2');
 s+=wire('M245 425V455 M285 425V455 M245 430L280 410')+text(230,405,'K1 · NO');
 s+='<circle class="symbol" cx="410" cy="440" r="30"/>'+text(395,445,'M1');
 s+=point(1,'f2in',75,440,'F2:1')+point(1,'f2out',195,440,'F2:2')+point(1,'motor',345,440,'M1 +')+text(375,490,'M1 − / 0 V');
 }else{
 s+=text(20,30,'B1 · FOTOELÉCTRICO PNP NO · 24 V CC')+text(25,65,'+24 V');
 s+=wire('M35 95H140 M180 95H290V145 M290 245V420H35 M370 195H425 M465 195H525V260');
 s+=rect(140,80,40,30)+wire('M145 95H175')+text(137,60,'F3');
 s+=rect(210,145,160,100)+text(228,173,'B1 · PNP NO')+text(228,196,'BN + / BU −')+text(228,221,'BK · salida');
 s+=wire('M425 195H465')+text(423,160,'W1');s+=rect(455,260,95,95)+text(467,285,'PLC I0.2')+text(470,315,'carga de')+text(470,336,'entrada');s+=wire('M505 355V420H290');
 s+=point(2,'fuseIn',80,95,'F3:1')+point(2,'brown',235,95,'F3:2 / BN')+point(2,'black',395,195,'BK')+point(2,'terminal',525,240,'I0.2')+point(2,'zero',110,420,'BU / 0 V');
 s+=text(20,465,'F3 protege la rama de alimentación de B1.');
 s+=text(20,492,'BN marrón · BU azul · BK negro · W1 cable de señal');
 s+=text(20,520,'Motor: Q0.0 → K1 → M1 (se detiene al abrir QS2)');
 }
 return `<svg class="circuit" viewBox="0 0 580 645" role="group" aria-label="Esquema eléctrico interactivo del nivel ${level}">${text(20,18,"FUENTE · 24 V CC")}${wire("M30 45H205 M245 45H480 M205 32V58 M245 32V58")}<path class="wire" data-isolator d="M205 45H245"/>${point(level,level===1?"supply":"source",70,45,"Fuente +24 V")}${text(205,20,"QS"+level)}${point(level,"local",330,45,"Barra local")}${text(20,82,"Las ramas inferiores se alimentan de la barra tras QS"+level)}<g transform="translate(0 95)">${s}</g></svg>`}

return {svg};
})();
