# Lắp Ráp — Tác giả: Huỳnh Cỏ Khô

Ứng dụng GitHub Pages thuần HTML/CSS/JavaScript, không cần máy chủ hay khóa API. Ảnh tải lên được xử lý trong trình duyệt, không gửi lên GitHub. Phông chữ và nền được tải từ Google Fonts và kho ảnh của tác giả.

## Sử dụng

1. Tải ảnh vật thể hoặc ảnh đã trải phẳng.
2. Chọn kiểu cấu trúc: hộp nắp liền, hộp chữ nhật, hình trụ, hình nón.
3. Đánh dấu hai đầu cạnh A/B/C trên ảnh để lấy **tỷ lệ chiếu** hoặc nhập tỷ lệ thủ công.
4. Chọn cạnh chuẩn và nhập độ dài thực, mặc định cm. Đổi đơn vị sẽ giữ nguyên kích thước vật lý.
5. Kiểm tra bản trải, xuất SVG có kích thước mm hoặc in PDF nhiều trang A4 ở 100%. Ghép các trang theo tọa độ hàng/cột, cắt bỏ lề giấy. Ô chuẩn phải dài 10 mm.

## Giới hạn cần hiểu

Một ảnh chụp không đủ khôi phục duy nhất cấu trúc 3D, các mặt khuất hoặc các tai/khe khóa. Đây là công cụ dựng bản trải hình học có người dùng xác nhận, **AI chỉ gợi ý nhóm cấu trúc được hỗ trợ, không khôi phục vật bất kỳ**. Đo pixel trên ảnh nghiêng không phải độ dài thực; chưa hiệu chỉnh phối cảnh. Ảnh H1/H2 là ví dụ yêu cầu, không được công khai trong repo. Mẫu hộp nắp liền chỉ gần kiểu cấu trúc, không sao chép chính xác H2. Chưa bù độ dày bìa, dung sai, khe khóa; mẫu trụ/nón chưa có tai nối đáy. Luôn thử trên giấy trước khi gia công.

Cạnh A là chiều dài (đường kính cho trụ/nón), B là chiều rộng, C là chiều cao. B không dùng cho trụ/nón. Tệp dự án JSON lưu cấu hình, không lưu ảnh riêng tư.

## Phát triển

`npm test` kiểm tra hình học, tỷ lệ, đơn vị và kích thước xuất. `npm start` mở máy chủ tại http://localhost:4173. Không cần cài dependency.

GitHub Pages phục vụ nhánh `main`, thư mục `/`. Bản SVG sử dụng đơn vị mm; trình in cần đặt kích thước thực/100%, tắt fit-to-page và header/footer.


## Nhận dạng ảnh trên thiết bị

Tải ảnh → (tùy chọn) khoanh hai góc vùng vật thể → Nhận dạng ảnh bằng AI → kiểm tra nhóm gợi ý → Dùng cấu trúc này → nhập/đo kích thước → xuất SVG/PDF.

- Chạy CLIP `Xenova/clip-vit-base-patch32` bằng Transformers.js 3.8.1, WASM q8 trong Web Worker; không chặn thao tác chính. Tải mã thư viện từ jsDelivr và mô hình từ Hugging Face lần đầu (khoảng 150–200 MB, lưu cache tùy trình duyệt). Không cần API key hoặc backend. Ảnh đưa vào mô hình từ canvas cục bộ, không tải lên dịch vụ nhận dạng.
- Các nhóm: hộp chữ nhật, hộp nắp liền, trụ, nón, khay/hót rác; thêm nhóm cong phức tạp, thiết bị và cảnh nền để người dùng biết khi không có mẫu phù hợp. Đây là phân loại giữa các mô tả ứng viên, không phải phát hiện mọi vật thể. Điểm là tương đối giữa nhóm, không phải xác suất chính xác. AI có thể nhầm nón và khay hoặc nhầm hình in trên bao bì; kiểm tra các lựa chọn và vùng ảnh.
- Kết quả không tự đổi bản vẽ hay kích thước. Nút xác nhận chỉ chọn cấu trúc. Các kích thước cũ giữ nguyên và có cảnh báo chưa đo. Không suy chiều sâu, mặt khuất hoặc kiểu khóa từ AI.
- Khay/hót rác: A là ngang miệng, B là sâu đáy, C là cao vách sau. Mẫu ghép gồm đáy chữ nhật, vách sau chữ nhật, hai vách tam giác, mép xúc và hai dải dán góc rời. Gấp đôi dải nối theo chiều dài để dán vách sau với hông. Chưa có cán, góc bo hay mô phỏng độ dày.
- Dừng nhận dạng sẽ hủy Worker. Có thể thử lại khi lỗi tải mạng, WASM hoặc hết bộ nhớ. Sau 10 phút không có kết quả, ứng dụng ngừng chờ và cho thử lại; không đưa ra kết quả nhận dạng giả.

Tài liệu: https://huggingface.co/docs/transformers.js/api/pipelines


### Khối tam giác và chống chọn nhầm mặc định

Có thêm lăng trụ tam giác cân (A: đáy tam giác; B: cao tam giác; C: dài lăng trụ) và chóp tam giác đều (A: cạnh đáy; C: cao vuông góc; B không dùng). Đây là hình học lý tưởng, không tự khôi phục vật gói lá cong/méo hoặc tam giác lệch bất kỳ. Mẫu có dải nối rời với đường gấp giữa; chưa bù độ dày.

Ảnh mới phải được xác nhận kiểu khối trước khi hiện bản trải và xuất tệp. Có thể xác nhận gợi ý AI hoặc chọn kiểu thủ công. Điểm đầu dưới 65% hoặc chênh hai nhóm đầu dưới 20 điểm phần trăm sẽ để lựa chọn trống và khóa nút dùng gợi ý đến khi người dùng chọn lại. Các ngưỡng này chỉ là quy tắc giao diện; điểm so khớp không phải xác suất chính xác. Có nhóm ảnh chụp màn hình: dùng ảnh gốc hoặc khoanh sát vật thể; khung giao diện có thể khiến AI đoán thành hộp.


### Đa giác đều 3–12 cạnh

Lăng trụ và chóp có đáy đa giác đều 3–12 cạnh. Chọn số cạnh ở ô Số cạnh đáy; A là một cạnh đa giác (không phải đường kính), C là chiều cao vuông góc, B không dùng. AI có nhóm gợi ý ngũ giác/lục giác/bát giác và chóp đáy vuông; các số cạnh còn lại có thể chọn thủ công. Chưa hỗ trợ tự suy đa giác không đều hoặc mặt cong bất kỳ. Không xem việc thêm nhóm phân loại là bảo đảm độ chính xác: cần ảnh gốc/khoanh vùng và xác nhận kết quả.
