# KindleHub - Architecture Documentation

This document describes the technical architecture of KindleHub, a Vue 3 SPA for managing Kindle highlights.

---

## Overview

KindleHub follows a clean layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Pages (Views)                        │
│  index.vue | library.vue | import.vue | export.vue | ...   │
├─────────────────────────────────────────────────────────────┤
│                        Components                           │
│   BookCard | ClippingCard | DataTable | ExportPanel | ...  │
├─────────────────────────────────────────────────────────────┤
│                       Composables                           │
│            useDataEditor | useSearch                        │
├─────────────────────────────────────────────────────────────┤
│                    Pinia Stores                             │
│         clippings.ts | books.ts | settings.ts              │
├─────────────────────────────────────────────────────────────┤
│                        Services                             │
│     parser.service | export.service | db.service           │
├─────────────────────────────────────────────────────────────┤
│                    External Libraries                       │
│           kindle-tools-ts | Dexie.js | Fuse.js             │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Layers

### 1. Pages (Views)

File-based routing with `unplugin-vue-router`. Each file in `src/pages/` becomes a route.

| Page | Route | Description |
|------|-------|-------------|
| `index.vue` | `/` | Dashboard with stats and quick actions |
| `library.vue` | `/library` | Grid of all imported books |
| `books/[id].vue` | `/books/:id` | Book detail with all clippings |
| `import.vue` | `/import` | File import with drag & drop |
| `export.vue` | `/export` | Export panel with format picker |
| `editor.vue` | `/editor` | Editable data table |
| `search.vue` | `/search` | Global search with filters |
| `settings.vue` | `/settings` | User preferences |

### 2. Components

Organized by feature domain:

```
components/
├── books/
│   ├── BookCard.vue      # Card with gradient cover, stats
│   └── BookList.vue      # Grid layout with empty state
├── clippings/
│   ├── ClippingCard.vue  # Type-colored card with content
│   └── ClippingList.vue  # Scrollable list
├── editor/
│   └── DataTable.vue     # Editable table with bulk actions
├── export/
│   ├── ExportPanel.vue   # Format picker + preview + download
│   └── FormatPicker.vue  # Visual format selector
└── layout/
    ├── AppHeader.vue     # Navigation + dark mode toggle
    └── AppFooter.vue     # Footer links
```

### 3. Composables

Reusable stateful logic following Vue Composition API patterns.

#### `useDataEditor.ts`
Manages editable table state:
- `initializeClippings(items)` - Load data into editable state
- `selectedIds` - Set of selected row IDs
- `editingId` - Currently editing row
- `toggleSelect(id)` / `selectAll()` - Selection management
- `startEdit(id)` / `saveEdit()` / `cancelEdit()` - Inline editing
- `deleteSelected()` / `duplicateSelected()` - Bulk actions
- `addClipping(bookId)` - Create new row

#### `useSearch.ts`
Full-text search with Fuse.js:
- `query` - Search string
- `filters` - Active filters (book, type, dateRange)
- `results` - Filtered and highlighted results
- `highlightMatches(text, indices)` - HTML highlighting
- `setFilter(key, value)` - Filter management

### 4. Pinia Stores

Global state management with persistence.

#### `clippings.ts`
```typescript
state: {
  clippings: StoredClipping[]
  isLoading: boolean
  error: string | null
}
getters: {
  highlights: StoredClipping[]  // type === 'highlight'
  notes: StoredClipping[]       // type === 'note'
  bookmarks: StoredClipping[]   // type === 'bookmark'
}
actions: {
  loadAllClippings()
  loadClippingsForBook(bookId)
  loadStats()
  clearClippings()
}
```

#### `books.ts`
```typescript
state: {
  books: Book[]
  selectedBook: Book | null
  isLoading: boolean
}
getters: {
  totalBooks: number
  totalClippings: number
}
actions: {
  loadBooks()
  selectBook(id)
  clearSelection()
}
```

#### `settings.ts`
```typescript
state: {
  exportPreferences: ExportPreferences
  language: 'en' | 'es'
}
actions: {
  updateExportPreferences(prefs)
  setLanguage(lang)
  resetToDefaults()
}
// Persists to localStorage automatically
```

### 5. Services

Business logic wrappers that isolate external dependencies.

#### `parser.service.ts`
Wraps kindle-tools-ts importers:
```typescript
parseContent(content: string, format: 'txt' | 'csv' | 'json')
  → { books: ProcessedBook[], clippings: ProcessedClipping[] }

detectFormat(filename: string) → 'txt' | 'csv' | 'json'
```

#### `export.service.ts`
Wraps kindle-tools-ts exporters:
```typescript
exportClippings(clippings, format, options)
  → { content: string, filename: string } | { files: ExportFile[] }

previewExport(clippings, format, options) → string

downloadExport(result) → void

getFormatInfo(format) → { name, description, extension, icon }
```

Supported formats:
- `markdown` - Single .md file
- `json` - Structured JSON
- `csv` - Spreadsheet compatible
- `html` - Standalone HTML page
- `obsidian` - Multiple .md files with YAML frontmatter
- `joplin` - .jex archive for Joplin import

#### `db.service.ts`
IndexedDB operations via Dexie:
```typescript
saveClippings(books, clippings) → Promise<void>
getAllBooks() → Promise<Book[]>
getBookById(id) → Promise<Book | undefined>
getAllClippings() → Promise<StoredClipping[]>
getClippingsByBookId(bookId) → Promise<StoredClipping[]>
updateClipping(id, data) → Promise<void>
deleteClippings(ids) → Promise<void>
clearAllData() → Promise<void>
getStats() → Promise<{ books, clippings, highlights, notes }>
```

---

## Database Schema

Using Dexie.js (IndexedDB wrapper) defined in `src/db/schema.ts`.

