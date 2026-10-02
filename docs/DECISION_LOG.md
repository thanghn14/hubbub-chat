# Decision Log — Hubbub

Mọi quyết định quan trọng và thay đổi lớn trong quá trình phát triển **PHẢI** được ghi lại tại đây.
Sắp xếp theo thứ tự thời gian (mới nhất ở trên).

> **QUY TẮC:** PR/commit có thay đổi quan trọng mà KHÔNG cập nhật file này sẽ bị reject.
> Áp dụng cho cả Dev và Agent (AI).

---

## [2026-10-02] Hoàn thành Phase 0 Nền móng & Chuẩn bị Spike Gate 0

**Bối cảnh:** Cần dựng nền tảng monorepo (Rust workspace + Tauri 2 React app), hệ thống tài liệu tiêu chuẩn, và ứng dụng Gate 0 Spike để xác thực các tiêu chí kỹ thuật cốt lõi (gõ tiếng Việt, RAM WebView2, tải 1.000 tin nhắn, Milkdown editor).

**Quyết định:**
1. **Khởi tạo Rust Workspace:** Gồm 11 crates (`domain`, `policy`, `agent`, `llm`, `tools`, `mcp`, `store`, `workspace`, `vault`, `app`, `testkit`) và ứng dụng shell `hubbub-desktop` (Tauri 2).
2. **Thiết lập quy chuẩn code:** Khóa toolchain `rust-toolchain.toml`, `rustfmt.toml`, cấu hình `deny.toml` chặn copyleft/vulnerability, lints nghiêm ngặt ở cấp workspace (`forbid(unsafe_code)`, `deny(unwrap_used, expect_used, panic)`).
3. **Hoàn thiện tài liệu:** `ARCHITECTURE.md`, `TESTING_GUIDE.md` (chú trọng common edge cases), `AI_WORKFLOW.md`, `THREAT_MODEL.md`, và 7 bản ADR (`0001` đến `0007`).
4. **Xây dựng Gate 0 Spike App:** Ứng dụng tương tác đầy đủ 5 bài test (Gõ tiếng Việt, Virtualized 1.000 tin nhắn với `@tanstack/react-virtual`, Stream mô phỏng 50t/s, Milkdown WYSIWYG editor trên nền ProseMirror, Scorecard tổng hợp).
5. **Cấu hình CI & Task Runner:** Tạo `justfile` và workflow `.github/workflows/ci.yml`.

**Lý do:** Đảm bảo toàn bộ workspace compile sạch sẽ, cấu trúc phân lớp Clean Architecture được tuân thủ tuyệt đối, sẵn sàng chạy kiểm thử thực tế trên máy người dùng trước khi code tính năng Phase 1.

**Hệ quả:** Có thể khởi chạy `npm run tauri dev` ngay để thực hiện các bài test Gate 0.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Chốt Master Plan v1.0

**Bối cảnh:** Dự án Hubbub cần một kế hoạch phát triển tổng thể thống nhất. Đã có 3 bản kế hoạch riêng biệt (Plan_01, Plan_02, Plan_03) với các hướng tiếp cận khác nhau.

**Quyết định:** Tạo MASTER_PLAN.md tổng hợp, kế thừa:
- Kiến trúc Clean/Hexagonal sâu từ Plan 02
- Tính thực tế, Gate 0, và quy trình AI-assisted từ Plan 03
- Loại bỏ kiến trúc Python sidecar từ Plan 01

**Các quyết định con:**
1. **Stack chính:** Tauri 2 + React + Rust Core (Gate 0 validate, fallback Flutter)
2. **Agent framework:** Tự viết bằng Rust (không dùng LangGraph/LangChain)
3. **Database:** SQLite + FTS5 (không vector DB ở v1)
4. **Voice:** Loại bỏ hoàn toàn khỏi v1 — tránh phức tạp không cần thiết
5. **Testing:** Test-first, ưu tiên common edge cases, danh sách cụ thể trong TESTING_GUIDE
6. **Decision Log:** Bắt buộc cập nhật mỗi khi có quyết định/thay đổi quan trọng
7. **Bug-first:** Luôn fix bug/vấn đề tiềm ẩn trước khi phát triển tính năng mới

**Lý do:** Cần kế hoạch khả thi cho 1 developer với AI hỗ trợ, kiến trúc tốt ngay từ đầu, dễ mở rộng, có tài liệu đầy đủ cho Dev/Agent mới tiếp cận.

**Hệ quả:** Bắt đầu Phase 0 (Foundation + Gate 0). Mọi thay đổi kiến trúc/stack phải viết ADR.

**Trạng thái:** Đã áp dụng
