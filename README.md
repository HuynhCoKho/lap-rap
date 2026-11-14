# Lắp Ráp — Tác giả: Huỳnh Cỏ Khô

Ứng dụng GitHub Pages thuần HTML/CSS/JavaScript, không cần máy chủ hay khóa API. Ảnh tải lên được xử lý trong trình duyệt, không gửi lên GitHub. Phông chữ và nền được tải từ Google Fonts và kho ảnh của tác giả.

## Sử dụng

1. Tải ảnh vật thể hoặc ảnh đã trải phẳng.
2. Chọn kiểu cấu trúc: hộp nắp liền, hộp chữ nhật, hình trụ, hình nón.
3. Đánh dấu hai đầu cạnh A/B/C trên ảnh để lấy **tỷ lệ chiếu** hoặc nhập tỷ lệ thủ công.
4. Chọn cạnh chuẩn và nhập độ dài thực, mặc định cm. Đổi đơn vị sẽ giữ nguyên kích thước vật lý.
5. Kiểm tra bản trải, xuất SVG có kích thước mm hoặc in PDF nhiều trang A4 ở 100%. Ghép các trang theo tọa độ hàng/cột, cắt bỏ lề giấy. Ô chuẩn phải dài 10 mm.

## Giới hạn cần hiểu

Một ảnh chụp không đủ khôi phục duy nhất cấu trúc 3D, các mặt khuất hoặc các tai/khe khóa. Đây là công cụ dựng bản trải hình học có người dùng xác nhận, **không có AI tự nhận dạng vật bất kỳ**. Đo pixel trên ảnh nghiêng không phải độ dài thực; chưa hiệu chỉnh phối cảnh. Ảnh H1/H2 là ví dụ yêu cầu, không được công khai trong repo. Mẫu hộp nắp liền chỉ gần kiểu cấu trúc, không sao chép chính xác H2. Chưa bù độ dày bìa, dung sai, khe khóa; mẫu trụ/nón chưa có tai nối đáy. Luôn thử trên giấy trước khi gia công.

Cạnh A là chiều dài (đường kính cho trụ/nón), B là chiều rộng, C là chiều cao. B không dùng cho trụ/nón. Tệp dự án JSON lưu cấu hình, không lưu ảnh riêng tư.

## Phát triển

`npm test` kiểm tra hình học, tỷ lệ, đơn vị và kích thước xuất. `npm start` mở máy chủ tại http://localhost:4173. Không cần cài dependency.

GitHub Pages phục vụ nhánh `main`, thư mục `/`. Bản SVG sử dụng đơn vị mm; trình in cần đặt kích thước thực/100%, tắt fit-to-page và header/footer.
