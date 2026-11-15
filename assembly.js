// Real 3D coordinates projected onto Canvas. Dimensions are shared with the cutting net.
export function buildAssembly(model,w,d,h,sides=6,tab=35){
 const faces=[],steps=['Bản trải 2D: cắt đường liền, giữ các nét đứt để gấp.'],seams=[];
 const add=(name,p,phase,smooth=false)=>faces.push({name,p,phase,smooth});
 const baseRect=[[-w/2,-d/2,0],[w/2,-d/2,0],[w/2,d/2,0],[-w/2,d/2,0]];
 const regular=n=>{const R=w/(2*Math.sin(Math.PI/n));return Array.from({length:n},(_,i)=>{const a=-Math.PI/2-Math.PI/n+2*Math.PI*i/n;return [R*Math.cos(a),R*Math.sin(a),0];});};
 let note='Hướng dẫn ghép các mặt chính; tai dán và độ dày vật liệu không được mô phỏng trong 3D.';
 if(['triangular-pyramid','polygon-pyramid','triangular-prism','polygon-prism'].includes(model)){
  const pyramid=model.includes('pyramid'),n=model.startsWith('triangular')?3:sides;
  if(!Number.isInteger(n)||n<3||n>12)throw Error('Số cạnh đáy không hợp lệ.');
  const p=model==='triangular-prism'?[[-w/2,-d/3,0],[w/2,-d/3,0],[0,2*d/3,0]]:regular(n);
  steps.push('Đặt đáy '+n+' cạnh nằm trên mặt phẳng.');add('Đáy',p,1);
  for(let i=0;i<n;i++){
   const a=p[i],b=p[(i+1)%n],phase=i+2;
   if(pyramid){add('Mặt bên '+(i+1),[a,b,[0,0,h]],phase);steps.push('Gấp mặt bên '+(i+1)+' lên theo cạnh đáy. Đỉnh mặt này gặp đỉnh chung của khối.');seams.push({name:'N'+(i+1),a:b,b:[0,0,h],phase:Math.max(i+2,((i+1)%n)+2)});}
   else{add('Mặt bên '+(i+1),[a,b,[b[0],b[1],h],[a[0],a[1],h]],phase);steps.push('Gấp mặt bên '+(i+1)+' vuông góc với đáy; chiều dài trục khối là C.');}
  }
  if(!pyramid){const phase=n+2;add('Đáy trên',p.map(([x,y])=>[x,y,h]),phase);steps.push('Đóng đáy thứ hai. Hai đáy song song, các góc và cạnh tương ứng trùng nhau.');}
  steps.push(pyramid?'Ghép hai cạnh cùng mã N. Gấp đôi dải nối N rồi dán một nửa vào mỗi mặt, ở phía trong. Đợi keo khô.':'Dán tai nối thân và các dải nối đáy từ bên trong. Kiểm tra hai đáy song song trước khi cố định.');
  if(pyramid)note='Mã N trên cạnh 3D tương ứng với mã trên bản cắt 2D và dải nối rời. Cao C là chiều cao vuông góc, không phải cạnh xiên.';
 }else if(['box','mailer','dustpan'].includes(model)){
  add('Đáy',baseRect,1);steps.push('Đặt mặt đáy trên bàn, mặt ngoài hướng xuống.');
  if(model==='dustpan'){
   add('Vách sau',[baseRect[0],baseRect[1],[w/2,-d/2,h],[-w/2,-d/2,h]],2);steps.push('Gấp vách sau vuông góc với đáy. Chiều cao vách là C.');
   add('Vách trái',[baseRect[0],baseRect[3],[-w/2,-d/2,h]],3);steps.push('Gấp vách tam giác bên trái lên; cạnh cao nằm sát vách sau.');
   add('Vách phải',[baseRect[1],baseRect[2],[w/2,-d/2,h]],4);steps.push('Gấp vách tam giác bên phải lên, đối xứng với bên trái.');
   const t=Math.min(w,d,h)*tab/100;add('Mép xúc',[baseRect[3],baseRect[2],[w/2,d/2+t,0],[-w/2,d/2+t,0]],5);steps.push('Giữ mép xúc phía trước gần phẳng với đáy.');
   steps.push('Gấp đôi hai dải nối góc rồi dán vách sau với hai hông. Cán làm riêng; mẫu này chưa có cán.');note='Mẫu khay gồm các mặt phẳng, không tái hiện góc bo của sản phẩm đúc. Mép xúc đang minh họa ở vị trí phẳng.';
  }else{
   const quads=[['Lưng',[baseRect[0],baseRect[1],[w/2,-d/2,h],[-w/2,-d/2,h]]],['Hông phải',[baseRect[1],baseRect[2],[w/2,d/2,h],[w/2,-d/2,h]]],['Mặt trước',[baseRect[2],baseRect[3],[-w/2,d/2,h],[w/2,d/2,h]]],['Hông trái',[baseRect[3],baseRect[0],[-w/2,-d/2,h],[-w/2,d/2,h]]]];
   quads.forEach(([name,p],i)=>{add(name,p,i+2);steps.push('Dựng '+name.toLowerCase()+' vuông góc với đáy, ghép với mặt bên cạnh.');});
   add('Nắp',baseRect.map(([x,y])=>[x,y,h]),6);steps.push(model==='mailer'?'Gập nắp liền qua lưng, đưa các tai gài vào trong hai hông.':'Gấp các tai nhỏ vào trong rồi đóng nắp chính.');
   steps.push('Kiểm tra cạnh trùng nhau, dán hoặc gài theo kiểu hộp đã chọn.');
  }
 }else if(['cylinder','cone'].includes(model)){
  const n=64,r=w/2,p=Array.from({length:n},(_,i)=>[r*Math.cos(i*2*Math.PI/n),r*Math.sin(i*2*Math.PI/n),0]);
  add('Đáy tròn',p,1);steps.push('Đặt đáy tròn, đường kính A.');
  for(let i=0;i<n;i++){const a=p[i],b=p[(i+1)%n];add('Thân',model==='cone'?[a,b,[0,0,h]]:[a,b,[b[0],b[1],h],[a[0],a[1],h]],2,true);}
  steps.push(model==='cone'?'Cuộn hình quạt thành thân nón; hai cạnh thẳng gặp nhau tại đường nối.':'Uốn hình chữ nhật thành thân trụ; hai cạnh chiều cao C gặp nhau tại đường nối.');
  if(model==='cylinder'){add('Đáy trên',p.map(([x,y])=>[x,y,h]),3);steps.push('Đặt đáy tròn thứ hai vào đầu còn lại của thân.');}
  steps.push('Cố định đường nối thân và đáy. Mẫu trụ/nón chưa có tai nối đáy: cần băng dính hoặc phần nối bổ sung.');
  note='Thân cong được minh họa bằng các mảng nhỏ để hiển thị; đây không phải các đường cần cắt hay gấp.';
 }else throw Error('Chưa có hướng dẫn 3D cho mẫu này.');
 return {faces,steps,seams,note};
}

