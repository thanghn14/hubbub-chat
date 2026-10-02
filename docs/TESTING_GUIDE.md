# Hướng dẫn Kiểm thử (TESTING GUIDE)

Dự án Hubbub đặt ưu tiên cao nhất vào độ ổn định và an toàn thông qua kiểm thử.

## Nguyên tắc Test-first
* Phải viết bài kiểm thử (tests) **TRƯỚC KHI** triển khai mã nguồn.
* Thiết kế API thông qua góc nhìn của test case trước.

## QUY TẮC TỐI QUAN TRỌNG (CRITICAL RULE)
**Luôn ưu tiên xử lý CÁC TRƯỜNG HỢP EDGE CASES PHỔ BIẾN (Common Edge Cases) hơn là các trường hợp hiếm gặp.**
* **Vấn đề (Problem statement):** Các AI agents thường có xu hướng viết test cho các edge cases kỳ lạ, cực hiếm (ví dụ: máy sập nguồn giữa chừng, time travel) trong khi lại bỏ qua các edge cases phổ biến mà người dùng gặp hàng ngày. Điều này làm lãng phí thời gian và không mang lại giá trị thực tiễn.

## Danh sách Kiểm tra Edge Cases Phổ Biến (Checklists)

### 1. Chat/Messages
* [ ] Gửi tin nhắn rỗng (Empty message).
* [ ] Tiếng Việt có dấu (Vietnamese diacritics).
* [ ] Emoji và các ký tự Unicode đặc biệt.
* [ ] Tin nhắn rất dài (Vượt quá context window).
* [ ] Gửi tin nhắn liên tục, dồn dập (Rapid sends).
* [ ] Người dùng hủy (cancel) khi mô hình đang stream response.

### 2. File/Path (Hệ thống tệp)
* [ ] Khoảng trắng trong đường dẫn (Spaces in path).
* [ ] Ký tự tiếng Việt trong tên file/thư mục.
* [ ] Lỗi file không tồn tại (File not found).
* [ ] File đang bị khóa bởi tiến trình khác (File locked).
* [ ] Ổ cứng đầy (Disk full).
* [ ] Truy cập đọc/ghi đồng thời trên cùng một file (Concurrent access).
* [ ] Vượt rào thư mục gốc (Path traversal `../`).
* [ ] Thoát khỏi thư mục thông qua Symlink (Symlink escape).

### 3. Agent/LLM
* [ ] Trả về JSON tool_call không hợp lệ.
* [ ] Gọi API bị timeout.
* [ ] API trả về response rỗng (Empty response).
* [ ] LLM truyền sai kiểu dữ liệu cho tham số (Wrong argument types).
* [ ] Mất kết nối mạng khi đang stream.
* [ ] Vượt quá ngân sách token hoặc chi phí (Budget exceeded).

### 4. Security (Bảo mật)
* [ ] Path traversal (`../../etc/passwd`).
* [ ] Lỗ hổng SSRF (cố gắng truy cập localhost hoặc private IPs).
* [ ] Web response quá lớn (Oversized web response) gây tràn RAM.
* [ ] Prompt injection (Nội dung web cố gắng lừa Agent thực thi công cụ độc hại).

### 5. Database (Cơ sở dữ liệu)
* [ ] Chuỗi rỗng.
* [ ] Lưu trữ và tìm kiếm tiếng Việt trong FTS5.
* [ ] Đọc/Ghi đồng thời gây lock database (Concurrent read/write).
* [ ] Chạy migration trên dữ liệu đã tồn tại lớn mà không làm mất dữ liệu.

## Cấu trúc Kiểm thử (Test Structure)
1. **Unit Tests**: Kiểm thử các hàm đơn lẻ, cấu trúc dữ liệu, các parser độc lập.
2. **Integration Tests**: Kiểm thử sự phối hợp giữa nhiều thành phần (ví dụ: SQLite DB + Repository).
3. **Security Tests**: Kiểm thử các guards (PathGuard, UrlGuard) và mô phỏng các cuộc tấn công đã biết.
4. **E2E Tests**: Tương tác từ giao diện hoặc entrypoint chính đi qua toàn bộ stack.

## Công cụ Kiểm thử (Test Tools)
* `cargo-nextest`: Test runner chính cho Rust (nhanh và mạnh).
* `wiremock`: Mock HTTP servers cho các kiểm thử gọi API (LLM, Web Fetch).
* `insta`: Snapshot testing cho cấu trúc dữ liệu phức tạp.
* `proptest`: Property-based testing (rất tốt cho PathGuard và UrlGuard).
* `testkit` (Crate nội bộ): Cung cấp `FakeLlm` để mô phỏng phản hồi từ LLM mà không tốn tiền API.

## Cách viết một Test tốt
* Sử dụng mô hình **Arrange-Act-Assert** (Chuẩn bị dữ liệu - Thực thi - Kiểm tra kết quả).
* **Test một thứ duy nhất**: Mỗi test case chỉ nên kiểm tra một hành vi logic.
* **Tên test rõ ràng**: Đặt tên mang tính miêu tả (ví dụ: `test_pathguard_rejects_parent_dir_traversal`).

## Quy tắc Hồi quy (Regression Rule)
**Mọi bug fix bắt buộc PHẢI đi kèm với một regression test** để đảm bảo lỗi không tái hiện trong tương lai.
