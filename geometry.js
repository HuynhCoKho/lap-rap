export const UNITS={mm:1,cm:10,m:1000,in:25.4};
export function photoRatios(marks,reference,model){
 const required=['cylinder','cone','triangular-pyramid','polygon-prism','polygon-pyramid','hex-carton'].includes(model)?['w','h']:['w','d','h'];
 if(!required.includes(reference))throw Error('Mẫu này dùng A (đường kính hoặc cạnh đáy) hoặc C (chiều cao) làm cạnh chuẩn.');
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
export function geometry(model,w,d,h,tab,sides=6){
 const faces=[],circles=[];const poly=(name,p,glue=false)=>faces.push({name,p,glue});
 const rect=(name,x,y,a,b,g=false)=>poly(name,[[x,y],[x+a,y],[x+a,y+b],[x,y+b]],g);
 const sideTab=(name,x,y,t,l,right=false)=>{const s=right?1:-1;poly(name,[[x,y],[x+s*t,y+Math.min(t/3,l/4)],[x+s*t,y+l-Math.min(t/3,l/4)],[x,y+l]],true)};
 const t=Math.min(...(['cylinder','cone','triangular-pyramid','polygon-prism','polygon-pyramid','hex-carton'].includes(model)?[w,h]:[w,d,h]))*tab/100;
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
 }else if(model==='hex-carton'){
  const root3=Math.sqrt(3),flap=Math.min(w*.42,h*.7),tuck=Math.min(w*.3,h*.75);
  for(let i=0;i<6;i++)rect('Thân '+(i+1),i*w,0,w,h);
  sideTab('Tai dán thân',0,0,Math.min(t,w*.3),h);
  const cap=(panel,top)=>{
   const origin=panel*w,baseY=top?0:h,s=top?-1:1;
   const p=[[origin,baseY],[origin+w,baseY],[origin+1.5*w,baseY+s*root3*w/2],[origin+w,baseY+s*root3*w],[origin,baseY+s*root3*w],[origin-.5*w,baseY+s*root3*w/2]];
   poly(top?'Nắp lục giác':'Đáy lục giác',p);
   const far=baseY+s*root3*w;
   poly(top?'Tai gài nắp':'Tai gài đáy',[[origin,far],[origin+w,far],[origin+.88*w,far+s*tuck],[origin+.12*w,far+s*tuck]],true);
   for(let i=0;i<6;i++){
    if(i===panel)continue;const x=i*w;
    if(i===panel-1)poly('Tai phụ '+(top?'trên ':'dưới ')+(i+1),[[x,baseY],[x+w,baseY],[x,baseY+s*flap]],true);
    else if(i===panel+1)poly('Tai phụ '+(top?'trên ':'dưới ')+(i+1),[[x,baseY],[x+w,baseY],[x+w,baseY+s*flap]],true);
    else poly('Tai phụ '+(top?'trên ':'dưới ')+(i+1),[[x,baseY],[x+w,baseY],[x+.88*w,baseY+s*flap],[x+.12*w,baseY+s*flap]],true);
   }
  };
  cap(1,true);cap(4,false);
 }else if(model==='polygon-prism'||model==='polygon-pyramid'){
  if(!Number.isInteger(sides)||sides<3||sides>12)throw Error('Số cạnh đáy phải là số nguyên từ 3 đến 12.');
  const n=sides,R=w/(2*Math.sin(Math.PI/n)),apothem=w/(2*Math.tan(Math.PI/n));
  const regular=()=>{const p=[[0,0]];let x=0,y=0;for(let i=0;i<n-1;i++){x+=w*Math.cos(2*Math.PI*i/n);y+=w*Math.sin(2*Math.PI*i/n);p.push([x,y]);}return p;};
  if(model==='polygon-prism'){
   for(let i=0;i<n;i++)rect('Mặt bên '+(i+1),i*w,0,w,h);
   const p=regular();poly('Đáy '+n+' cạnh 1',p.map(([x,y])=>[x,-y]));poly('Đáy '+n+' cạnh 2',p.map(([x,y])=>[x,h+y]));
   sideTab('Tai nối thân',0,0,t,h);
   const bottom=Math.max(...faces.flatMap(f=>f.p.map(p=>p[1])));
   for(let i=0;i<2*(n-1);i++)rect('Dải nối đáy '+(i+1),i*2.5*t,bottom+2*t,2*t,w,true);
  }else{
   const base=regular(),slant=Math.hypot(h,apothem);poly('Đáy đều '+n+' cạnh',base);
   for(let i=0;i<n;i++){const a=base[i],b=base[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1];poly('Mặt tam giác '+(i+1),[a,b,[(a[0]+b[0])/2+dy/w*slant,(a[1]+b[1])/2-dx/w*slant]]);}
   const bottom=Math.max(...faces.flatMap(f=>f.p.map(p=>p[1])));
   for(let i=0;i<n;i++)rect('Dải nối cạnh '+(i+1),i*2.5*t,bottom+2*t,2*t,Math.hypot(h,R),true);
  }
 }else if(model==='triangular-prism'){
  const side=Math.hypot(w/2,d);
  rect('Mặt bên 1',0,0,w,h);rect('Mặt bên 2',w,0,side,h);rect('Mặt bên 3',w+side,0,side,h);
  poly('Đáy tam giác 1',[[0,0],[w/2,-d],[w,0]]);
  poly('Đáy tam giác 2',[[0,h],[w,h],[w/2,h+d]]);
  sideTab('Tai nối thân',0,0,t,h);
  // Separate strips join the four remaining base edges without overlapping the faces.
  for(let i=0;i<4;i++)rect('Dải nối đáy '+(i+1),i*(2*t+t/2),h+d+2*t,2*t,side,true);
 }else if(model==='triangular-pyramid'){
  const altitude=Math.sqrt(3)*w/2,slant=Math.hypot(h,w*Math.sqrt(3)/6);
  const base=[[0,0],[w,0],[w/2,altitude]];poly('Đáy tam giác đều',base);
  for(let i=0;i<3;i++){
   const a=base[i],b=base[(i+1)%3],dx=b[0]-a[0],dy=b[1]-a[1];
   poly('Mặt bên '+(i+1),[a,b,[(a[0]+b[0])/2+dy/w*slant,(a[1]+b[1])/2-dx/w*slant]]);
  }
  const edge=Math.hypot(h,w/Math.sqrt(3));
  const bottom=Math.max(...faces.flatMap(f=>f.p.map(p=>p[1])));
  for(let i=0;i<3;i++)rect('Dải nối cạnh '+(i+1),i*(2*t+t/2),bottom+2*t,2*t,edge,true);
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
 // Pack loose joining strips separately, keeping their physical dimensions unchanged.
 const strips=faces.filter(f=>f.glue&&f.name.startsWith('Dải nối'));
 if(strips.length){
  const main=faces.filter(f=>!strips.includes(f)).flatMap(f=>f.p),left=Math.min(...main.map(p=>p[0])),right=Math.max(...main.map(p=>p[0])),bottom=Math.max(...main.map(p=>p[1]));
  let x=left,y=bottom+14,rowHeight=0;
  for(const [i,f] of strips.entries()){
   const length=f.p[2][1]-f.p[0][1],width=f.p[1][0]-f.p[0][0];
   if(x>left&&x+length>right){x=left;y+=rowHeight+10;rowHeight=0;}
   f.p=[[x,y],[x+length,y],[x+length,y+width],[x,y+width]];f.detached=true;f.join='N'+(i+1);f.length=length;f.width=width;
   x+=length+12;rowHeight=Math.max(rowHeight,width);
  }
 }
 const edgeMap=new Map();const key=p=>p.map(n=>n.toFixed(6)).join(',');
 for(const f of faces){for(let i=0;i<f.p.length;i++){const a=f.p[i],b=f.p[(i+1)%f.p.length],k=[key(a),key(b)].sort().join('|');if(edgeMap.has(k))edgeMap.get(k).count++;else edgeMap.set(k,{a,b,count:1,auxiliary:!!f.detached});}}
 for(const f of strips){const y=(f.p[0][1]+f.p[2][1])/2;edgeMap.set(f.name,{a:[f.p[0][0],y],b:[f.p[1][0],y],count:2,auxiliary:true});}
 if(['triangular-pyramid','polygon-pyramid'].includes(model)){
  const sides=faces.filter(f=>!f.glue).slice(1);
  for(let i=0;i<sides.length;i++){
   const face=sides[i],next=sides[(i+1)%sides.length];
   for(const [a,b] of [[face.p[1],face.p[2]],[next.p[0],next.p[2]]]){const e=edgeMap.get([key(a),key(b)].sort().join('|'));if(e)e.join='N'+(i+1);}
  }
 }
 const pts=faces.flatMap(f=>f.p).concat(circles.flatMap(c=>[[c.cx-c.r,c.cy-c.r],[c.cx+c.r,c.cy+c.r]]));
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {faces,circles,edges:[...edgeMap.values()],bounds:{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)}};
}
