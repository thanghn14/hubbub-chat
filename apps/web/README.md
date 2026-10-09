# Hubbub Chat — Official Landing Page & Web Studio

> **The Sovereign Multi-Agent AI Studio for Deep Research.**  
> Official branding website and landing page for **Hubbub Chat**, built with React 19, TypeScript, Tailwind CSS v4, and Vite.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-v8.3-646cff.svg)](https://vitejs.dev/)

---

## 🌟 Highlights & Capabilities

- **Asymmetric Split Hero**: Clean value proposition alongside an interactive Hubbub Chat Studio Canvas preview with live scenario switches (SLM Benchmarks, Security Audit, Mamba-2 Context).
- **Interactive Multi-Agent Simulator**: Visual step-by-step DAG orchestration playground demonstrating how Orchestrator, Researcher, Librarian, and Tutor collaborate under strict Rust Policy Gate verifications.
- **Bento Grid Architecture**: 6 core technology showcases covering Native Rust Security, Tauri 2 RAM efficiency (< 30MB), Milkdown WYSIWYG Workspace, Deterministic Run/Step/Trace Engine, Sub-ms SQLite FTS5 search, and Model Sovereignty (Ollama + BYOK).
- **Interactive Security Pipeline**: 5-layer visualizer displaying real Rust code snippets from `crates/policy` and `crates/tools` with `#![forbid(unsafe_code)]` invariants.
- **Transparent Comparison Matrix**: Feature comparison between Hubbub Chat, Cloud Web Chatbots, and Electron AI Wrappers.
- **Direct Verified Releases**: Serves built Windows release packages directly (`.msi`, `.exe`, `.zip`) with exact SHA-256 cryptographic checksums.
- **Comprehensive FAQ**: Accordions addressing data sovereignty, GPU requirements, offline local models, and Apache 2.0 licensing.
- **Bilingual i18n (EN / VI)**: 100% complete symmetric translations between English and Vietnamese, defaulting to English with instantaneous switching.
- **Light & Dark Mode**: Seamless visual ergonomics with automatic `theme-color` meta synchronization for mobile devices.
- **Industry Standards**: WCAG 2.1 AA accessible (keyboard navigation, skip link, ARIA tabs/accordions, focus-visible outlines) and Schema.org `SoftwareApplication` JSON-LD SEO structured metadata.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `pnpm` / `yarn`

### Installation

```bash
git clone https://github.com/thanghn14/hubbub-chat-landing.git
cd hubbub-chat-landing
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

Visit `http://localhost:3000` (or the port specified by Vite) in your browser.

### Production Build

Compile TypeScript and build the optimized production assets:

```bash
npm run build
```

Production output will be generated in `dist/`.

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
├── public/
│   ├── downloads/               # Direct Windows release binaries (.msi, .exe, .zip)
│   └── favicon.svg              # Bespoke vector logo favicon
├── src/
│   ├── components/
│   │   ├── AgentOrchestrationDemo.tsx # Interactive 4-agent stepper
│   │   ├── BentoFeatures.tsx          # 6-pillar feature grid
│   │   ├── ComparisonTable.tsx        # Responsive semantic comparison
│   │   ├── DownloadSection.tsx        # Release downloads & SHA-256 verification
│   │   ├── FaqSection.tsx             # Accessible FAQ accordion
│   │   ├── Footer.tsx                 # Brand footer & privacy links
│   │   ├── HeroSection.tsx            # Hero banner & live studio canvas
│   │   ├── Logo.tsx                   # Vector brand logo component
│   │   ├── Navbar.tsx                 # Responsive header with theme/lang toggle
│   │   └── SecurityArchitecture.tsx   # 5-layer Rust pipeline visualizer
│   ├── context/
│   │   ├── LanguageContext.tsx        # i18n context definition
│   │   ├── LanguageProvider.tsx       # Language state & <html> lang synchronization
│   │   └── ThemeContext.tsx           # Light/Dark mode state & meta tag synchronization
│   ├── utils/
│   │   └── translations.ts            # Symmetric English & Vietnamese dictionaries
│   ├── App.tsx                        # Main application layout with WCAG skip link
│   ├── index.css                      # Tailwind CSS v4 directives & custom utilities
│   └── main.tsx                       # React root entrypoint
├── index.html                         # Schema.org JSON-LD, OpenGraph & meta headers
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🌐 Deployment

This project is ready for one-click deployment on:

- **Vercel**: Import repository, framework preset *Vite*, build command `npm run build`, output directory `dist`.
- **Cloudflare Pages**: Framework preset *Vite*, build command `npm run build`, output directory `dist`.
- **Netlify**: Build command `npm run build`, publish directory `dist`.
- **GitHub Pages**: Deploy `dist/` directory via GitHub Actions workflow.

---

## 📜 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

## 👤 Author

- **thanghn** — [GitHub (@thanghn14)](https://github.com/thanghn14)