### Tables

#### `books`
```typescript
interface Book {
  id?: number           // Auto-increment primary key
  title: string
  author: string
  coverColor?: string   // Generated gradient color
  clippingCount: number
  lastReadDate: Date
  createdAt: Date
  updatedAt: Date
}
// Indexes: ++id, title, author, lastReadDate
```

#### `clippings`
```typescript
interface StoredClipping {
  id?: number           // Auto-increment primary key
  bookId: number        // Foreign key to books
  originalId: string    // Hash from kindle-tools-ts
  type: 'highlight' | 'note' | 'bookmark'
  content: string
  location?: string
  page?: number
  date: Date
  note?: string         // Linked note content
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}
// Indexes: ++id, bookId, originalId, type, date, [bookId+type]
```

---

## Data Flow

### Import Flow
```
User drops file
    │
    ▼
import.vue reads file content
    │
    ▼
parser.service.parseContent()
    │
    ├─► TxtImporter / CsvImporter / JsonImporter
    │
    ├─► processClippings() (deduplication, linking)
    │
    ▼
db.service.saveClippings()
    │
    ▼
IndexedDB (books + clippings tables)
    │
    ▼
Pinia stores updated
    │
    ▼
UI reflects changes
```

### Export Flow
```
User selects format + options
    │
    ▼
export.service.previewExport()
    │
    ▼
Preview displayed in ExportPanel
    │
    ▼
User clicks Download
    │
    ▼
export.service.exportClippings()
    │
    ├─► Single file: Blob download
    │
    └─► Multi-file (Obsidian/Joplin): ZIP or individual downloads
```

### Search Flow
```
User types query
    │
    ▼
useSearch.query (debounced 300ms)
    │
    ▼
Fuse.js search with options:
    - keys: ['content', 'note', 'book.title', 'book.author']
    - threshold: 0.3
    - includeMatches: true
    │
    ▼
Apply filters (book, type, dateRange)
    │
    ▼
highlightMatches() adds <mark> tags
    │
    ▼
results displayed with highlighting
```

---

## Key Design Decisions

### 1. 100% Client-Side
All data stays in the browser (IndexedDB). No backend, no accounts, no data sent anywhere.

### 2. kindle-tools-ts Integration
The app is a showcase for kindle-tools-ts. All parsing and export logic comes from the library. The services layer provides Vue-friendly wrappers.

### 3. File-Based Routing
Using `unplugin-vue-router` for automatic route generation from `src/pages/` structure. Reduces boilerplate and makes navigation intuitive.

### 4. Composition API + Composables
All logic uses Vue 3 Composition API with `<script setup>`. Complex reusable logic is extracted to composables.

### 5. Tailwind CSS Direct Usage
No base component library (BaseButton, etc.). Tailwind utilities used directly for rapid development. Headless UI for accessible primitives (menus, dialogs).

### 6. Pinia for State
Single source of truth for books, clippings, and settings. Settings store persists to localStorage.

---

## Testing Strategy

### Unit Tests (Vitest)
Located in `tests/unit/`.

**Current coverage:**
- `db/schema.spec.ts` - Database initialization
- `composables/useDataEditor.spec.ts` - Editor logic
- `composables/useSearch.spec.ts` - Search logic
- `stores/clippings.spec.ts` - Clippings store
- `components/AppHeader.spec.ts` - Header component

**Testing patterns:**
```typescript
// Composable test
const { selectedIds, toggleSelect } = useDataEditor()
toggleSelect(1)
expect(selectedIds.value.has(1)).toBe(true)

// Store test (with Pinia)
setActivePinia(createPinia())
const store = useClippingsStore()
await store.loadAllClippings()
expect(store.clippings.length).toBeGreaterThan(0)
```

### E2E Tests (Planned)
Would use Playwright for full user flows:
- Import → Library → Book detail
- Search → Filter → Export

---

## Build & Deployment

### Vite Configuration
Key plugins in `vite.config.ts`:
- `@vitejs/plugin-vue` - Vue SFC support
- `unplugin-vue-router` - File-based routing
- `unplugin-vue-components` - Auto component imports
- `unplugin-auto-import` - Auto API imports (Vue, VueUse, Pinia)

### GitHub Actions
`.github/workflows/deploy.yml`:
1. Checkout code
2. Setup Node 20 + pnpm
3. Install dependencies
4. Run linting
5. Run tests
6. Build production bundle
7. Deploy to GitHub Pages

### Environment
- Node.js >= 20
- pnpm >= 9
- TypeScript strict mode
- ESLint with Vue + TypeScript rules

---

## Security Considerations

1. **XSS Prevention**: DOMPurify sanitizes all user content before rendering
2. **Input Validation**: File uploads validated by type and content
3. **No Secrets**: No API keys, no backend, no sensitive data
4. **CSP Ready**: Static assets can use strict Content Security Policy

---

## Performance Notes

### Bundle Size
Target: <300KB gzipped
- Tree-shaking enabled for all dependencies
- Only used Lucide icons are bundled
- kindle-tools-ts is the largest dependency

### Search Performance
- Fuse.js is initialized once with all clippings
- Debounced input (300ms) prevents excessive searches
- Target: <500ms for 1000+ clippings

### Database
- IndexedDB handles large datasets efficiently
- Compound indexes for common queries
- Batch operations for imports

---

## Future Architecture Considerations

### PWA Support
Would require:
- `vite-plugin-pwa` for service worker
- `manifest.json` for installability
- Offline-first IndexedDB access (already in place)

### i18n
Current: Hardcoded English with language setting stub
Future: vue-i18n with JSON translation files

### Virtual Scrolling
For very large libraries (1000+ books):
- vue-virtual-scroller for BookList
- Paginated clipping lists

---

*Last updated: 2026-01-22*
