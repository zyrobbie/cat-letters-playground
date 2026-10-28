export const WORLD = Object.freeze({ width: 1000, height: 800, floor: 420 });
const DEG = Math.PI / 180;
const freeze = value => { if(value && typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value; };
export const stages = freeze([
 {name:'把球送过来',description:'纸箱固定在这里，挪一挪纸板，让球绕过去。',start:{x:120,y:700},heading:-45,goal:{x:800,y:530},box:{x:560,y:610,width:150,depth:36,height:116},boards:[{x:340,y:480,angle:0,length:200,homeAngle:-22.5}]},
 {name:'绕个小弯',description:'两块纸板搭个弯，绕开纸箱，把球送到爪边。',start:{x:120,y:720},heading:-45,goal:{x:800,y:590},box:{x:550,y:630,width:150,depth:36,height:116},boards:[{x:360,y:480,angle:-22.5,length:200,homeAngle:-22.5},{x:680,y:480,angle:0,length:200,homeAngle:22.5}]},
 {name:'换一种走法',description:'这次纸箱在另一边，试着从它前面绕过去。',start:{x:160,y:700},heading:-30,goal:{x:800,y:490},box:{x:610,y:500,width:150,depth:36,height:116},boards:[{x:420,y:550,angle:7.5,length:200,homeAngle:-15},{x:730,y:605,angle:-22.5,length:200,homeAngle:-22.5}]}
]);
export function boxFootprint(stage){const b=stage.box;return {left:b.x-b.width/2,right:b.x+b.width/2,top:b.y-b.depth/2,bottom:b.y+b.depth/2};}
export function catFootprint(stage){return {left:stage.goal.x-5,right:stage.goal.x+115,top:stage.goal.y+5,bottom:stage.goal.y+30};}
export function catchPoint(stage){return {x:stage.goal.x-40,y:stage.goal.y};}
export const roomFootprint=Object.freeze({left:-100,right:230,top:-100,bottom:460});
export function makeBoards(index, helped=false){return stages[index].boards.map((b,id)=>({...b,id,angle:helped?b.homeAngle:b.angle}));}
export function createBall(index){const s=stages[index];return {...s.start,vx:Math.cos(s.heading*DEG)*210,vy:Math.sin(s.heading*DEG)*210,r:18,rotation:0,age:0,hits:0,boxHits:0,catHits:0,arrived:false,settled:false};}
export function nearestOnBoard(ball,board){const ux=Math.cos(board.angle*DEG),uy=Math.sin(board.angle*DEG);const along=Math.max(-board.length/2,Math.min(board.length/2,(ball.x-board.x)*ux+(ball.y-board.y)*uy));return {x:board.x+ux*along,y:board.y+uy*along};}
export function circleOverlapsRect(ball,rect){const x=Math.max(rect.left,Math.min(rect.right,ball.x)),y=Math.max(rect.top,Math.min(rect.bottom,ball.y));return Math.hypot(ball.x-x,ball.y-y)<ball.r-1e-6;}
export function collideRect(ball,rect){let px=Math.max(rect.left,Math.min(rect.right,ball.x)),py=Math.max(rect.top,Math.min(rect.bottom,ball.y)),nx=ball.x-px,ny=ball.y-py,dist=Math.hypot(nx,ny);if(dist>=ball.r)return false;
 if(dist<1e-8){const exits=[{d:ball.x-rect.left,nx:-1,ny:0,x:rect.left,y:ball.y},{d:rect.right-ball.x,nx:1,ny:0,x:rect.right,y:ball.y},{d:ball.y-rect.top,nx:0,ny:-1,x:ball.x,y:rect.top},{d:rect.bottom-ball.y,nx:0,ny:1,x:ball.x,y:rect.bottom}].sort((a,b)=>a.d-b.d);({nx,ny,x:px,y:py}=exits[0]);}else{nx/=dist;ny/=dist;}
 ball.x=px+nx*(ball.r+.1);ball.y=py+ny*(ball.r+.1);const dot=ball.vx*nx+ball.vy*ny;if(dot<0){ball.vx-=2*dot*nx;ball.vy-=2*dot*ny;}return true;
}
export function sceneDepth(kind,value,stage){if(kind==='ball')return value.y;if(kind==='box')return boxFootprint(stage).bottom;if(kind==='cat')return catFootprint(stage).bottom;if(kind==='board')return value.y+Math.abs(Math.sin(value.angle*DEG))*value.length/2+9;return 0;}
export function boardFits(board,stage,catPresent=true){const angle=board.angle*DEG,ux=Math.cos(angle),uy=Math.sin(angle);const obstacles=[boxFootprint(stage),roomFootprint,...(catPresent?[catFootprint(stage)]:[])];for(let t=-board.length/2;t<=board.length/2;t+=5){const p={x:board.x+ux*t,y:board.y+uy*t,r:11};if(p.x<24||p.x>976||p.y<435||p.y>770||obstacles.some(r=>circleOverlapsRect(p,r)))return false;}return true;}
export function capturePathClear(ball,stage,catPresent=true,boards=[]){const target=catchPoint(stage),obstacles=[boxFootprint(stage),roomFootprint,...(catPresent?[catFootprint(stage)]:[])];for(let i=0;i<=10;i++){const p={x:ball.x+(target.x-ball.x)*i/10,y:ball.y+(target.y-ball.y)*i/10,r:ball.r};if(obstacles.some(o=>circleOverlapsRect(p,o))||boards.some(b=>{const q=nearestOnBoard(p,b);return Math.hypot(p.x-q.x,p.y-q.y)<p.r+9;}))return false;}return true;}
export function step(ball,boards,stage,dt,options={}){if(ball.arrived||ball.settled||!Number.isFinite(dt)||dt<=0)return ball;const duration=Math.min(dt,.25),speed=Math.hypot(ball.vx,ball.vy);const count=Math.min(4096,Math.max(1,Math.ceil(duration*120),Math.ceil(speed*duration/Math.max(1,ball.r*.45))));const h=duration/count,box=boxFootprint(stage),cat=catFootprint(stage),target=catchPoint(stage);
 for(let i=0;i<count;i++){ball.age+=h;ball.x+=ball.vx*h;ball.y+=ball.vy*h;ball.rotation+=Math.hypot(ball.vx,ball.vy)*h/ball.r*180/Math.PI;ball.vx*=Math.exp(-.035*h);ball.vy*=Math.exp(-.035*h);
 for(const board of boards){const p=nearestOnBoard(ball,board);let nx=ball.x-p.x,ny=ball.y-p.y,dist=Math.hypot(nx,ny);const min=ball.r+9;if(dist<min){if(dist<.0001){nx=-Math.sin(board.angle*DEG);ny=Math.cos(board.angle*DEG);dist=1;}else{nx/=dist;ny/=dist;}ball.x=p.x+nx*(min+.1);ball.y=p.y+ny*(min+.1);const dot=ball.vx*nx+ball.vy*ny;if(dot<0){ball.vx-=2*dot*nx;ball.vy-=2*dot*ny;ball.hits++;}}}
 if(collideRect(ball,box)){ball.boxHits++;ball.hits++;}
 if(collideRect(ball,roomFootprint))ball.hits++;
 if(Math.hypot(ball.x-target.x,ball.y-target.y)<36&&ball.x<stage.goal.x-5&&capturePathClear(ball,stage,options.catPresent!==false,boards)){ball.arrived=true;ball.vx=ball.vy=0;break;}
 if(options.catPresent!==false&&collideRect(ball,cat)){ball.catHits++;ball.hits++;}
 if(ball.x<24||ball.x>976||ball.y<WORLD.floor||ball.y>776||ball.age>8){ball.x=Math.min(976,Math.max(24,ball.x));ball.y=Math.min(776,Math.max(WORLD.floor,ball.y));ball.vx=ball.vy=0;ball.settled=true;break;}
 }return ball;}
export function simulate(index,boards=makeBoards(index,true),options={}){const b=createBall(index);const trace=[];while(!b.arrived&&!b.settled){step(b,boards,stages[index],1/60,options);trace.push([b.x,b.y]);}return {ball:b,trace};}
// A whole throw settles within 8 s; bounded chunks retain collision precision.
export function advanceElapsed(ball,boards,stage,elapsed,options={}){if(!Number.isFinite(elapsed)||elapsed<=0)return ball;let remaining=Math.min(elapsed,10);while(remaining>1e-9&&!ball.arrived&&!ball.settled){const chunk=Math.min(remaining,.25);step(ball,boards,stage,chunk,options);remaining-=chunk;}return ball;}
