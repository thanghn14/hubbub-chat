# Decision Log — Hubbub

Mọi quyết định quan trọng và thay đổi lớn trong quá trình phát triển **PHẢI** được ghi lại tại đây.
Sắp xếp theo thứ tự thời gian (mới nhất ở trên).

> **QUY TẮC:** PR/commit có thay đổi quan trọng mà KHÔNG cập nhật file này sẽ bị reject.
> Áp dụng cho cả Dev và Agent (AI).

---

## [2026-10-02] Nghiệm thu Gate 0: Chốt Stack Tauri 2 + React + Rust Core

**Bối cảnh:** Cần xác nhận kết quả kiểm thử thực tế về mức tiêu thụ RAM và hiệu năng của ứng dụng trên môi trường Windows 10/11 trước khi chuyển sang Phase 1.

**Quyết định:**
1. **Chính thức chốt stack:** Sử dụng **Tauri 2 + React 19 + TypeScript + Rust Core**. Không cần kích hoạt phương án dự phòng Flutter.
2. **Số liệu kiểm thử thực tế:**
   - Tiến trình **Hubbub Rust Core:** Chỉ chiếm **~3.2 MB** RAM.
   - Toàn bộ ứng dụng (bao gồm các tiến trình WebView2 runtime): Chiếm **~180 MB** RAM khi đang chạy trong môi trường phát triển (có Vite HMR và DevTools đi kèm) cùng lúc với tải 1.000 tin nhắn ảo hóa và Milkdown editor.
   - Mức RAM này đạt đúng ngưỡng mục tiêu (≤ 180MB) và dự kiến sẽ giảm thêm 20-40 MB khi xuất bản bản Release chính thức (strip binary + thin LTO + tối ưu CSS/JS).
3. **Cập nhật ADR-0001:** Bổ sung phần kết quả nghiệm thu Gate 0 vào tài liệu kiến trúc.

**Lý do:** Đáp ứng trọn vẹn tiêu chuẩn về RAM, hiệu năng và kiến trúc phân lớp Clean Architecture.

**Hệ quả:** Hoàn tất toàn bộ Phase 0. Đủ điều kiện khởi động **Phase 1: Chat MVP**.

**Trạng thái:** Đã áp dụng

---

## [2026-10-02] Dọn dẹp Tài liệu & Cập nhật Cấu hình Dự án

**Bối cảnh:** Sau khi tổng hợp thành công `MASTER_PLAN.md` và xây dựng nền tảng Phase 0, các file dự thảo kế hoạch cũ (`Plan_01.md`, `Plan_02.md`, `Plan_03.md`) không còn cần thiết và có thể gây nhiễu cho các Agent/Dev mới. Cần làm sạch thư mục `docs/` và bổ sung danh sách context files trong `.antigravity/config.json`.

**Quyết định:**
1. **Xoá bỏ các bản kế hoạch cũ:** Đã loại bỏ `docs/Plan_01.md`, `docs/Plan_02.md`, `docs/Plan_03.md`. Nguồn sự thật duy nhất về kế hoạch hiện tại là `docs/MASTER_PLAN.md`.
2. **Cập nhật `.antigravity/config.json`:** Khai báo toàn bộ các tài liệu cốt lõi (`MASTER_PLAN.md`, `DECISION_LOG.md`, `ARCHITECTURE.md`, `TESTING_GUIDE.md`, `AI_WORKFLOW.md`, `THREAT_MODEL.md`) làm `context_files` mặc định.
3. **Mở rộng command allowlist:** Bổ sung các lệnh `just`, `cargo nextest/deny`, `npx tauri` vào danh sách tự động duyệt an toàn.

**Lý do:** Giữ thư mục tài liệu tinh gọn, chính xác; giúp các Agent AI mới khi truy cập dự án luôn nạp đúng ngữ cảnh chuẩn hóa mà không bị phân tán bởi các bản nháp cũ.

**Hệ quả:** Thư mục `docs/` chỉ chứa tài liệu chính thức đang có hiệu lực.

**Trạng thái:** Đã áp dụng

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
