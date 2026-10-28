export const WORLD = { width: 1000, height: 800, floor: 360 };
const DEG = Math.PI / 180;
export const stages = [
 {name:'把球送过来',description:'挪一挪纸板，让球从纸箱里穿过去。',start:{x:120,y:700},heading:-45,goal:{x:800,y:530},box:{x:560,y:530},boards:[{x:340,y:480,angle:0,length:200,homeAngle:-22.5}]},
 {name:'绕个小弯',description:'两块纸板搭个弯，小猫在另一边等球。',start:{x:120,y:720},heading:-45,goal:{x:800,y:610},box:{x:565,y:530},boards:[{x:360,y:480,angle:-22.5,length:200,homeAngle:-22.5},{x:680,y:480,angle:0,length:200,homeAngle:22.5}]},
 {name:'换一种走法',description:'纸箱挪了个位置，再一起试试。',start:{x:160,y:700},heading:-30,goal:{x:800,y:450},box:{x:550,y:610},boards:[{x:420,y:550,angle:7.5,length:200,homeAngle:-15},{x:730,y:605,angle:-22.5,length:200,homeAngle:-22.5}]}
];
export function makeBoards(index, helped=false){return stages[index].boards.map((b,id)=>({...b,id,angle:helped?b.homeAngle:b.angle}));}
export function createBall(index){const s=stages[index];return {...s.start,vx:Math.cos(s.heading*DEG)*210,vy:Math.sin(s.heading*DEG)*210,r:18,rotation:0,age:0,hits:0,arrived:false,settled:false,throughBox:false};}
export function nearestOnBoard(ball,board){const ux=Math.cos(board.angle*DEG),uy=Math.sin(board.angle*DEG);const along=Math.max(-board.length/2,Math.min(board.length/2,(ball.x-board.x)*ux+(ball.y-board.y)*uy));return {x:board.x+ux*along,y:board.y+uy*along};}
export function step(ball,boards,stage,dt){if(ball.arrived||ball.settled)return ball;const count=Math.max(1,Math.ceil(Math.min(dt,.25)*120));const h=Math.min(dt,.25)/count;
 for(let i=0;i<count;i++){ball.age+=h;ball.x+=ball.vx*h;ball.y+=ball.vy*h;ball.rotation+=Math.hypot(ball.vx,ball.vy)*h/ball.r*180/Math.PI;ball.vx*=Math.exp(-.035*h);ball.vy*=Math.exp(-.035*h);
 for(const board of boards){const p=nearestOnBoard(ball,board);let nx=ball.x-p.x,ny=ball.y-p.y,dist=Math.hypot(nx,ny);const min=ball.r+9;if(dist<min){if(dist<.0001){nx=-Math.sin(board.angle*DEG);ny=Math.cos(board.angle*DEG);dist=1;}else{nx/=dist;ny/=dist;}ball.x=p.x+nx*(min+.1);ball.y=p.y+ny*(min+.1);const dot=ball.vx*nx+ball.vy*ny;if(dot<0){ball.vx-=2*dot*nx;ball.vy-=2*dot*ny;ball.hits++;}}}
 if(Math.hypot(ball.x-stage.box.x,ball.y-stage.box.y)<70)ball.throughBox=true;
 if(Math.hypot(ball.x-stage.goal.x,ball.y-stage.goal.y)<68){ball.arrived=true;ball.vx=ball.vy=0;break;}
 if(ball.x<24||ball.x>976||ball.y<360||ball.y>776||ball.age>8){ball.x=Math.min(976,Math.max(24,ball.x));ball.y=Math.min(776,Math.max(360,ball.y));ball.vx=ball.vy=0;ball.settled=true;break;}
 }return ball;}
export function simulate(index,boards=makeBoards(index,true)){const b=createBall(index);const trace=[];while(!b.arrived&&!b.settled){step(b,boards,stages[index],1/60);trace.push([b.x,b.y]);}return {ball:b,trace};}

// Consume foreground elapsed time without changing physical speed at low FPS.
// Each step retains its 1/120 s collision subdivisions. A whole throw settles
// within 8 s; the 10 s bound prevents unbounded work after a stalled process.
export function advanceElapsed(ball,boards,stage,elapsed){
 if(!Number.isFinite(elapsed)||elapsed<=0)return ball;
 let remaining=Math.min(elapsed,10);
 while(remaining>1e-9&&!ball.arrived&&!ball.settled){
  const chunk=Math.min(remaining,.25);step(ball,boards,stage,chunk);remaining-=chunk;
 }
 return ball;
}
