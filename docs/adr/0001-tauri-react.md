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
* **Gate 0** sẽ thẩm định (validate) xem quyết định này có thật sự đạt hiệu suất như mong muốn hay không.

## Fallback (Dự phòng)
Nếu Gate 0 thất bại do vấn đề WebView2 hoặc hiệu năng Frontend quá tệ, sẽ chuyển hướng sang dùng **Flutter + flutter_rust_bridge** làm phương án dự phòng.
