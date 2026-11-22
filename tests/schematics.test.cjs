const {test}=require('node:test'),assert=require('node:assert/strict');
for(const file of ['storage','intervention','simulation','measurements'])require('../js/'+file+'.js');
require('../levels/level-01.js');require('../levels/level-02.js');require('../levels/level-03.js');require('../levels/level-04.js');require('../js/schematics.js');
for(const level of [1,2,3,4])test(`Esquema ${level}: todos los bornes corresponden al modelo, sin activar navegación`,()=>{
 const svg=Miki.Schematics.svg(level),keys=[...svg.matchAll(/data-point="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual([...new Set(keys)].sort(),Object.keys(Miki.levels[level].points).sort());
 assert.doesNotMatch(svg,/\bdata-level=/);
 assert.ok(svg.includes('data-component="PLC"'));
});
const expected={
 '1:stop':{nodes:{s0in:24,s0out:0,q:0,f2out:24,motor:0},q:false,motor:false},
 '1:fuse':{nodes:{s0out:24,q:24,f2in:24,f2out:0,motor:0},q:true,motor:false},
 '1:coil':{nodes:{s0out:24,q:24,f2out:24,k1out:0,motor:0},q:true,motor:false},
 '2:power':{nodes:{fuseIn:24,fuseOut:0,brown:0,black:0,terminal:0},motor:true,input:false},
 '2:align':{nodes:{fuseOut:24,brown:24,black:0,terminal:0},motor:true,input:false},
 '2:wire':{nodes:{brown:24,black:24,terminal:0},motor:true,input:false}
};
for(const [id,want] of Object.entries(expected))test(`${id}: tensiones, PLC y motor coherentes con el plano`,()=>{
 const [level,fault]=id.split(':'),s=Miki.Simulation.create(+level,fault);
 Miki.Simulation.action(s,+level===1?'start':'box',true);
 const actual=Miki.Simulation.snapshot(s);
 for(const [key,value] of Object.entries(want.nodes))assert.equal(actual.nodes[key],value,key);
 for(const key of ['q','motor','input'])if(key in want)assert.equal(actual[key],want[key],key);
 Miki.Simulation.action(s,'isolate');const isolated=Miki.Simulation.snapshot(s);
 for(const [key,value] of Object.entries(isolated.nodes))assert.equal(value,key===(+level===1?'supply':'source')?24:0,key);
});
