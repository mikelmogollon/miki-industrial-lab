/* Identidad inmutable ≠ posición didáctica. Nunca renumerar las claves de Miki.levels. */
Miki.Curriculum=(()=>{
 const modules=Object.freeze({motor:1,sensors:2,transfer:3,sequence:4,pneumatics:5});
 // Único lugar donde configurar el orden de formación.
 const order=['motor','sensors','transfer','sequence','pneumatics'];
 const uid=level=>Object.keys(modules).find(id=>modules[id]===Number(level));
 const levels=()=>order.map(id=>modules[id]).filter(id=>Miki.levels[id]);
 const position=level=>levels().indexOf(Number(level))+1;
 const next=level=>levels()[levels().indexOf(Number(level))+1];
 function setOrder(ids){const expected=Object.keys(modules);if(ids.length!==expected.length||new Set(ids).size!==ids.length||ids.some(id=>!expected.includes(id)))throw Error('El itinerario debe contener cada módulo publicado una sola vez');order.splice(0,order.length,...ids)}
 const badgeLabel=text=>text.replace(/^Dominio completo · Nivel (\d+)$/,(_all,id)=>'Dominio completo · '+(Miki.levels[id]?.title||'Módulo '+id));
 return {modules,uid,levels,position,next,setOrder,badgeLabel,get order(){return order.slice()}};
})();
