# ADR-0007: Milkdown WYSIWYG Markdown Editor

## Trạng thái
Đã chấp nhận — 2026-10-02

## Bối cảnh
App cần trình soạn thảo Markdown trong Workspace. Cần quyết định giữa:
1. Textarea + live preview (split view)
2. WYSIWYG editor (Milkdown trên nền ProseMirror)
3. CodeMirror 6 (code editor với Markdown syntax highlighting)

## Quyết định
Sử dụng **Milkdown** cho chế độ soạn thảo WYSIWYG, có thể bổ sung CodeMirror 6 cho chế độ source view.

## Lý do
- Milkdown dựa trên ProseMirror — engine editor đã chứng minh qua nhiều năm.
- Plugin ecosystem: GFM, KaTeX, Mermaid diagrams, code blocks.
- WYSIWYG giúp user thấy kết quả ngay khi gõ, không cần biết cú pháp Markdown.
- Headless design — dễ tuỳ biến theme/style.

## Phương án đã loại
- Textarea + preview: trải nghiệm kém, phải chuyển qua lại 2 panel.
- CodeMirror 6 đơn thuần: tốt cho dev nhưng không friendly cho user thường.
- TipTap: cũng dựa trên ProseMirror nhưng Milkdown có Markdown-first design tốt hơn.

## Hệ quả
- Gate 0 cần validate Milkdown hoạt động tốt trong Tauri WebView2.
- Cần test tiếng Việt (dấu, gõ nhanh) trong editor.
- Thêm dependency ProseMirror ecosystem (~200KB gzipped).
