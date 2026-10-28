import test from 'node:test';
import assert from 'node:assert/strict';
import {stages,makeBoards,createBall,step,simulate,nearestOnBoard} from '../public/physics.mjs';
for(let i=0;i<stages.length;i++){
 test(`stage ${i+1}: help layout is physically reachable through box`,()=>{const {ball,trace}=simulate(i);assert.equal(ball.arrived,true);assert.equal(ball.throughBox,true);assert.ok(ball.hits>=1);assert.ok(trace.length>100);assert.ok(ball.age<8);});
 test(`stage ${i+1}: board removal changes outcome`,()=>{const a=simulate(i).ball,b=simulate(i,[]).ball;assert.equal(b.arrived,false);assert.equal(b.hits,0);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>100);});
 test(`stage ${i+1}: default differs and a 22.5-degree turn is sufficient`,()=>{const defaults=makeBoards(i);assert.equal(simulate(i,defaults).ball.arrived,false);const changed=defaults.filter(b=>b.angle!==b.homeAngle);assert.equal(changed.length,1);assert.equal(Math.abs(changed[0].angle-changed[0].homeAngle),22.5);changed[0].angle=changed[0].homeAngle;assert.equal(simulate(i,defaults).ball.arrived,true);});
 test(`stage ${i+1}: long frames are subdivided, no board tunneling`,()=>{const b=createBall(i);let n=0;while(!b.arrived&&!b.settled&&n++<100)step(b,makeBoards(i,true),stages[i],.25);assert.equal(b.arrived,true);assert.equal(b.hits,simulate(i).ball.hits);});
 test(`stage ${i+1}: new board copies and settled states are isolated`,()=>{const a=makeBoards(i),b=makeBoards(i);a[0].angle+=90;assert.notEqual(a[0].angle,b[0].angle);const settled=simulate(i,[]).ball,before={...settled};step(settled,makeBoards(i,true),stages[i],.25);assert.deepEqual(settled,before);const fresh=createBall(i);assert.equal(fresh.arrived,false);assert.equal(fresh.hits,0);assert.equal(fresh.age,0);});
 test(`stage ${i+1}: physical position change affects path`,()=>{const moved=makeBoards(i,true);moved[0].x+=200;moved[0].y+=200;const a=simulate(i),b=simulate(i,moved);assert.notDeepEqual(a.trace,b.trace);assert.notDeepEqual(a.ball,b.ball);});
}
test('nearest point remains on finite board segment',()=>{assert.deepEqual(nearestOnBoard({x:1000,y:100},{x:0,y:0,angle:0,length:200}),{x:100,y:0});});
test('three layouts are genuinely distinct',()=>{assert.equal(stages.length,3);assert.equal(new Set(stages.map(x=>JSON.stringify([x.start,x.goal,x.boards]))).size,3);});
