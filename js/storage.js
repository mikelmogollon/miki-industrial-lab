globalThis.Miki={levels:{}};
Miki.Storage=(()=>{
 const KEY='miki-industrial-lab-progress-v032';
 const OLD_KEY='miki-industrial-lab-progress-v031';
 const fresh=()=>({version:2,curriculumVersion:1,unlockedModules:[],best:{},records:[],badges:[],legacyBadges:[],completed:[],migrated:false});
 const validBest=o=>Object.fromEntries(Object.entries(o||{}).filter(([k,v])=>/^\d+:[a-z]+$/.test(k)&&Number.isFinite(v)&&v>=0&&v<=100));
 function load(store){let data=fresh(),available=true,warnings=[],recovery=[];function read(k){let raw;try{raw=store.getItem(k);return raw?JSON.parse(raw):null}catch{if(raw)recovery.push({key:k,raw});warnings.push('No se pudo leer '+k);return null}}
  const current=read(KEY);if(current?.version===2&&Array.isArray(current.records)){data={...data,...current,curriculumVersion:current.curriculumVersion||0,unlockedModules:Array.isArray(current.unlockedModules)?current.unlockedModules.filter(x=>typeof x==='string'):[],best:validBest(current.best)};for(const k of ['badges','legacyBadges','completed'])data[k]=Array.isArray(data[k])?data[k].filter(x=>typeof x==='string'):[];return {data,available,warnings,recovery}}
  const previous=read(OLD_KEY);
  if(previous?.version===1&&Array.isArray(previous.records)){
   data={...data,...previous,version:2,best:validBest(previous.best),migrated:true,migrationSource:'v0.3.1',curriculumVersion:0};
   for(const k of ['badges','legacyBadges','completed'])data[k]=Array.isArray(data[k])?data[k].filter(x=>typeof x==='string'):[];
   data.completed=[...new Set([...data.completed,...Object.keys(data.best),...data.records.filter(r=>r.level&&r.fault).map(r=>r.level+':'+r.fault)])];
   return {data,available,warnings,recovery};
  }
  const old=read('miki-industrial-lab-progress-v02'),career=read('miki-industrial-lab-career-v03');
  if(Array.isArray(old?.records))data.records=old.records.filter(r=>r&&typeof r==='object').map((r,i)=>({...r,id:r.id||`legacy-${i}-${r.level}-${r.fault}`,legacy:true}));
  if(career?.version===3){data.best=validBest(career.best);data.legacyBadges=Array.isArray(career.badges)?career.badges.filter(x=>typeof x==='string'):[]}
  data.completed=[...new Set([...Object.keys(data.best),...data.records.filter(r=>r.level&&r.fault).map(r=>r.level+':'+r.fault)])];data.migrated=Boolean(old||career);if(data.migrated)data.curriculumVersion=0;return {data,available,warnings,recovery};
 }
 function save(store,data){try{store.setItem(KEY,JSON.stringify(data));return true}catch{return false}}
 return {KEY,load,save,fresh};
})();
