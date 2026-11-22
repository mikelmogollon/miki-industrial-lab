const {test}=require('node:test'),assert=require('node:assert/strict');
for(const file of ['js/storage','levels/level-01','levels/level-02','levels/level-03','levels/level-04','js/intervention','js/sequence-intervention','js/simulation','js/sequence-engine','js/sequence-simulation','js/measurements','js/curriculum','js/learning','js/progression'])require('../'+file+'.js');
const S=Miki.Simulation,I=Miki.Intervention,X=Miki.SequenceIntervention,M=Miki.Measurements,P=Miki.Progression;
function investigate(s){S.action(s,'start');if(s.fault!=='stuck')S.action(s,'tick',9);s.checks.add('grafcet');s.checks.add('timer');S.action(s,'inspect');if(s.fault==='stuck'){M.take(s,'b3brown','zero');M.take(s,'b3black','zero')}}
function prepare(s,PT=5){s.diagnosed=true;assert.equal(I.begin(s),true);
 if(s.fault==='stuck'){M.take(s,'source','zero');S.action(s,'isolate');assert.equal(I.lock(s),true);M.take(s,'b3brown','zero');M.take(s,'b3black','zero');M.take(s,'source','zero')}
 else{assert.equal(X.perform(s,'stop'),true);if(s.fault==='jam')S.action(s,'isolate');assert.equal(I.lock(s),true);if(s.fault==='jam'){assert.equal(I.confirmStopped(s),true);assert.equal(X.perform(s,'inspectZone'),true)}else{assert.equal(X.perform(s,'reviewCapture'),true);assert.equal(X.perform(s,'inspectProcess'),true);assert.equal(X.perform(s,'configurePT',PT),true)}}
 assert.equal(I.canRepair(s),true);
}
function finish(s){assert.equal(S.repair(s),true);assert.equal(S.verify(s),false);assert.equal(I.next(s).kind,'release');assert.equal(I.release(s),true);if(s.isolated)S.action(s,'isolate');assert.equal(I.next(s).kind,'rearm');assert.equal(X.perform(s,'rearm'),true);assert.equal(S.verify(s),false);S.action(s,'start');S.action(s,'tick',8);assert.equal(S.verify(s),true)}
for(const fault of ['stuck','jam','timing'])test(`Nivel4 ${fault}: investigación y preparación propia, reparación, rearme, nueva transferencia y XP`,()=>{
 const s=S.create(4,fault);investigate(s);assert.equal(M.relevant(s),true);prepare(s);finish(s);const d=Miki.Storage.fresh(),record=P.complete(s,d);assert.equal(record.score,100);assert.equal(record.xp,100);assert.equal(s.count,1);assert.equal(S.snapshot(s).alarm,'');assert.ok(I.summary(s).proof.description);assert.equal(P.complete(s,d),null);
});
test('Sensor B3 conserva el instrumento antes/después y comprobación de sus dos conductores',()=>{
 const s=S.create(4,'stuck');s.diagnosed=true;I.begin(s);S.action(s,'isolate');assert.equal(I.lock(s),false);assert.equal(S.repair(s),false);S.action(s,'isolate');M.take(s,'source','zero');S.action(s,'isolate');I.lock(s);M.take(s,'b3brown','b3black');assert.equal(I.state(s).checks.size,0);assert.equal(I.canRepair(s),false);M.take(s,'zero','b3brown');M.take(s,'zero','b3black');assert.equal(I.canRepair(s),false);M.take(s,'zero','source');assert.equal(I.canRepair(s),true);
});
test('Atasco mecánico no se acredita con ceros eléctricos ni sin caja retenida',()=>{
 const s=S.create(4,'jam');s.diagnosed=true;I.begin(s);X.perform(s,'stop');S.action(s,'isolate');I.lock(s);I.confirmStopped(s);for(const p of ['local','b3brown','b3black','m2'])M.take(s,p,'zero');assert.equal(I.state(s).before,false);assert.equal(I.state(s).after,false);assert.equal(X.perform(s,'inspectZone'),false);assert.equal(S.repair(s),false);
});
test('Intervención mecánica completa no exige usar el multímetro',()=>{
 const s=S.create(4,'jam');investigate(s);prepare(s);assert.equal(s.measurements.length,0);finish(s);const proof=I.summary(s).proof;assert.equal(proof.type,'mechanical');assert.deepEqual(proof.points,[]);assert.equal(proof.before,false);assert.equal(proof.after,false);assert.equal(proof.motion,true);assert.match(proof.description,/retirada/);
});
test('Configurar exige captura real, inspección y bloqueo lógico; no aislamiento ni 0 V',()=>{
 const s=S.create(4,'timing');s.diagnosed=true;I.begin(s);X.perform(s,'stop');I.lock(s);assert.equal(X.perform(s,'reviewCapture'),false);assert.equal(X.perform(s,'configurePT',5),false);assert.equal(S.repair(s),false);I.restart(s);S.action(s,'start');S.action(s,'tick',8);X.perform(s,'stop');I.lock(s);assert.equal(X.perform(s,'reviewCapture'),true);assert.equal(X.perform(s,'configurePT',5),false);X.perform(s,'inspectProcess');assert.equal(X.perform(s,'configurePT',5),true);assert.equal(s.isolated,false);assert.equal(s.measurements.length,0);assert.equal(S.snapshot(s).timer.PT,1.2);assert.equal(S.repair(s),true);assert.equal(S.snapshot(s).timer.PT,5);assert.equal(I.summary(s).proof.type,'configuration');
});
test('Intervalo de PT finito y protegido frente a valores arbitrarios o propuesta alterada',()=>{
 const s=S.create(4,'timing');investigate(s);s.diagnosed=true;I.begin(s);X.perform(s,'stop');I.lock(s);X.perform(s,'reviewCapture');X.perform(s,'inspectProcess');for(const value of ['',0,-1,1.2,3.9,6.1,7,Infinity,NaN])assert.equal(X.perform(s,'configurePT',value),false,String(value));assert.equal(s.parameterPT,null);assert.equal(X.perform(s,'configurePT',4),true);s.parameterPT=100;assert.equal(I.canRepair(s),false);s.parameterPT=4;assert.equal(I.canRepair(s),true);
});
test('Bloqueo de configuración impide Marcha y no se libera antes de aplicar',()=>{
 const s=S.create(4,'timing');investigate(s);s.diagnosed=true;I.begin(s);X.perform(s,'stop');I.lock(s);S.action(s,'start');S.action(s,'tick',2);assert.equal(S.snapshot(s).motor,false);assert.equal(I.release(s),false);assert.equal(X.perform(s,'rearm'),false);I.restart(s);assert.equal(I.state(s).locked,false);
});
test('Procedimiento solo no regala investigación relevante y las evidencias no confunden atasco con PT',()=>{
 for(const fault of ['jam','timing']){const s=S.create(4,fault);S.action(s,'start');S.action(s,'tick',9);prepare(s);finish(s);assert.equal(M.relevant(s),false);assert.equal(P.complete(s,Miki.Storage.fresh()).score,80)}
});
test('Las descripciones y comprobaciones terminadas no afirman instrumento en problemas no eléctricos',()=>{
 const s=S.create(4,'jam');investigate(s);prepare(s);const labels=X.completed(s).map(([x])=>x).join(' ');assert.doesNotMatch(labels,/Instrumento/);assert.equal(X.describe(s,{kind:'inspectZone'})[0],5);assert.equal(I.plan(s).type,'mechanical');assert.equal(I.plan(S.create(4,'timing')).type,'configuration');
});
