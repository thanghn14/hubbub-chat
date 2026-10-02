# ADR-0003: SQLite + FTS5 for Database

## Trạng thái
Đã chấp nhận — 2026-10-02

## Bối cảnh
Dự án yêu cầu một cơ sở dữ liệu nhúng cục bộ (embedded database) trên thiết bị của người dùng để lưu trữ hội thoại, metadata file, cài đặt agent. Đồng thời, do đây là một Personal Chat App, tính năng tìm kiếm văn bản đầy đủ (Full-text search) cho tin nhắn và tài liệu là bắt buộc.

## Quyết định
Sử dụng **SQLite** kết hợp chế độ **WAL (Write-Ahead Logging)** và **FTS5** (Full-Text Search extension). Việc truy xuất DB từ Rust sẽ thông qua **sqlx**.

## Lý do
* **Zero-config & Embedded:** Không yêu cầu người dùng phải cài đặt thêm một service database riêng biệt (tự động chạy chung bộ nhớ với tiến trình Rust core).
* **Độ tin cậy cao:** Đã được kiểm chứng trong ngành phần mềm nhiều thập kỷ qua.
* **FTS5 tích hợp:** Hỗ trợ index văn bản và tìm kiếm nhanh mà không cần dịch vụ thứ ba.
* Chế độ **WAL mode** giúp xử lý tính đồng thời (Concurrency) tốt hơn, chống khóa DB khi đọc/ghi cùng lúc.

## Phương án đã loại
* **Qdrant:** Quá nặng (quá mức cần thiết) cho các yêu cầu cơ bản lúc đầu. Sẽ xem xét ở v2 nếu làm RAG mạnh.
* **PostgreSQL:** Phải cài đặt Server (client-server model), không phù hợp cho Desktop App cá nhân nhỏ gọn.
* **Dedicated vector DB:** Phiên bản 1.0 (v1) hiện chưa cần tới tính năng semantic search thông qua vector DB.

## Hệ quả
* Cần kiểm thử cẩn thận vấn đề khóa đồng thời (Concurrent read/write lock) ngay cả khi đã bật WAL.
* Vấn đề tìm kiếm FTS5 hỗ trợ dấu Tiếng Việt cần được kiểm tra kỹ.
