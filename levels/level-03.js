Miki.levels[3]={
 id:3,model:'transfer',title:'La caja no llega a la siguiente estación',installation:'Transferencia CV-01 → CV-02',
 objective:'Relacionar secuencia, señales PLC y movimiento real para restaurar una transferencia automática.',
 knowledge:['Secuencia automática','Supervisión temporal','Orden y movimiento real','Dos transportadores coordinados'],
 inputs:['I0.3','I0.4'],outputs:['Q0.0','Q0.1'],components:['QS3','B2','B3','W2','K1','K2','F4','M1','M2'],
 points:{source:'Fuente +24 V · antes de QS3',local:'Barra local +24 V · después de QS3',b2brown:'B2 BN · alimentación +',b2black:'B2 BK · salida PNP',b2input:'PLC I0.3 · después de W2',b3brown:'B3 BN · alimentación +',b3black:'B3 BK · salida PNP',b3input:'PLC I0.4 · recepción',q1:'Q0.0 / K1:A1',q2:'Q0.1 / K2:A1',f4in:'F4:1 · entrada',f4out:'F4:2 / K2:13',k2out:'K2:14 · salida',m2:'M2 +',zero:'0 V / M · común'},
 isolation:{label:'QS3 aísla todos los circuitos de campo de ambas cintas y sensores. La fuente y CPU PLC aguas arriba conservan alimentación.'},
 verification:'Una nueva Marcha ejecuta la transferencia: B3 activa I0.4 y se registra una caja, una sola vez.',
 faults:{
  bsignal:{name:'W2 abierto: la llegada de B2 no alcanza I0.3',explanation:'B2 tiene alimentación y detecta la caja, pero el conductor W2 de su salida BK está abierto. El PLC no recibe la condición de llegada y no ordena Q0.1.',evidence:'Caja frente a B2: BN = 24 V, BK = 24 V e I0.3 = 0 V. Q0.1 permanece sin orden.',repair:'Restaurar W2 en la zona aislada y bloqueada; comprobar los dos extremos de señal antes de intervenir.'},
  kcoil:{name:'Bobina K2 interrumpida',explanation:'B2 activa I0.3 y el PLC ordena Q0.1. La bobina K2 recibe 24 V pero no actúa; su contacto NO queda abierto y M2 no gira.',evidence:'Durante transferencia: Q0.1 = 24 V, F4:2 = 24 V y K2:14 / M2 = 0 V.',repair:'Sustituir K2 con ambas cintas aisladas; comprobar mando y ambos lados de su contacto de potencia.'},
  fpower:{name:'Protección F4 abierta',explanation:'El PLC ordena Q0.1 y K2 actúa, pero F4 interrumpe la rama de potencia. M2 no recibe alimentación y B3 no confirma recepción.',evidence:'Durante transferencia: Q0.1 = 24 V, F4:1 = 24 V y F4:2 / M2 = 0 V.',repair:'Investigar la causa de apertura y reponer F4 adecuada en la rama aislada, comprobando sus dos lados.'}
 }
};
