# ADR-0006: Workspace Markdown as Source of Truth

## Trạng thái
Đã chấp nhận — 2026-10-02

## Bối cảnh
App cần quản lý tài liệu Markdown (báo cáo, ghi chú) do Agent tạo ra. Cần quyết định nơi lưu trữ chính thức (source of truth) cho nội dung tài liệu.

## Quyết định
- File Markdown trên filesystem (Workspace/) là source of truth cho nội dung.
- SQLite chỉ lưu metadata (id, path, title, tags, hash, timestamps).
- Chỉ mục (FTS5) luôn có thể dựng lại từ Workspace.

## Lý do
- Plain Markdown files tương thích với mọi công cụ (Obsidian, VS Code, Git...).
- User có thể sync bằng Git/OneDrive/Syncthing mà không cần app.
- Sửa file ngoài app → watcher reindex tự động.
- Không lock-in dữ liệu trong database.

## Phương án đã loại
- Lưu nội dung trong SQLite BLOB: mất khả năng tương thích với công cụ bên ngoài.
- Chỉ lưu trên filesystem không có index: không search được.

## Hệ quả
- Cần file watcher (notify) để phát hiện thay đổi ngoài app.
- Cần atomic write (tmp → fsync → rename) để tránh corrupt.
- Cần .versions/ để auto-versioning.
- Front matter phẳng trong mỗi file để lưu metadata inline.
