# Hubbub — Personal Multi-Agent Chat App

Personal desktop AI workspace for learning & research.

## Tech Stack

- **Desktop:** Tauri 2 (Rust)
- **UI:** React 19 + TypeScript + Vite + TailwindCSS
- **Core:** Rust + Tokio (all business logic)
- **Database:** SQLite + FTS5
- **Editor:** Milkdown (WYSIWYG Markdown)

## Getting Started

### Prerequisites

- Rust (stable MSVC toolchain)
- Node.js >= 20
- Visual Studio 2022 (Desktop C++ workload)
- Tauri CLI: `cargo install tauri-cli`

### Development

```bash
# Install dependencies
cd apps/desktop && npm install

# Run dev mode
just dev

# Run tests
just test

# Build release
just build
```

## Documentation

All project documentation is in `docs/`:

- [Master Plan](docs/MASTER_PLAN.md) — Overall development plan
- [Decision Log](docs/DECISION_LOG.md) — All important decisions (mandatory updates)
- [Architecture](docs/ARCHITECTURE.md) — System architecture details
- [Testing Guide](docs/TESTING_GUIDE.md) — How to write tests
- [AI Workflow](docs/AI_WORKFLOW.md) — AI-assisted development process
- [Threat Model](docs/THREAT_MODEL.md) — Security threat analysis

## License

Private — All rights reserved.
