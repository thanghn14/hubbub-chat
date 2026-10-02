# Mô hình Đe dọa (Threat Model v0)

Vì Hubbub là một hệ thống đa tác vụ (Multi-Agent System) có quyền truy cập vào file và internet của người dùng, vấn đề bảo mật là tối quan trọng. Dưới đây là mô hình đe dọa phiên bản 0.

## 1. Tài sản Cần Bảo vệ (Assets to protect)
* Dữ liệu riêng tư của người dùng.
* API Keys (OpenAI, Anthropic, ...).
* Local files và cấu trúc hệ thống tập tin (File System).
* System integrity (Tính toàn vẹn của hệ điều hành, tránh mã độc).

## 2. Các Tác nhân Đe dọa (Threat actors)
* Nội dung web độc hại (Malicious web content) được agent tải về.
* Prompt injection (Tác nhân từ tin nhắn người dùng hoặc file bên ngoài).
* Máy chủ MCP bị xâm nhập (Compromised MCP server).

## 3. Bề mặt Tấn công (Attack surfaces)
* Hệ thống thực thi công cụ của LLM (LLM tool calls).
* Trình xử lý đọc/tải nội dung web.
* Các thao tác đọc/ghi file trên OS.
* Các công cụ (tools) cung cấp qua giao thức MCP.

## 4. Bảng Đe dọa và Biện pháp Giảm thiểu (Threats and mitigations)

| Đe dọa (Threat) | Bề mặt Tấn công | Biện pháp Giảm thiểu (Mitigation) |
| :--- | :--- | :--- |
| **Path Traversal** | File operations | **PathGuard**: Yêu cầu canonicalize đường dẫn. Khóa tuyệt đối `..`. Ngăn symlink escape. Cấm thao tác UNC/ADS trên Windows. |
| **SSRF** | Web ingestion | **UrlGuard**: Phân giải DNS. Block các private IPs (10.0.0.0/8, 127.0.0.1, v.v.). Kiểm tra URL redirect. Áp dụng limits về kích thước (size) và timeout. |
| **Prompt Injection** | LLM Tool Calls | **Policy Engine** viết bằng Rust (Không phụ thuộc LLM). Đánh dấu rõ nội dung Untrusted. Sử dụng bộ test `FakeLlm` liên tục để mô phỏng injection. |
| **Secret Leakage** | Cấu hình, Logs | Keyring OS. Giao diện dạng Write-only UI. Đảm bảo secrets không bao giờ được in ra (logs) hoặc chèn vào agent context. |
| **MCP Abuse** | MCP Tools | Khóa phiên bản (Pin version). Cô lập biến môi trường (Env isolation). Mặc định vô hiệu hóa, chỉ bật khi có sự cho phép rõ ràng từ người dùng (Permission required). |
| **Agent Self-modification** | File operations | Thư mục `agents/` bị khóa bất biến (Immutable), các tool của Agent không có quyền sửa đổi mã nguồn và file cấu hình của chúng. |

## 5. Nguyên tắc Bảo mật (Security Principles)
1. **Least Privilege**: Cấp quyền thấp nhất, ít nhất có thể.
2. **Explicit Capability**: Mọi capabilities phải được định nghĩa tường minh.
3. **Human-in-the-loop**: Các hành động phá hủy hoặc rủi ro cao bắt buộc phải có sự xác nhận của người dùng.

## 6. Chiến lược Kiểm thử Bảo mật (Testing Strategy)
* **FakeLlm Injection Tests**: Dùng mô hình mock để ném các mã độc (prompt injection payloads) vào hệ thống và đảm bảo Tool Gateway từ chối thực thi.
* **Proptest for Guards**: Sử dụng generative testing để test tự động hàng ngàn chuỗi path/url ngẫu nhiên nhắm vào PathGuard và UrlGuard.
* **Battery Tests**: Bộ kiểm thử chạy thường xuyên trên môi trường tích hợp.
