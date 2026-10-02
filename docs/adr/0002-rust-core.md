# ADR-0002: Rust Core for Business Logic

## Trạng thái
Đã chấp nhận — 2026-10-02

## Bối cảnh
Toàn bộ logic nghiệp vụ, quản lý agent, bảo mật và kết nối CSDL cần một nền tảng vững chắc, hiệu suất cao và có khả năng tương thích nền tảng chéo (cross-platform). Đặc biệt, trong tương lai, ứng dụng có thể được đưa lên nền tảng di động (Android).

## Quyết định
Sử dụng **Rust + Tokio** cho toàn bộ logic lõi (Core logic). Lớp giao diện (UI) chỉ đóng vai trò là một lớp vỏ (thin shell) mỏng nhận dữ liệu và hiển thị.

## Lý do
* **An toàn bộ nhớ (Memory safety):** Tránh hoàn toàn lỗi segfault và race condition.
* **Hiệu suất cực cao:** Tối ưu hóa tối đa thời gian phản hồi cho hệ thống agent thời gian thực.
* **Platform-neutral:** Dễ dàng biên dịch chéo (cross-compile) cho Windows, macOS, Linux, và sau này là Android/iOS.
* **Strong Type System:** Giúp phát hiện sớm đa số các lỗi logic ngay tại thời điểm compile.

## Phương án đã loại
* **NodeJS (TypeScript):** Dễ bị rò rỉ bộ nhớ, đa luồng phức tạp, khó nhúng vào thiết bị di động với tài nguyên hạn hẹp.
* **Python:** Dễ viết cho AI nhưng khó khăn để đóng gói một ứng dụng Desktop hoàn chỉnh (installer) mà không làm phình dung lượng.

## Hệ quả
* **Đường cong học tập dốc (Steeper learning curve):** Việc làm quen với Rust, Ownership và async khó khăn hơn.
* **Giảm thiểu rủi ro:** Sẽ sử dụng AI hỗ trợ (AI-assisted) kết hợp với các bộ lints (clippy khắt khe) để giảm thiểu khó khăn trong việc code Rust.
