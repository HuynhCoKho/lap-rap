export const UNITS={mm:1,cm:10,m:1000,in:25.4};
export function photoRatios(marks,reference,model){
 const required=['cylinder','cone'].includes(model)?['w','h']:['w','d','h'];
 if(!required.includes(reference))throw Error('Hình trụ/nón dùng A (đường kính) hoặc C (chiều cao) làm cạnh chuẩn.');
 const labels={w:'A',d:'B',h:'C'},lengths={};
 for(const k of required){const p=marks[k];if(!p||p.length!==2||!p.flat().every(Number.isFinite))continue;const n=Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1]);if(n>=3)lengths[k]=n;}
 const missing=required.filter(k=>!lengths[k]);
 if(missing.length)throw Error('Chưa áp dụng: còn thiếu cạnh '+missing.map(k=>labels[k]).join(', ')+'. Chọn hai đầu mỗi cạnh (ít nhất 3 pixel); không dùng tỷ lệ mẫu để thay cạnh thiếu.');
 const result={};for(const k of required){const r=lengths[k]/lengths[reference]*100;if(r>1000)throw Error('Tỷ lệ vượt 1000%. Kiểm tra lại hai đầu cạnh chuẩn.');result[k]=r;}return result;
}
export function dimensions(base,reference,ratios){
 if(!Number.isFinite(base)||base<=0)throw Error('Cạnh chuẩn phải lớn hơn 0.');
 const result={};for(const k of ['w','d','h']){const r=k===reference?100:ratios[k];if(!Number.isFinite(r)||r<=0||r>1000)throw Error('Tỷ lệ phải lớn hơn 0 và không quá 1000%.');result[k]=base*r/100;}return result;
}
export function geometry(model,w,d,h,tab){
 const faces=[],circles=[];const poly=(name,p,glue=false)=>faces.push({name,p,glue});
 const rect=(name,x,y,a,b,g=false)=>poly(name,[[x,y],[x+a,y],[x+a,y+b],[x,y+b]],g);
 const sideTab=(name,x,y,t,l,right=false)=>{const s=right?1:-1;poly(name,[[x,y],[x+s*t,y+Math.min(t/3,l/4)],[x+s*t,y+l-Math.min(t/3,l/4)],[x,y+l]],true)};
 const t=Math.min(w,d,h)*tab/100;
 if(model==='mailer'){
  rect('Mép nắp',0,0,w,h);rect('Nắp',0,h,w,d);rect('Lưng',0,h+d,w,h);rect('Đáy',0,d+2*h,w,d);rect('Mặt trước',0,2*d+2*h,w,h);
  rect('Hông trái',-h,d+2*h,h,d);rect('Hông phải',w,d+2*h,h,d);
  sideTab('Tai nắp',0,h,Math.min(h,d)*.8,d);sideTab('Tai nắp',w,h,Math.min(h,d)*.8,d,true);
  sideTab('Tai gài',-h,d+2*h,t,d);sideTab('Tai gài',w+h,d+2*h,t,d,true);
  rect('Tai góc',-h,2*d+2*h,h,h,true);rect('Tai góc',w,2*d+2*h,h,h,true);
 }else if(model==='box'){
  rect('Mặt trước',0,0,w,h);rect('Hông phải',w,0,d,h);rect('Mặt sau',w+d,0,w,h);rect('Hông trái',2*w+d,0,d,h);sideTab('Tai dán',0,0,t,h);
  rect('Nắp',0,-d,w,d);rect('Đáy',0,h,w,d);
  rect('Tai trên',w,-d/2,d,d/2,true);rect('Tai trên',2*w+d,-d/2,d,d/2,true);
  rect('Tai dưới',w,h,d,d/2,true);rect('Tai dưới',2*w+d,h,d,d/2,true);
  rect('Mép nắp',0,-d-t,w,t,true);rect('Mép đáy',0,h+d,w,t,true);
 }else if(model==='dustpan'){
  // Open tray approximation: A = opening width, B = bottom depth, C = rear wall height.
  rect('Đáy khay',0,0,w,d);rect('Vách sau',0,-h,w,h);
  poly('Vách trái',[[0,0],[0,d],[-h,0]]);
  poly('Vách phải',[[w,0],[w+h,0],[w,d]]);
  rect('Mép xúc',0,d,w,t);
  // Rear corner joins are separate strips: avoid overlapping adjacent faces in the net.
  rect('Dải nối góc 1',-h,-h-3*t,2*t,h,true);
  rect('Dải nối góc 2',w+h-2*t,-h-3*t,2*t,h,true);
 }else if(model==='cylinder'){
  const c=Math.PI*w;rect('Thân trụ',0,0,c,h);sideTab('Tai dán',0,0,t,h);
  circles.push({name:'Đáy 1',cx:w/2,cy:h+w*.65+t,r:w/2},{name:'Đáy 2',cx:w*1.7,cy:h+w*.65+t,r:w/2});
 }else if(model==='cone'){
  const r=w/2,l=Math.hypot(r,h),angle=2*Math.PI*r/l,n=180;
  const points=[[0,0]];for(let i=0;i<=n;i++){const a=-Math.PI/2+angle*i/n;points.push([l*Math.cos(a),l*Math.sin(a)]);}poly('Thân nón',points);
  circles.push({name:'Đáy',cx:l+w,cy:0,r});
 }else throw Error('Kiểu bản trải chưa được hỗ trợ.');
 const edgeMap=new Map();const key=p=>p.map(n=>n.toFixed(6)).join(',');
 for(const f of faces){for(let i=0;i<f.p.length;i++){const a=f.p[i],b=f.p[(i+1)%f.p.length],k=[key(a),key(b)].sort().join('|');if(edgeMap.has(k))edgeMap.get(k).count++;else edgeMap.set(k,{a,b,count:1});}}
 if(model==='dustpan'){for(const x of [-h+t,w+h-t])edgeMap.set('strip-fold-'+x,{a:[x,-h-3*t],b:[x,-3*t],count:2});}
 const pts=faces.flatMap(f=>f.p).concat(circles.flatMap(c=>[[c.cx-c.r,c.cy-c.r],[c.cx+c.r,c.cy+c.r]]));
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {faces,circles,edges:[...edgeMap.values()],bounds:{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)}};
}
