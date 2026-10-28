import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceElapsed,createBall,makeBoards,stages,simulate} from '../public/physics.mjs';
for(let i=0;i<3;i++)for(const fpsInterval of[1/60,.2,1.3,10])test(`stage ${i+1} foreground elapsed ${fpsInterval.toFixed(3)}s retains route and speed`,()=>{const b=createBall(i),boards=makeBoards(i,true);let frames=0;while(!b.arrived&&!b.settled&&frames++<600)advanceElapsed(b,boards,stages[i],fpsInterval);const baseline=simulate(i).ball;assert.equal(b.arrived,true);assert.equal(b.hits,baseline.hits);assert.ok(Math.abs(b.age-baseline.age)<.03);assert.ok(Math.hypot(b.x-baseline.x,b.y-baseline.y)<5);});
test('invalid elapsed is ignored without corrupting ball',()=>{for(const dt of[NaN,Infinity,-1,0]){const b=createBall(0),before={...b};advanceElapsed(b,makeBoards(0,true),stages[0],dt);assert.deepEqual(b,before);}});
