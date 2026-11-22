const {test}=require('node:test'),assert=require('node:assert/strict');
for(const p of ['../js/storage','../levels/level-01','../levels/level-02','../levels/level-03','../js/intervention','../js/simulation','../js/transfer-simulation','../js/measurements','../js/curriculum','../js/learning','../js/progression'])require(p+'.js');
const S=Miki.Simulation,I=Miki.Intervention,M=Miki.Measurements,P=Miki.Progression;
const advance=(s,seconds)=>S.action(s,'tick',seconds);
function investigate(s){S.action(s,'start');advance(s,3);for(const point of Object.keys(Miki.levels[3].points))M.take(s,point,'zero')}
function prepare(s){s.diagnosed=true;I.begin(s);M.take(s,'source','zero');S.action(s,'isolate');assert.equal(I.lock(s),true);for(const point of I.plan(s).points)M.take(s,point,'zero');M.take(s,'zero','source');assert.equal(S.canRepair(s),true)}
function finish(s){assert.equal(S.repair(s),true);assert.equal(S.verify(s),false);assert.equal(I.release(s),true);S.action(s,'isolate');assert.equal(S.verify(s),false);advance(s,20);assert.equal(S.verify(s),false);S.action(s,'start');advance(s,7);assert.equal(S.verify(s),true)}

const signatures={bsignal:{b2brown:24,b2black:24,b2input:0,q2:0,f4out:24,m2:0},kcoil:{b2black:24,b2input:24,q2:24,f4out:24,k2out:0,m2:0},fpower:{b2input:24,q2:24,f4in:24,f4out:0,m2:0}};
for(const [fault,want] of Object.entries(signatures))test(`Nivel 3 ${fault}: avería real, protocolo completo, transferencia y XP`,()=>{
 const s=S.create(3,fault),d=Miki.Storage.fresh();investigate(s);const v=S.snapshot(s);for(const [point,volts] of Object.entries(want))assert.equal(v.nodes[point],volts,point);
 assert.equal(v.motor2,false);assert.equal(v.b3input,false);assert.equal(s.count,0);assert.equal(P.complete(s,d),null);assert.equal(M.relevant(s),true);
 prepare(s);const isolated=S.snapshot(s);for(const [point,volts] of Object.entries(isolated.nodes))assert.equal(volts,point==='source'?24:0,point);
 finish(s);assert.equal(S.snapshot(s).sequence,'confirmed');assert.equal(s.count,1);const record=P.complete(s,d);assert.equal(record.xp,100);assert.equal(record.score,100);assert.match(record.verification,/B3/);assert.ok(I.summary(s).proof);assert.equal(P.complete(s,d),null);
 advance(s,30);assert.equal(s.count,1);
});

test('Supervisión detiene las órdenes y repetir Marcha permite contrastar señales',()=>{
 for(const fault of Object.keys(signatures)){const s=S.create(3,fault);S.action(s,'start');advance(s,20);let v=S.snapshot(s);assert.equal(v.sequence,'timeout');assert.ok(v.alarm);assert.equal(v.q1,false);assert.equal(v.q2,false);assert.equal(v.motor,false);assert.equal(s.count,0);S.action(s,'start');v=S.snapshot(s);assert.equal(v.alarm,'');assert.equal(v.q1,true);if(fault!=='bsignal')assert.equal(v.q2,true)}
});

test('Paro, aislamiento y bloqueo impiden desplazamiento y reposición incompatibles',()=>{
 const s=S.create(3,'kcoil');S.action(s,'start');advance(s,1);const position=S.snapshot(s).position;S.action(s,'stop');advance(s,5);assert.equal(S.snapshot(s).position,position);assert.equal(S.snapshot(s).motor,false);
 prepare(s);const epoch=s.isolationEpoch;S.action(s,'start');advance(s,5);assert.equal(S.snapshot(s).motor,false);S.action(s,'isolate');assert.equal(s.isolated,true);assert.equal(s.isolationEpoch,epoch);assert.equal(I.release(s),false);
});

