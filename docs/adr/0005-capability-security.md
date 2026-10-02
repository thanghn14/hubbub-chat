# ADR-0005: Capability-based Security

## Trạng thái
Đã chấp nhận — 2026-10-02

## Bối cảnh
Hubbub là một app đa tác nhân chạy trên máy cục bộ của người dùng. Các Agents cần được cấp quyền (capabilities) để thao tác tập tin, đọc nội dung web, hoặc dùng Model Context Protocol (MCP). Tuy nhiên, vì agent hoạt động bán tự động và có thể bị lừa (prompt injection) để phá hoại, ta cần một lớp kiểm soát truy cập siêu nghiêm ngặt.

## Quyết định
Sử dụng mô hình bảo mật **Capability-based security** kết hợp với một **Policy Engine** (bao gồm PathGuard và UrlGuard).

## Lý do
* **Least Privilege:** Nguyên tắc đặc quyền tối thiểu, các Agent mặc định không thể thực thi tool nào nếu không được định nghĩa cấp phép.
* **Explicit Grants:** Mọi quyền phải được xác định rõ ràng tại thời điểm gọi, bị giới hạn phạm vi chặt chẽ.
* **Human-in-the-loop:** Đối với những công việc nguy hiểm hoặc gây phá hủy dữ liệu (VD: Xóa thư mục), hệ thống bắt buộc người dùng xác nhận thông qua UI trước khi cấp quyền.
* Mô hình này tách biệt rạch ròi logic bảo vệ khỏi LLM, không bắt LLM phải tự nhận biết cái nào an toàn hay không.

## Phương án đã loại
* **Nhờ LLM tự kiểm duyệt:** Mô hình ngôn ngữ rất dễ bị bypass bằng jailbreak/prompt injection, hoàn toàn không đủ độ tin cậy để tự giữ bảo mật.
* **Sandboxing ở cấp độ OS (Docker/VM):** Quá phức tạp và nặng nề để thiết lập cho một ứng dụng chat Desktop chạy native.

## Hệ quả
* Tất cả tool calls đi vào hay đi ra đều phải đi qua chốt chặn bảo mật (Security checks).
* Có thể làm tăng nhẹ độ trễ (latency), nhưng bù lại mang đến một sự an toàn gần như tuyệt đối với các cuộc tấn công thông thường.
* Dev phải vất vả hơn khi tích hợp tool mới vì phải qua thủ tục xin quyền ở Policy Engine.
