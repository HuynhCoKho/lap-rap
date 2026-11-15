function hull(points){
 const p=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const lo=[],hi=[];for(const q of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),q)<=0)lo.pop();lo.push(q);}for(const q of p.toReversed()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),q)<=0)hi.pop();hi.push(q);}return lo.slice(0,-1).concat(hi.slice(0,-1));
}
const lineDistance=(p,a,b)=>Math.abs((b[0]-a[0])*(a[1]-p[1])-(a[0]-p[0])*(b[1]-a[1]))/Math.max(1e-9,Math.hypot(b[0]-a[0],b[1]-a[1]));
function simplify(p,epsilon){const result=p.slice();let changed=true;while(changed&&result.length>3){changed=false;let min=Infinity,at=-1;for(let i=0;i<result.length;i++){const d=lineDistance(result[i],result[(i+result.length-1)%result.length],result[(i+1)%result.length]);if(d<min){min=d;at=i;}}if(min<epsilon){result.splice(at,1);changed=true;}}return result;}
const area=p=>Math.abs(p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a[0]*b[1]-b[0]*a[1];},0))/2;
export function detectPolygonFaces({data,width:w,height:h}){
 if(!w||!h||data.length!==w*h*4)return [];
 const barrier=new Uint8Array(w*h);
 for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){let gx=0,gy=0;for(let c=0;c<3;c++){gx+=(data[(y*w+x+2)*4+c]-data[(y*w+x-2)*4+c])**2;gy+=(data[((y+2)*w+x)*4+c]-data[((y-2)*w+x)*4+c])**2;}barrier[y*w+x]=Math.max(gx,gy)>35*35?1:0;}
 const candidates=[],visit=new Uint16Array(w*h),queue=new Int32Array(w*h);let stamp=0;
 for(const sy of [.2,.3,.4,.5,.6,.7])for(const sx of [.25,.4,.55,.7])for(const tolerance of [20,32,44,56]){
  stamp++;const seed=Math.floor(sy*h)*w+Math.floor(sx*w),offset=seed*4,red=data[offset],green=data[offset+1],blue=data[offset+2];
  // Almost white, black and transparent backgrounds cannot establish a face reliably.
  if(data[offset+3]<200||Math.max(red,green,blue)-Math.min(red,green,blue)<12||red+green+blue<100)continue;
  let head=0,tail=1;queue[0]=seed;visit[seed]=stamp;const border=[];let touches=0;
  const accept=i=>{const k=i*4;return !barrier[i]&&data[k+3]>200&&(data[k]-red)**2+(data[k+1]-green)**2+(data[k+2]-blue)**2<tolerance*tolerance;};
  while(head<tail){const at=queue[head++],x=at%w,y=Math.floor(at/w);let boundary=false;if(x===0||x===w-1||y===0||y===h-1)touches++;
   for(const next of [x>0?at-1:-1,x<w-1?at+1:-1,y>0?at-w:-1,y<h-1?at+w:-1]){if(next<0){boundary=true;continue;}if(!accept(next)){boundary=true;continue;}if(visit[next]!==stamp){visit[next]=stamp;queue[tail++]=next;}}
   if(boundary)border.push([x,y]);
  }
  if(touches||tail<w*h*.025||tail>w*h*.7||border.length<12)continue;
  const polygon=simplify(hull(border),Math.max(w,h)*.018),n=polygon.length;if(![6,8].includes(n))continue;
  let minTurn=Infinity;for(let i=0;i<n;i++){const a=polygon[(i+n-1)%n],b=polygon[i],c=polygon[(i+1)%n],u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-b[0],c[1]-b[1]],angle=Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))));minTurn=Math.min(minTurn,angle);}if(minTurn<.28)continue;
  const a=area(polygon),coverage=tail/a;if(coverage<.7||a<w*h*.035)continue;
  const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]),box={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};
  if(Math.min(box.w,box.h)<Math.min(w,h)*.16)continue;
  let symmetry=0;if(n%2===0){const mid=polygon.map((p,i)=>[(p[0]+polygon[(i+n/2)%n][0])/2,(p[1]+polygon[(i+n/2)%n][1])/2]),center=[mid.reduce((s,p)=>s+p[0],0)/n,mid.reduce((s,p)=>s+p[1],0)/n];symmetry=Math.max(...mid.map(p=>Math.hypot(p[0]-center[0],p[1]-center[1])))/Math.hypot(box.w,box.h);if(symmetry>.08)continue;}
  const minEdge=Math.min(...polygon.map((p,i)=>Math.hypot(p[0]-polygon[(i+1)%n][0],p[1]-polygon[(i+1)%n][1])));if(minEdge<Math.hypot(box.w,box.h)*.09)continue;
  candidates.push({sides:n,points:polygon.map(([x,y])=>[x/w,y/h]),coverage,symmetry,area:a/(w*h),score:coverage*(1-symmetry*5),box:{x:box.x/w,y:box.y/h,w:box.w/w,h:box.h/h}});
 }
 return candidates.sort((a,b)=>b.score-a.score);
}

export function combineGeometryAndRecognition(result,faces){
 const mass=result.ranked.filter(p=>['box','mailer','polygon-prism','hex-carton'].includes(p.model)).reduce((sum,p)=>sum+p.score,0);
 const best=faces.find(f=>f.sides===6&&f.score>=.6&&f.symmetry<.05&&f.coverage>.75&&f.area>.08);
 const supporting=best?faces.filter(f=>f.sides===6&&Math.abs(f.box.x-best.box.x)<.08&&Math.abs(f.box.y-best.box.y)<.08&&Math.abs(f.area-best.area)<.05):[];
 if(mass<.65||!best||supporting.length<2)return result;
 const hex=result.ranked.find(p=>p.id==='hexagonal-prism');if(!hex)return result;
 return {...result,uncertain:false,method:'contour+clip',geometryEvidence:best,ranked:[{...hex,geometric:true},...result.ranked.filter(p=>p.id!==hex.id)]};
}
