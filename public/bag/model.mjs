export const VERSION='0.1.0';
export const STAGES=Object.freeze([
 {bag:{x:380,y:425,w:280,h:224},clue:'ear',title:'袋口露出了一点耳尖。轻轻点一下。',travel:'袋口夹着一个小玩具，试着轻轻拿出来。'},
 {bag:{x:465,y:405,w:280,h:224},clue:'tail',title:'纸袋旁边，好像藏不住一条尾巴。',travel:'纸袋旁的小手帕动了位置。看看下面有什么。'},
 {bag:{x:330,y:415,w:280,h:224},clue:'paper',title:'把纸团挪到袋边，它会出来看看吗？',travel:'把纸团放在袋边，再轻轻掀开纸袋。'}
]);
export function layout(index){const s=STAGES[index],b=s.bag;return{...s,target:{x:b.x+b.w*.5,y:b.y+b.h+25},paperStart:{x:index===1?250:770,y:752},cluePoint:{x:b.x+b.w*.5,y:b.y+b.h*.2},floor:b.y+b.h};}
export function createState(presence='home',index=0){const l=layout(index);return{presence:presence==='travel'?'travel':'home',index,screen:'game',phase:'hidden',paper:{...l.paperStart},elapsed:0,idle:0,pulse:0,reactCount:0,message:''};}
export function reveal(s){if(s.screen!=='game'||s.phase!=='hidden')return false;s.phase='revealing';s.elapsed=0;s.message=s.presence==='home'?'它听见动静，慢慢探出了头。':'轻轻挪开遮挡，小玩具就在这里。';return true;}
export function clue(s){return s.index===2?false:reveal(s);}
export function wrongPlace(s){if(s.screen!=='game')return;s.pulse=.25;s.message=s.presence==='home'?'不着急，再看看纸袋周围。':'慢慢找，玩具不会跑掉。';}
export function movePaper(s,x,y){if(s.screen!=='game'||!Number.isFinite(x)||!Number.isFinite(y))return false;const l=layout(s.index);s.paper.x=Math.max(70,Math.min(930,x));s.paper.y=Math.max(l.floor+23,Math.min(770,y));if(Math.hypot(s.paper.x-l.target.x,s.paper.y-l.target.y)<72){if(s.phase==='hidden'&&l.clue==='paper')reveal(s);if(s.phase==='revealed'&&s.pulse===0){s.pulse=.65;s.reactCount++;s.message=s.presence==='home'?'它把爪子搭在袋口，盯着纸团看了一会儿。':'纸团和小玩具，安静地待在一起。';}}return true;}
export function offerPaper(s){const l=layout(s.index);movePaper(s,l.target.x,l.target.y);if(s.phase==='hidden')reveal(s);}
export function advance(s,dt){if(s.screen!=='game'||!Number.isFinite(dt)||dt<0)return;s.idle+=Math.min(dt,1);s.pulse=Math.max(0,s.pulse-dt);if(s.phase==='revealing'){s.elapsed=Math.min(.8,s.elapsed+dt);if(s.elapsed>=.8){s.phase='revealed';s.message=s.presence==='home'?(s.index===2?'它出来陪你待了一会儿。就玩到这里，也很好。':'原来在这里。它正看着你手边的纸团。'):(s.index===2?'玩具找到了，就让它留在这里吧。':'找到了。小玩具就留在袋边。');}}}
export function next(s){return s.screen==='game'&&s.phase==='revealed'&&s.index<2?createState(s.presence,s.index+1):null;}
export function leave(s){s.screen='home';s.pulse=0;return s;}
export function changePresence(s,presence){return createState(presence,s.index);}
export function revealProgress(s){return s.phase==='hidden'?0:s.phase==='revealed'?1:Math.min(1,s.elapsed/.8);}
