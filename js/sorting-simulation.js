Miki.SortingSimulation=(()=>{
 const E=Miki.Sorting,I=Miki.SortingIntervention;
 function init(s){s.sorting=E.create(s.fault);s.repairCount=0;s.box=true}
 function flush(s){for(const e of s.sorting.events.splice(0))Miki.Simulation.log(s,e.text,'sequence');s.count=s.sorting.count}
 function snapshot(s){const v=E.snapshot(s.sorting),local=s.isolated?0:24;return {...v,sequence:v.stage,nodes:{source:24,local,b4brown:local,b4black:v.b4?24:0,b5brown:local,b5black:v.b5?24:0,a0brown:local,a0black:v.a0?24:0,a1brown:local,a1black:v.a1?24:0,q1:v.q1?24:0,q2:v.q2?24:0,y1:v.y1?24:0,zero:0}}}
 function action(s,type,value){const m=s.sorting,p=I.state(s);if(type==='tick')E.advance(m,Number(value));else if(type==='start'&&!p.locked){if(E.start(m)&&s.repaired)s.postRepairStart=true}else if(type==='stop')E.stop(m);else if(type==='load')E.load(m,value);else if(type==='inspect'||type==='observe'){E.inspect(m);s.checks.add('inspect');s.checks.add('grafcet')}else if(type==='rearm'){m.recoveryPermission=(!m.alarm&&!p.entered||s.repaired)&&!p.locked;E.rearm(m)}else if(type==='isolate'){if(I.next(s).kind==='isolate')I.perform(s,'isolate');else if(I.next(s).kind==='restore')I.perform(s,'restore')}else if(type==='airCut'){m.pneumatic.airOpen=false;m.pneumatic.vent=true}flush(s)}
 function onRepair(s){s.repairCount=s.count;s.sorting.fault=null;if(s.fault==='pressure')s.sorting.pneumatic.setpoint=I.state(s).setting;s.sorting.rearmRequired=true;s.postRepairStart=false;flush(s)}
 function verify(s){const v=snapshot(s);return !!(s.repaired&&I.state(s).authorizedRepair&&!I.state(s).locked&&!s.isolated&&s.postRepairStart&&!v.alarm&&v.stage==='E7'&&v.a0&&v.cylinder<=.001&&v.diverted>0&&s.count>s.repairCount)}
 Miki.Simulation.registerModel('sorting',{init,snapshot,action,onRepair,verify});return {snapshot,action};
})();
