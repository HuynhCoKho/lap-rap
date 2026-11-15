// Model scores rank only the supplied descriptions; they are not calibrated probabilities.
export const CANDIDATES=[
 {id:'box',label:'Hộp chữ nhật',prompt:'cardboard packaging box',model:'box',faces:'6 mặt chữ nhật; tai dán và nắp cần kiểm tra theo hộp thật.'},
 {id:'mailer',label:'Hộp bìa nắp liền',prompt:'open cardboard mailer box',model:'mailer',faces:'Đáy, nắp liền, hai hông và các tai gài dạng mẫu.'},
 {id:'cylinder',label:'Hộp / vật hình trụ',prompt:'cylindrical tin can',model:'cylinder',faces:'Thân chữ nhật và hai đáy tròn. Cần đo đường kính A, chiều cao C.'},
 {id:'cone',label:'Hình nón',prompt:'traffic cone or conical party hat',model:'cone',faces:'Thân hình quạt và một đáy tròn. Cần đường kính A, chiều cao C.'},
 {id:'dustpan',label:'Khay / hót rác có vách nghiêng',prompt:'a plastic dustpan with a flat bottom sloping side walls and a handle',model:'dustpan',faces:'Đáy, hai vách tam giác, vách sau và mép xúc. Các góc bo được thay bằng đường gấp; cán làm riêng.'},
 {id:'curved',label:'Bề mặt cong phức tạp',prompt:'bowl or spherical ball',model:null,faces:'Chưa có bản trải chính xác. Cần chia múi, đường cắt hoặc mô hình 3D; không ép về mẫu hộp.'},
 {id:'appliance',label:'Thiết bị / đồ vật phức tạp',prompt:'hair dryer appliance',model:null,faces:'Chưa có mẫu hình học phù hợp. Nếu thiết bị chỉ là hình in trên hộp, hãy chọn lại Hộp chữ nhật.'},
 {id:'other',label:'Cảnh nền / vật khác',prompt:'room with furniture',model:null,faces:'Hãy khoanh vùng riêng vật cần dựng hoặc đổi ảnh rõ hơn.'}
];
export function rankRecognition(output){
 if(!Array.isArray(output)||!output.length)throw Error('AI không trả về kết quả nhận dạng.');
 const ranked=output.map(item=>{const c=CANDIDATES.find(c=>c.prompt===item.label);if(!c||!Number.isFinite(item.score)||item.score<0||item.score>1)throw Error('Kết quả nhận dạng không hợp lệ.');return {...c,score:item.score};}).sort((a,b)=>b.score-a.score);
 return {ranked,uncertain:ranked[0].score<.4||ranked[0].score-(ranked[1]?.score??0)<.1};
}
export function normalizedCrop(a,b){
 const x=Math.min(a[0],b[0]),y=Math.min(a[1],b[1]),w=Math.abs(a[0]-b[0]),h=Math.abs(a[1]-b[1]);
 if(![x,y,w,h].every(Number.isFinite)||x<0||y<0||x+w>1.000001||y+h>1.000001||w<.03||h<.03)throw Error('Vùng chọn quá nhỏ. Hãy chọn hai góc bao quanh vật thể.');return {x,y,w,h};
}
