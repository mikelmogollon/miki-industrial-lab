Miki.levels[1]={id:1,model:"motor24",title:'La cinta no arranca',installation:'Cinta transportadora CV-01',objective:'Localizar la interrupción del mando o de la potencia y verificar el arranque.',knowledge:['Contacto NC','Enclavamiento PLC','Bobina y contacto','Tensión entre bornes'],
 inputs:['I0.0','I0.1'],outputs:['Q0.0'],components:['QS1','S0','S1','F2','K1','M1'],
 points:{supply:'Fuente +24 V · antes de QS1',local:'Barra +24 V · después de QS1',s0in:'S0:11 · entrada',s0out:'S0:12 / I0.0',start:'S1:14 / I0.1',q:'Q0.0 / K1:A1',f2in:'F2:1 · entrada',f2out:'F2:2 · salida',k1out:'K1:14 · salida',motor:'M1 +',zero:'0 V / M'},
 isolation:{label:'QS1 · mando y potencia de CV-01. Fuente aguas arriba y CPU PLC independientes permanecen alimentadas.'},
 faults:{
 stop:{name:'Contacto S0 abierto',explanation:'El contacto NC no cierra en reposo. I0.0 permanece a 0 y el PLC bloquea la marcha.',evidence:'Con alimentación: S0:11 = 24 V y S0:12 = 0 V.',repair:'Sustituir S0 en la parte aislada; restablecer alimentación y comprobar Marcha y Paro.'},
 fuse:{name:'Fusible F2 abierto',explanation:'La orden PLC y K1 funcionan; F2 interrumpe la alimentación de potencia.',evidence:'Con orden de marcha: F2:1 = 24 V y F2:2 = 0 V.',repair:'Investigar la causa de apertura y sustituir F2 por la protección adecuada en la parte aislada.'},
 coil:{name:'Bobina K1 interrumpida',explanation:'La bobina recibe 24 V pero no se excita. Su contacto NO permanece abierto.',evidence:'Con Marcha: Q0.0 = 24 V, F2:2 = 24 V y salida K1 / M1 = 0 V.',repair:'Comprobar y sustituir K1 en la parte aislada; verificar el arranque posterior.'}}
};
