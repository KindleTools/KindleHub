# KindleHub

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

**KindleHub** is a modern, interactive web application designed to transform your Kindle highlights into an organized knowledge base. Built on top of the powerful `kindle-tools-ts` library, it offers a beautiful interface to import, explore, edit, and export your reading insights.

---

## ❓ Why KindleHub?

We read to learn, but often our Kindle highlights remain trapped in a text file (`My Clippings.txt`) or scattered across different apps. KindleHub aims to bridge the gap between **reading** and **knowledge management**.

- **Take Control**: Your data belongs to you. No accounts, no clouds, no subscriptions.
- **Visualize**: See your reading habits and library at a glance.
- **Connect**: Export your notes directly to your "Second Brain" (Obsidian, Joplin, etc.).

## ✨ Features

- **📚 Universal Import**:
  - Drag & drop `My Clippings.txt` directly from your Kindle.
  - Import CSV exports from Amazon or other tools.
  - Import JSON backups for data portability.
- **🔍 Smart Search & Filter**:
  - Full-text fuzzy search across all stats.
  - Filter by Book, Author, Date, or Type (Highlight vs Note).
- **📝 Power Editor**:
  - Fix typos and metadata errors in your original clippings.
  - Batch delete unwanted or accidental highlights.
- **🎨 Beautiful UI**:
  - Clean, distraction-free reading mode.
  - Responsive design that works on tablets and desktop.
  - Built-in Dark Mode.
- **🚀 Advanced Export**:
  - **Obsidian**: Export with YAML frontmatter, valid tags, and configurable file names.
  - **Joplin**: Generate `.jex` archives for native one-click import.
  - **Standard Formats**: Export sanitized JSON, CSV, or Markdown.

## � Project Status & Roadmap

KindleHub is currently in **Active Development**.

- [x] **Project Setup**: Vite + Vue 3 + TypeScript configured.
- [x] **Import System**: Parse TXT, CSV, and JSON files via `kindle-tools-ts`.
- [x] **Database**: Local storage using IndexedDB (Dexie.js).
- [ ] **Data Editor**: Inline editing and data correction.
- [ ] **Library View**: Visual grid of all books with generated covers.
- [ ] **Advanced Search**: Global search with Fuse.js.
- [ ] **Export System**: UI for configuring and running exports to Obsidian/Joplin.
- [ ] **PWA Support**: Offline installation.

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Build Tool**: Vite 7
- **Language**: TypeScript 5+ (Strict Mode)
- **State Management**: Pinia
- **Styling**: Tailwind CSS v3 + Headless UI
- **Database**: Dexie.js (IndexedDB wrapper)
- **Icons**: Lucide Vue
- **Testing**: Vitest + Happy DOM

## 📂 Directory Structure

```
kindle-hub/
├── src/
│   ├── assets/        # Styles and static images
│   ├── components/    # Reusable Vue components
│   │   ├── import/    # Import-specific components
│   │   ├── library/   # Book & Clipping displays
│   │   └── ui/        # Base UI kit (Buttons, Inputs)
│   ├── composables/   # Shared logic (VueUse style)
│   ├── db/            # Database schema and IDB logic
│   ├── pages/         # File-based routing
│   ├── services/      # Business logic & wrappers
│   ├── stores/        # Pinia state stores
│   └── types/         # TypeScript interfaces
├── tests/             # Unit and E2E tests
└── ...config files    # Modern tooling configs
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (recommended)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/KindleTools/KindleHub.git
    cd KindleHub
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    ```

3.  **Start development server**
    ```bash
    pnpm dev
    ```
    The app will run at `http://localhost:5173`.

### Other Commands

- **Build for production**: `pnpm build`
- **Run tests**: `pnpm test:run`
- **Run tests with UI**: `pnpm test:ui`
- **Lint & Fix**: `pnpm lint:fix`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
