// Itinerario de aprendizaje. Reglas puras: nunca otorga XP por practicar.
Miki.Learning=(()=>{
 const availableLevels=()=>Object.keys(Miki.levels).map(Number).sort((a,b)=>a-b);
 const faults=level=>Object.keys(Miki.levels[level]?.faults||{});
 const key=(level,fault)=>`${level}:${fault}`;
 const distinct=(progress,level)=>faults(level).filter(f=>(progress.completed||[]).includes(key(level,f)));
 const threshold=level=>Math.min(2,faults(level).length);
 const mastery=(progress,level)=>faults(level).length>0&&distinct(progress,level).length===faults(level).length;
 function access(progress,level,mode='career'){
  const levels=availableLevels();
  if(!levels.includes(level))return {unlocked:false,reason:`El nivel ${level} todavía no está publicado.`,unpublished:true};
  if(mode==='practice')return {unlocked:true,reason:'Disponible en Práctica libre; no otorga XP.'};
  const position=levels.indexOf(level);
  if(position===0)return {unlocked:true,reason:'Primer nivel de la carrera.'};
  const prior=levels[position-1],count=distinct(progress,prior).length,need=threshold(prior);
  return {unlocked:count>=need,prior,count,need,reason:count>=need?'Desbloqueado: formación previa superada.':`Completa ${need} casos distintos del nivel ${prior} para desbloquear este nivel (${count}/${need}).`};
 }
 function nextFault(level,current,progress,mode='career'){
  const keys=faults(level),start=Math.max(0,keys.indexOf(current));
  if(!keys.length)return null;
  const ordered=keys.slice(start+1).concat(keys.slice(0,start+1));
  if(mode==='career')return ordered.find(f=>!(progress.completed||[]).includes(key(level,f)))||ordered[0];
  return ordered[0];
 }
 // El progreso de práctica existe solamente mientras la pestaña permanece abierta.
 function session(progress){
  let mode='career';const practiced=new Set();
  return {
   get mode(){return mode},
   change(value){if(!['career','practice'].includes(value))return false;if(mode===value)return false;mode=value;return true},
   practiced,
   access:level=>access(progress,level,mode),
   count:level=>mode==='career'?distinct(progress,level).length:faults(level).filter(f=>practiced.has(key(level,f))).length,
   markPractice:(level,fault)=>practiced.add(key(level,fault)),
   next:(level,fault)=>nextFault(level,fault,progress,mode),
   progress:level=>({done:mode==='career'?distinct(progress,level).length:faults(level).filter(f=>practiced.has(key(level,f))).length,total:faults(level).length,required:threshold(level),mastery:mode==='career'&&mastery(progress,level)}),
  };
 }
 return {availableLevels,faults,key,distinct,threshold,mastery,access,nextFault,session};
})();
