// Model scores rank only the supplied descriptions; they are not calibrated probabilities.
export const CANDIDATES=[
 {id:'box',label:'Hộp chữ nhật',prompt:'cardboard packaging box',model:'box',faces:'6 mặt chữ nhật; tai dán và nắp cần kiểm tra theo hộp thật.'},
 {id:'mailer',label:'Hộp bìa nắp liền',prompt:'open cardboard mailer box',model:'mailer',faces:'Đáy, nắp liền, hai hông và các tai gài dạng mẫu.'},
 {id:'cylinder',label:'Hộp / vật hình trụ',prompt:'cylindrical tin can',model:'cylinder',faces:'Thân chữ nhật và hai đáy tròn. Cần đo đường kính A, chiều cao C.'},
 {id:'cone',label:'Hình nón',prompt:'traffic cone or conical party hat',model:'cone',faces:'Thân hình quạt và một đáy tròn. Cần đường kính A, chiều cao C.'},
 {id:'dustpan',label:'Khay / hót rác có vách nghiêng',prompt:'a plastic dustpan with a flat bottom sloping side walls and a handle',model:'dustpan',faces:'Đáy, hai vách tam giác, vách sau và mép xúc. Các góc bo được thay bằng đường gấp; cán làm riêng.'},
 {id:'curved',label:'Bề mặt cong phức tạp',prompt:'bowl or spherical ball',model:null,faces:'Chưa có bản trải chính xác. Cần chia múi, đường cắt hoặc mô hình 3D; không ép về mẫu hộp.'},
 {id:'appliance',label:'Thiết bị / đồ vật phức tạp',prompt:'hair dryer appliance',model:null,faces:'Chưa có mẫu hình học phù hợp. Nếu thiết bị chỉ là hình in trên hộp, hãy chọn lại Hộp chữ nhật.'},
 {id:'other',label:'Cảnh nền / vật khác',prompt:'room with furniture',model:null,faces:'Hãy khoanh vùng riêng vật cần dựng hoặc đổi ảnh rõ hơn.'},
 {id:'triangular-prism',label:'Lăng trụ tam giác',prompt:'a triangular prism shaped package with two triangular ends and three rectangular sides',model:'triangular-prism',faces:'Hai đáy tam giác và ba mặt chữ nhật. Mẫu hiện dùng tam giác cân: A = cạnh đáy, B = chiều cao tam giác, C = chiều dài lăng trụ. Không phải khối có một đỉnh nhọn.'},
 {id:'triangular-pyramid',label:'Chóp tam giác',prompt:'a tetrahedral pyramid shaped rice dumpling wrapped in green leaves and tied with string',model:'triangular-pyramid',faces:'Bốn mặt tam giác, một đỉnh nhọn. Mẫu hiện là chóp đều: A = cạnh đáy tam giác đều, C = chiều cao vuông góc. B không dùng. Bánh gói bằng lá có thể méo, không trùng hoàn toàn với mẫu đều.'},
 {id:'pentagonal-prism',label:'Lăng trụ ngũ giác đều',prompt:'a pentagonal prism container with five rectangular sides and two pentagon ends',model:'polygon-prism',sides:5,faces:'Đáy đều 5 cạnh và 5 mặt chữ nhật. A = cạnh đáy, C = chiều cao lăng trụ; B không dùng.'},
 {id:'hexagonal-prism',label:'Lăng trụ lục giác đều',prompt:'a hexagonal prism shaped box with six rectangular side faces and two hexagonal ends',model:'polygon-prism',sides:6,faces:'Hai đáy lục giác đều và 6 mặt chữ nhật. A = một cạnh lục giác, C = chiều cao lăng trụ; B không dùng.'},
 {id:'octagonal-prism',label:'Lăng trụ bát giác đều',prompt:'an octagonal prism container with eight flat rectangular side faces and octagonal ends',model:'polygon-prism',sides:8,faces:'Hai đáy bát giác đều và 8 mặt chữ nhật. A = cạnh đáy, C = chiều cao; B không dùng.'},
 {id:'square-pyramid',label:'Chóp đáy vuông đều',prompt:'a square based pyramid with four triangular sides and one pointed apex',model:'polygon-pyramid',sides:4,faces:'Đáy vuông và 4 mặt tam giác. A = cạnh đáy, C = chiều cao vuông góc, không phải cạnh xiên.'},
 {id:'pentagonal-pyramid',label:'Chóp ngũ giác đều',prompt:'a pentagonal pyramid with five triangular side faces and a pointed apex',model:'polygon-pyramid',sides:5,faces:'Đáy đều 5 cạnh và 5 mặt tam giác. A = cạnh đáy, C = chiều cao vuông góc.'},
 {id:'hexagonal-pyramid',label:'Chóp lục giác đều',prompt:'a hexagonal pyramid with six triangular side faces meeting at one apex',model:'polygon-pyramid',sides:6,faces:'Đáy lục giác đều và 6 mặt tam giác. A = cạnh đáy, C = chiều cao vuông góc.'},
 {id:'octagonal-pyramid',label:'Chóp bát giác đều',prompt:'an octagonal pyramid with eight triangular sides meeting at a pointed apex',model:'polygon-pyramid',sides:8,faces:'Đáy bát giác đều và 8 mặt tam giác. A = cạnh đáy, C = chiều cao vuông góc.'},
 {id:'screenshot',label:'Ảnh chụp màn hình / giao diện',prompt:'a screenshot of a website interface with buttons text panels and an embedded picture',model:null,faces:'Đừng dựng hộp theo các khung giao diện. Hãy dùng ảnh vật thể gốc, hoặc Khoanh vùng hai góc thật sát vật thể rồi nhận dạng lại.'}
];
export function rankRecognition(output){
 if(!Array.isArray(output)||!output.length)throw Error('AI không trả về kết quả nhận dạng.');
 const ranked=output.map(item=>{const c=CANDIDATES.find(c=>c.prompt===item.label);if(!c||!Number.isFinite(item.score)||item.score<0||item.score>1)throw Error('Kết quả nhận dạng không hợp lệ.');return {...c,score:item.score};}).sort((a,b)=>b.score-a.score);
 return {ranked,uncertain:ranked[0].score<.65||ranked[0].score-(ranked[1]?.score??0)<.2};
}
export function normalizedCrop(a,b){
 const x=Math.min(a[0],b[0]),y=Math.min(a[1],b[1]),w=Math.abs(a[0]-b[0]),h=Math.abs(a[1]-b[1]);
 if(![x,y,w,h].every(Number.isFinite)||x<0||y<0||x+w>1.000001||y+h>1.000001||w<.03||h<.03)throw Error('Vùng chọn quá nhỏ. Hãy chọn hai góc bao quanh vật thể.');return {x,y,w,h};
}
