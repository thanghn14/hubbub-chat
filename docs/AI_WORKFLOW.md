# Quy trình Phát triển Hỗ trợ bởi AI (AI Workflow)

Dự án Hubbub được thiết kế để tối ưu cho việc phát triển bằng các AI Coding Agents.

## Quy trình Contract-first (Contract-first Workflow)
1. **Spec**: Định nghĩa rõ ràng yêu cầu kỹ thuật và input/output.
2. **Trait/Port**: Tạo định nghĩa Interface/Trait trong Rust (ví dụ tại `domain`).
3. **Test Cases**: Viết các unit tests bắt các common edge cases.
4. **AI Implement**: Yêu cầu AI viết code thực thi (implementation) thỏa mãn trait và pass bài test.
5. **CI**: CI chạy tự động lints, clippy, cargo-nextest.
6. **Review**: Xem xét kỹ các tiêu chí an toàn, bảo mật.
7. **Merge**: Tiến hành hợp nhất code.

## Quy tắc Pull Request (PR Rules)
* Tổng dòng code thay đổi trong một PR **≤ 400 lines diff**.
* Luôn phải bao gồm test đi kèm.

## Quy tắc Lập trình Rust cho AI (Rust Coding Rules for AI)
* **Quản lý bộ nhớ**: Ưu tiên sử dụng Owned types kết hợp với `Arc`.
* **Abstraction**: Sử dụng Trait objects tại các Ports (boundary).
* **Async**: Sử dụng thư viện `async-trait`.
* **Đơn giản hóa**: Tránh sử dụng lifetimes phức tạp, macros lồng nhau, hoặc generics quá đà.
* **Kích thước file/hàm**: File không quá 400 dòng, function không quá 60 dòng.

## Cấu hình Lints trong Workspace (Workspace Lints)
Các yêu cầu khắt khe nhằm đảm bảo an toàn, AI không được vi phạm:
* `forbid(unsafe_code)`
* `deny(unwrap_used, expect_used, panic, todo, dbg_macro, await_holding_lock)`
* `clippy -D warnings`

## Danh sách Kiểm tra Code (Review Checklist - 10 Items)
Khi review code (của người hoặc AI), phải check 10 điểm sau:
1. [ ] Không có `unwrap`/`expect` nào bị sót lại?
2. [ ] Không giữ `Mutex::lock` hoặc lock qua các điểm `await`?
3. [ ] Các luồng (tasks) có hỗ trợ `CancellationToken` để dừng an toàn?
4. [ ] Sử dụng Bounded channels (không dùng unbounded gây tốn RAM)?
5. [ ] Xử lý lỗi với đủ Context (Error context)?
6. [ ] Mọi đường dẫn và URL đều đi qua Guards (Path/Url Guard)?
7. [ ] API keys/Secrets không bao giờ bị lộ ra logs hoặc UI?
8. [ ] Các error paths (trường hợp xảy ra lỗi) đã có tests đầy đủ?
9. [ ] Các common edge cases (tiếng Việt, khoảng trắng path...) đã xử lý?
10. [ ] **DECISION_LOG.md đã được cập nhật với quyết định kiến trúc mới chưa?**

## Cross-review bằng AI
Một AI khác (Agent thứ 2) sẽ độc lập kiểm tra (review) code của AI thứ nhất dựa trên Checklist 10 điểm trên, trước khi được phê duyệt bởi con người.

## Kiến thức Rust tối thiểu yêu cầu (Minimum Rust Knowledge Needed)
AI hoặc Lập trình viên mới cần vững các mảng:
* Ownership & Borrowing.
* `Result` và toán tử `?`.
* Quản lý trạng thái đa luồng với `Arc` / `Mutex`.
* Lập trình bất đồng bộ với `async` / `tokio`.

## BẮT BUỘC (MANDATORY)
Mọi thay đổi quan trọng về thiết kế, thư viện, hoặc logic bảo mật phải được ghi lại tại `DECISION_LOG.md`.

## Quy tắc Ưu tiên Lỗi (Bug-first Rule)
Luôn luôn **sửa bugs** trước khi phát triển các tính năng (features) mới. Không chồng chất nợ kỹ thuật (Technical Debt).
