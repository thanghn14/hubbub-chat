# ADR-0001: Tauri 2 + React for Desktop UI

## Trạng thái
Đã chấp nhận — 2026-10-02

## Bối cảnh
Chúng ta cần xây dựng một ứng dụng Desktop cho dự án Hubbub. Cần xem xét các nền tảng: Electron, Flutter, và Tauri. Ứng dụng này sẽ cung cấp một môi trường chat đa tác nhân (Multi-Agent), nơi hiệu năng bộ nhớ và dung lượng lưu trữ là rất quan trọng để dành tài nguyên cho các models cục bộ.

## Quyết định
Sử dụng **Tauri 2** làm nền tảng ứng dụng. Phần giao diện UI sẽ được xây dựng với **React 19 + TypeScript + Vite**.

## Lý do
* **Kích thước nhẹ & Ít RAM:** Bundle ứng dụng rất nhỏ và tiêu thụ ít RAM hơn so với Electron (khi được tối ưu hóa).
* **Ecosystem mạnh:** React có hệ sinh thái tốt nhất cho việc phát triển Markdown editor mạnh mẽ (đặc biệt là thư viện Milkdown).
* **Cộng đồng:** Cộng đồng React và Tauri đang rất lớn.
* **WebView2:** Tận dụng được WebView2 đã được tích hợp sẵn trên Windows (OS chính của người dùng hiện tại).

## Phương án đã loại
* **Electron:** Quá nặng, ngốn nhiều RAM (do nhúng Chromium Node).
* **Flutter:** Thiếu các công cụ mạnh mẽ hỗ trợ xử lý Markdown phức tạp giống hệ sinh thái web.

## Hệ quả
* Phải chủ động tìm các giải pháp tối ưu RAM cho WebView2.
* Việc giao tiếp phải đi qua cầu nối IPC (Inter-Process Communication) của Tauri.
## Kết quả Nghiệm thu Gate 0 (Thực tế trên Windows)
- **Hubbub Rust Core:** Chỉ chiếm **~3.2 MB** RAM (cực kỳ nhẹ và tối ưu).
- **Tổng dung lượng bộ nhớ (Hubbub + WebView2 runtime):** Đạt khoảng **~180 MB** RAM ở chế độ dev (với 1.000 tin nhắn ảo hóa và Milkdown editor). Khi build release đóng gói, mức tiêu thụ dự kiến sẽ giảm thêm 20-40 MB.
- **Đánh giá:** Đạt đúng mục tiêu kỹ thuật đề ra (≤ 180MB). Xác nhận chốt sử dụng **Tauri 2 + React + Rust Core**, không cần kích hoạt phương án dự phòng Flutter.
