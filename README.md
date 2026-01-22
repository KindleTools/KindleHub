# KindleHub

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Vue](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)

**KindleHub** is a modern web application that transforms your Kindle highlights into an organized, searchable knowledge base. Built as a showcase for the [kindle-tools-ts](https://github.com/KindleTools/kindle-tools-ts) library, it provides a beautiful interface to import, explore, edit, and export your reading insights.

## Why KindleHub?

Kindle highlights often remain trapped in `My Clippings.txt` or scattered across apps. KindleHub bridges the gap between **reading** and **knowledge management**.

- **Your Data, Your Control**: 100% client-side. No accounts, no cloud, no subscriptions.
- **Visualize**: See your library and reading habits at a glance.
- **Connect**: Export directly to your "Second Brain" (Obsidian, Joplin, etc.).

---

## Features

### Import
- Drag & drop `My Clippings.txt` directly from your Kindle
- Import CSV exports from Amazon or other tools
- Import JSON backups for data portability
- Automatic format detection

### Library & Visualization
- Beautiful book cards with generated gradient covers
- Book detail view with all clippings
- Color-coded clipping types (highlights, notes, bookmarks)
- Real-time statistics

### Search & Filter
- Full-text fuzzy search powered by Fuse.js
- Filter by book, author, type, or date range
- Search term highlighting in results
- Collapsible filter panel

### Power Editor
- Inline editing of all clipping fields
- Multi-select with bulk actions (delete, duplicate)
- Add new clippings manually
- Real-time database sync

### Export
- **Obsidian**: YAML frontmatter, valid tags, configurable filenames
- **Joplin**: Native `.jex` archives for one-click import
- **Standard Formats**: Markdown, JSON, CSV, HTML
- Live preview before downloading
- Folder structure visualization for multi-file exports

### Settings
- Dark/Light mode with system preference detection
- Export preferences (format, metadata, grouping)
- Full data backup to JSON
- Data management (clear all, restore defaults)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Vue 3.5+ (Composition API, `<script setup>`) |
| **Build Tool** | Vite 7+ |
| **Language** | TypeScript 5.9+ (Strict Mode) |
| **Routing** | Vue Router 4+ (File-based with unplugin-vue-router) |
| **State** | Pinia 3+ |
| **Styling** | Tailwind CSS 3.4+ |
| **UI Components** | Headless UI |
| **Icons** | Lucide Vue Next |
| **Database** | Dexie.js 4+ (IndexedDB) |
| **Search** | Fuse.js 7+ |
| **Core Engine** | kindle-tools-ts 0.5.0 |
| **Testing** | Vitest 4+ |
| **Linting** | ESLint 9+ |

---

## Project Structure

```
kindle-hub/
├── src/
│   ├── components/
│   │   ├── books/        # BookCard, BookList
│   │   ├── clippings/    # ClippingCard, ClippingList
│   │   ├── editor/       # DataTable
│   │   ├── export/       # ExportPanel, FormatPicker
│   │   └── layout/       # AppHeader, AppFooter
│   ├── composables/      # useDataEditor, useSearch
│   ├── db/               # Dexie schema
│   ├── pages/            # File-based routing
│   │   ├── index.vue     # Dashboard
│   │   ├── library.vue   # All books
│   │   ├── import.vue    # Import page
│   │   ├── export.vue    # Export panel
│   │   ├── editor.vue    # Data editor
│   │   ├── search.vue    # Global search
│   │   ├── settings.vue  # Preferences
│   │   └── books/[id].vue # Book detail
│   ├── services/         # parser, export, db services
│   ├── stores/           # Pinia stores
│   └── types/            # TypeScript interfaces
├── tests/
│   └── unit/             # Vitest unit tests
└── ...config files
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0 (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/KindleTools/KindleHub.git
cd KindleHub

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will run at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test:run` | Run tests once |
| `pnpm test:ui` | Run tests with UI |
| `pnpm lint` | Check for linting errors |
| `pnpm lint:fix` | Fix linting errors |

---

## Project Status

**Current**: MVP Functional (~95% complete)

| Feature | Status |
|---------|--------|
| Import (TXT/CSV/JSON) | Done |
| Library View | Done |
| Book Detail | Done |
| Data Editor | Done |
| Global Search | Done |
| Export (6 formats) | Done |
| Settings | Done |
| Dark Mode | Done |
| UX Polish (toasts, animations) | Pending |
| PWA Support | Backlog |
| Test Coverage >60% | Pending |

See [ROADMAP.md](ROADMAP.md) for detailed pending tasks.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [kindle-tools-ts](https://github.com/KindleTools/kindle-tools-ts) - The core parsing and export engine
- [Vue.js](https://vuejs.org) - The progressive JavaScript framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
