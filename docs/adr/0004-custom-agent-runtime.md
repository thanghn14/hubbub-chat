# ADR-0004: Custom Agent Runtime

## Trạng thái
Đã chấp nhận — 2026-10-02

## Bối cảnh
Hệ thống Hubbub đòi hỏi một Agent orchestration framework để xử lý vòng lặp (runtime loop) của các Agent, gọi Tool, và quản lý các sub-agents chuyên biệt. Có nhiều framework có sẵn trên thị trường, nhưng hầu hết dựa trên Python.

## Quyết định
Tự xây dựng hệ thống **Custom Agent Runtime bằng Rust**. Không sử dụng LangGraph hay LangChain. Sẽ tham khảo kiến trúc của hệ thống mã nguồn mở Goose (giấy phép Apache-2.0).

## Lý do
* **Kiểm soát toàn diện:** Làm chủ hoàn toàn luồng thực thi, bao gồm quản lý ngân sách (budget), khả năng hủy sớm (cancel mid-stream), và hệ thống bảo mật nội bộ.
* **Không lệ thuộc Python:** Để giữ ứng dụng nhỏ gọn và đồng nhất tại Core, ta không thể kẹp thêm môi trường Python runtime vào Desktop App.
* **Không bị lock-in:** Tránh việc phụ thuộc chặt chẽ vào cấu trúc đóng của các thư viện agent thương mại/cồng kềnh.
* Code tham khảo từ Goose là chất lượng và được cấp phép mở, có thể ứng dụng ý tưởng tốt.

## Phương án đã loại
* **LangChain / LangGraph (Python):** Bắt buộc phải có Python runtime. Khó đóng gói Desktop.
* **Các Crate Agent Framework bên thứ ba:** Phần lớn cộng đồng Rust cho AI chưa trưởng thành, thường thay đổi breaking change liên tục. Tự viết giúp dễ bảo trì hơn.

## Hệ quả
* Đòi hỏi tốn nhiều thời gian phát triển lúc đầu (Initial work).
* Tuy nhiên, kiến trúc tổng thể về sau sẽ sạch (simpler architecture), dễ bảo trì và dễ audit bảo mật hơn.