test('Proceso sano mueve ambas cintas en puente, libera CV-01 y cuenta una vez por caja',()=>{
 const s=S.create(3,'kcoil');s.repaired=true;S.action(s,'start');advance(s,3);let v=S.snapshot(s);assert.equal(v.sequence,'transfer');assert.equal(v.motor1,true);assert.equal(v.motor2,true);advance(s,1);v=S.snapshot(s);assert.equal(v.motor1,false);assert.equal(v.motor2,true);advance(s,4);v=S.snapshot(s);assert.equal(v.b3input,true);assert.equal(v.motor,false);assert.equal(s.count,1);
 S.action(s,'start');advance(s,8);assert.equal(s.count,1);S.action(s,'load');assert.equal(S.snapshot(s).sequence,'ready');advance(s,8);assert.equal(s.count,1);S.action(s,'start');advance(s,8);assert.equal(s.count,2);assert.equal(S.verify(s),false,'un proceso sano no sustituye autorización de intervención');
});

test('Tamaño de tick no salta detecciones; negativos no mueven y cuenta igual',()=>{
 const a=S.create(3,'bsignal'),b=S.create(3,'bsignal');a.repaired=b.repaired=true;S.action(a,'start');S.action(b,'start');advance(a,-1);assert.equal(S.snapshot(a).position,.08);advance(a,8);for(let n=0;n<40;n++)advance(b,.2);assert.equal(S.snapshot(a).sequence,S.snapshot(b).sequence);assert.equal(a.count,1);assert.equal(b.count,1);assert.equal(S.snapshot(a).position,S.snapshot(b).position);
});

test('Preparar no acredita pasos mediante seleccionar puntos o ceros arbitrarios',()=>{
 const s=S.create(3,'bsignal');s.diagnosed=true;I.begin(s);M.take(s,'b2black','b2input');S.action(s,'isolate');assert.equal(I.lock(s),false);assert.equal(S.repair(s),false);assert.equal(P.complete(s,Miki.Storage.fresh()),null);
});

test('Nuevo nivel respeta dos casos distintos, práctica aislada y datos anteriores',()=>{
 const d=Miki.Storage.fresh();d.completed=['1:stop','1:fuse','2:power'];d.best={'1:stop':80,'1:fuse':100,'2:power':80};d.records=[{id:'previous',level:2,fault:'power',name:'Registro anterior'}];d.badges=['Insignia anterior'];
 assert.equal(Miki.Learning.access(d,3).unlocked,false);d.completed.push('2:align');d.best['2:align']=100;assert.equal(Miki.Learning.access(d,3).unlocked,true);
 const before=JSON.stringify(d),j=Miki.Learning.session(d);j.change('practice');assert.equal(j.access(3).unlocked,true);j.markPractice(3,'kcoil');assert.equal(JSON.stringify(d),before);
 const map=new Map(),store={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};Miki.Storage.save(store,d);const recovered=Miki.Storage.load(store).data;assert.equal(recovered.records[0].id,'previous');assert.deepEqual(recovered.best,d.best);assert.deepEqual(recovered.badges,d.badges);
});

test('Repetir una avería no genera XP ilimitados; dominio exige tres causas',()=>{
 const d=Miki.Storage.fresh();for(const fault of ['bsignal','bsignal','kcoil','fpower']){const s=S.create(3,fault);investigate(s);prepare(s);finish(s);const r=P.complete(s,d);assert.equal(r.xp,fault==='bsignal'&&d.records.length===2?0:100)}
 assert.equal(P.xp(d),300);assert.equal(d.completed.length,3);assert.equal(Miki.Learning.mastery(d,3),true);assert.ok(d.badges.includes('Especialista en transferencia automática'));
});

test('Tras cerrar se puede probar otra caja sin duplicar recompensa o historial',()=>{
 const s=S.create(3,'kcoil'),d=Miki.Storage.fresh();investigate(s);prepare(s);finish(s);P.complete(s,d);
 const saved=JSON.stringify(d);S.action(s,'load');S.action(s,'start');advance(s,8);
 assert.equal(s.count,2);assert.equal(S.snapshot(s).sequence,'confirmed');assert.equal(P.complete(s,d),null);assert.equal(JSON.stringify(d),saved);
});
