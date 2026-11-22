/* Núcleo compartido: transición, registro y evaluación del mismo grafo que consume la UI. */
Miki.SequenceRuntime={
 enter(m,to,id){const from=m.stage;m.stage=to;m.elapsed=0;m.lastTransition=id;const e={time:m.time,text:`${from} → ${to} · ${id}`,stage:to,from,to,transition:id};m.events.push(e);m.history.push(e);if(m.history.length>100)m.history.shift()},
 transitions(m,defs){return defs.map(t=>({...t,condition:!!t.condition,enabled:m.stage===t.from&&!!t.condition,lastFired:m.lastTransition===t.id}))},
 advance(m,dt,program){if(!Number.isFinite(dt)||dt<=0)return;let remaining=Math.min(dt,120);while(remaining>1e-9){const step=Math.min(.01,remaining);program.physical(m,step);m.time+=step;if(m.run){m.elapsed+=step;const next=program.graph(m).find(t=>t.from===m.stage&&t.condition);if(next){program.beforeEnter?.(m,next.to);this.enter(m,next.to,next.id);program.enter?.(m,next.to)}}remaining-=step}}
};