export function projectPoint(p,yaw,pitch,center){
 const [x,y,z]=p.map((v,i)=>v-center[i]),u=x*Math.cos(yaw)-y*Math.sin(yaw),v=x*Math.sin(yaw)+y*Math.cos(yaw);
 return [u,v*Math.sin(pitch)-z*Math.cos(pitch),v*Math.cos(pitch)+z*Math.sin(pitch)];
}

export function mountAssembly(root){
 root.innerHTML=`<div class="section-head"><div><div class="eyebrow">TỪ BẢN CẮT ĐẾN HÌNH KHỐI</div><h2>Hướng dẫn ghép 3D</h2></div><span class="pill" data-part="counter"></span></div><div class="guide-toolbar"><button data-action="prev" class="secondary" aria-label="Bước trước">←</button><select data-part="step" aria-label="Bước lắp ráp"></select><button data-action="next" class="secondary" aria-label="Bước tiếp">→</button><button data-action="play" class="secondary">▶ Tự chuyển bước</button></div><p data-part="instruction" class="guide-instruction" role="status" aria-live="polite"></p><div class="guide-scene"><div data-part="flat" class="guide-flat"></div><canvas data-part="canvas" tabindex="0" aria-label="Mô hình lắp ráp 3D. Kéo chuột để xoay, cuộn để thu phóng; dùng phím mũi tên để xoay."></canvas></div><div class="guide-toolbar"><button data-view="iso" class="secondary">Góc nghiêng</button><button data-view="front" class="secondary">Nhìn trước</button><button data-view="side" class="secondary">Nhìn bên</button><button data-view="top" class="secondary">Nhìn trên</button><button data-action="zoomIn" class="text-button" aria-label="Phóng to mô hình">＋</button><button data-action="zoomOut" class="text-button" aria-label="Thu nhỏ mô hình">−</button></div><p class="muted">Kéo để xoay · cuộn để thu phóng · mặt vàng là mặt đang ghép. Các mặt được thêm ở vị trí lắp, không mô phỏng động tác gấp liên tục.</p><p data-part="note" class="notice"></p>`;
 const el=name=>root.querySelector('[data-part="'+name+'"]'),canvas=el('canvas'),ctx=canvas.getContext('2d');
 let data=null,step=0,yaw=-.65,pitch=.55,zoom=1,signature='',timer=null,drag=null;
 function stop(){clearInterval(timer);timer=null;root.querySelector('[data-action="play"]').textContent='▶ Tự chuyển bước';}
 function draw(){
  if(!data||!step)return;
  const box=canvas.getBoundingClientRect(),width=Math.max(260,box.width),height=360,dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=height*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
  const points=data.faces.flatMap(f=>f.p),mins=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),maxs=[0,1,2].map(i=>Math.max(...points.map(p=>p[i]))),center=mins.map((v,i)=>(v+maxs[i])/2);
  const projected=points.map(p=>projectPoint(p,yaw,pitch,center)),low=[0,1].map(i=>Math.min(...projected.map(p=>p[i]))),high=[0,1].map(i=>Math.max(...projected.map(p=>p[i]))),scale=Math.min((width-70)/Math.max(high[0]-low[0],.001),(height-70)/Math.max(high[1]-low[1],.001))*.9*zoom;
  const project=p=>{const q=projectPoint(p,yaw,pitch,center);return [width/2+(q[0]-(low[0]+high[0])/2)*scale,height/2+(q[1]-(low[1]+high[1])/2)*scale,q[2]];};
  const visible=data.faces.filter(f=>f.phase<=step).map(f=>({...f,q:f.p.map(project)})).sort((a,b)=>a.q.reduce((s,p)=>s+p[2],0)/a.q.length-b.q.reduce((s,p)=>s+p[2],0)/b.q.length);
  ctx.lineJoin='round';
  for(const f of visible){ctx.beginPath();f.q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.phase===step?'#f0cf7f':f.phase===1?'#c1d6c6':'#dcece1';ctx.fill();if(!f.smooth){ctx.strokeStyle=f.phase===step?'#a87923':'#47755c';ctx.lineWidth=f.phase===step?2:1;ctx.stroke();const x=f.q.reduce((s,p)=>s+p[0],0)/f.q.length,y=f.q.reduce((s,p)=>s+p[1],0)/f.q.length;ctx.font='11px Arial';ctx.textAlign='center';ctx.fillStyle='#214b38';ctx.fillText(f.name,x,y);}}
  if(step>1)for(const edge of data.seams){if(edge.phase>step)continue;const a=project(edge.a),b=project(edge.b),mid=edge.a.map((v,i)=>(v+edge.b[i])/2);if(projectPoint(mid,yaw,pitch,center)[2]<0)continue;const x=(a[0]+b[0])/2,y=(a[1]+b[1])/2;ctx.fillStyle='#ffffffed';ctx.fillRect(x-13,y-8,26,16);ctx.fillStyle='#835d1b';ctx.font='bold 11px Arial';ctx.textAlign='center';ctx.fillText(edge.name,x,y+4);}
  ctx.textAlign='left';ctx.fillStyle='#547263';ctx.font='11px Arial';ctx.fillText('3D · cùng kích thước với bản trải',12,height-12);
 }
 function show(){if(!data)return;el('counter').textContent=step+' / '+(data.steps.length-1);el('step').value=String(step);el('instruction').textContent=data.steps[step];el('flat').hidden=step!==0;canvas.hidden=step===0;root.querySelector('[data-action="prev"]').disabled=step===0;root.querySelector('[data-action="next"]').disabled=step===data.steps.length-1;draw();}
 el('step').onchange=e=>{stop();step=Number(e.target.value);show();};
 root.querySelector('[data-action="prev"]').onclick=()=>{stop();step=Math.max(0,step-1);show();};
 root.querySelector('[data-action="next"]').onclick=()=>{stop();step=Math.min(data.steps.length-1,step+1);show();};
 root.querySelector('[data-action="play"]').onclick=()=>{if(timer){stop();return;}if(step===data.steps.length-1)step=0;root.querySelector('[data-action="play"]').textContent='Ⅱ Dừng';timer=setInterval(()=>{if(step>=data.steps.length-1){stop();return;}step++;show();},1800);};
 for(const button of root.querySelectorAll('[data-view]'))button.onclick=()=>{const view=button.dataset.view;[yaw,pitch]=view==='front'?[0,.08]:view==='side'?[Math.PI/2,.08]:view==='top'?[0,Math.PI/2]:[-.65,.55];if(step===0)step=1;show();};
 const zoomBy=f=>{zoom=Math.max(.4,Math.min(3,zoom*f));draw();};root.querySelector('[data-action="zoomIn"]').onclick=()=>zoomBy(1.15);root.querySelector('[data-action="zoomOut"]').onclick=()=>zoomBy(1/1.15);
 canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.012;pitch=Math.max(-1.4,Math.min(Math.PI/2,pitch+(e.clientY-drag[1])*.009));drag=[e.clientX,e.clientY];draw();};canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;};
 canvas.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY<0?1.1:1/1.1);},{passive:false});
 canvas.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')yaw-=.15;if(e.key==='ArrowRight')yaw+=.15;if(e.key==='ArrowUp')pitch=Math.min(Math.PI/2,pitch+.12);if(e.key==='ArrowDown')pitch=Math.max(-1.4,pitch-.12);draw();};
 new ResizeObserver(draw).observe(canvas);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 return {update(model,w,d,h,sides,tab,svg,enabled){root.hidden=!enabled;if(!enabled){stop();return;}const key=[model,w,d,h,sides,tab].join(':');el('flat').innerHTML=svg;if(key!==signature){stop();signature=key;data=buildAssembly(model,w,d,h,sides,tab);step=0;zoom=1;el('step').replaceChildren(...data.steps.map((text,i)=>{const o=document.createElement('option');o.value=i;o.textContent=i===0?'0 · Bản trải 2D':i+' · '+(i===data.steps.length-1?'Cố định đường nối':text.split('.')[0]);return o;}));el('note').textContent=data.note;}show();}};
}
