Miki.levels[2]={id:2,model:"sensorPNP",title:'La cinta no detecta las cajas',installation:'Cinta CV-01 + B1 PNP NO',objective:'Comparar alimentación, detección y continuidad de señal hasta I0.2.',knowledge:['Sensor PNP NO','Alimentación protegida','Cableado de señal','Contador por flanco'],
 inputs:['I0.2'],outputs:['Q0.0'],components:['QS2','F3','B1','W1','K1','M1'],
 points:{source:'Fuente +24 V · antes de QS2',local:'Barra +24 V · después de QS2',fuseIn:'F3:1 · entrada',fuseOut:'F3:2 · salida',brown:'B1 BN · marrón +',black:'B1 BK · negro salida',terminal:'PLC I0.2 · después de W1',zero:'B1 BU · azul / 0 V'},
 isolation:{label:'QS2 · alimentación local de CV-01 y B1. Se detienen cinta y sensor; la fuente aguas arriba y CPU PLC siguen alimentadas.'},
 faults:{
 power:{name:'Protección F3 abierta',explanation:'F3 interrumpe la alimentación de B1. El motor tiene una rama independiente y funciona antes de aislar.',evidence:'Con alimentación: F3:1 = 24 V y B1 BN = 0 V.',repair:'Investigar por qué abrió F3 y reponer la protección adecuada en la rama aislada.'},
 align:{name:'Sensor B1 desalineado',explanation:'El sensor recibe 24 V pero el haz no apunta a la caja. Su salida PNP permanece inactiva.',evidence:'Con caja presente: B1 BN = 24 V y B1 BK = 0 V; inspección del soporte.',repair:'Ajustar la posición de B1 con cinta y sensor aislados; probar una nueva detección.'},
 wire:{name:'Cable de señal W1 abierto',explanation:'B1 detecta y su salida negra entrega 24 V, pero la señal no llega a I0.2.',evidence:'Con caja presente: B1 BK = 24 V y PLC I0.2 = 0 V.',repair:'Comprobar continuidad y restaurar W1 en la instalación aislada; verificar el contador.'}}
};
