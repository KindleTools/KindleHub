# KindleHub - Roadmap Consolidado

> **Objetivo principal**: Crear una aplicación web SPA (Single Page Application) que demuestre el 100% de las capacidades de `kindle-tools-ts` de forma elegante y usable, sirviendo como showcase y herramienta de testing de la librería.

---

## 📋 Resumen del Proyecto

**Nombre**: KindleHub (también referenciado como ClippingConverter / KindleViewer)

**Descripción**: Aplicación web 100% frontend que proporciona una interfaz interactiva completa para `kindle-tools-ts`. Permite a los usuarios importar, visualizar, editar, buscar y exportar sus highlights de Kindle en múltiples formatos con preview completo y control total sobre las opciones.

**Target Users**: Lectores que quieren organizar y revisar sus highlights y notas de Kindle en una interfaz bella y searchable.

**Core Value Proposition**: Transformar los clippings de Kindle en una base de conocimiento organizada, searchable, con UI hermosa y múltiples opciones de exportación.

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión | Notas |
|-----------|------------|---------|-------|
| **Framework** | Vue 3 | 3.5+ | Composition API, `<script setup>` |
| **Build Tool** | Vite | 7+ | Lightning-fast HMR and builds |
| **Lenguaje** | TypeScript | 5.7+ | Strict mode enabled |
| **Routing** | Vue Router | 4+ | File-based routing con `unplugin-vue-router` |
| **State** | Pinia | 3+ | State management oficial |
| **UI/Styling** | TailwindCSS | 3.4+ | Utility-first CSS |
| **Typography** | @tailwindcss/typography | - | Beautiful prose styling |
| **Icons** | Lucide Vue Next | ^0.469 | Tree-shakeable icons |
| **Utilities** | VueUse | ^14+ | Composition utilities |
| **UI Components** | Headless UI | - | Accessible UI components |
| **Core Engine** | kindle-tools-ts | ^0.5.0 | Local package (tgz) |
| **Storage** | Dexie.js | ^4+ | IndexedDB wrapper |
| **Search** | Fuse.js | ^7+ | Fuzzy search |
| **Dates** | date-fns | ^4+ | Date manipulation |
| **XSS Protection** | DOMPurify | ^3+ | User content sanitization |
| **Linting** | ESLint | ^9+ | Vue/TS/Stylistic plugins |
| **Testing** | Vitest | ^4+ | Unit testing con happy-dom |
| **E2E Testing** | Playwright | - | Optional E2E testing |
| **Deployment** | GitHub Pages / Vercel | - | Static hosting |

---

## 🗂️ Estructura del Proyecto

```
kindle-hub/
├── public/
│   ├── samples/                    # Archivos de ejemplo
│   │   ├── sample-clippings.txt
│   │   ├── sample-export.csv
│   │   └── sample-data.json
│   ├── icons/                      # PWA icons
│   └── favicon.ico
│
├── src/
│   ├── assets/
│   │   ├── styles/
│   │   │   └── main.css           # Tailwind imports + custom styles
│   │   └── images/
│   │       ├── logo.svg
│   │       ├── empty-state.svg
│   │       └── hero-illustration.svg
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppHeader.vue      # Header con logo y theme toggle
│   │   │   ├── AppSidebar.vue     # Navigation sidebar
│   │   │   └── AppFooter.vue      # Footer con links
│   │   │
│   │   ├── ui/                    # Componentes UI reutilizables
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseSelect.vue
│   │   │   ├── BaseCheckbox.vue
│   │   │   ├── BaseModal.vue
│   │   │   ├── BaseTooltip.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── ProgressBar.vue
│   │   │   ├── EmptyState.vue
│   │   │   └── TabGroup.vue
│   │   │
│   │   ├── import/
│   │   │   ├── FileDropzone.vue   # Drag & drop + file picker
│   │   │   ├── ImportOptions.vue  # Parser options (encoding, etc)
│   │   │   ├── ImportProgress.vue # Progress bar + status
│   │   │   ├── ImportResults.vue  # Success/error summary
│   │   │   └── FormatSelector.vue # TXT/CSV/JSON selector
│   │   │
│   │   ├── editor/
│   │   │   ├── DataTable.vue      # Tabla editable principal
│   │   │   ├── TableRow.vue       # Fila individual editable
│   │   │   ├── TableFilters.vue   # Filtros y búsqueda
│   │   │   ├── BulkActions.vue    # Acciones masivas
│   │   │   └── FieldEditor.vue    # Editor inline de campos
│   │   │
│   │   ├── books/
│   │   │   ├── BookCard.vue
│   │   │   ├── BookList.vue
│   │   │   └── BookCover.vue      # Generated gradient cover
│   │   │
│   │   ├── clippings/
│   │   │   ├── ClippingCard.vue
│   │   │   ├── ClippingList.vue
│   │   │   ├── ClippingFilters.vue
│   │   │   ├── ClippingSearch.vue
│   │   │   └── ClippingStats.vue
│   │   │
│   │   ├── export/
│   │   │   ├── ExportPanel.vue    # Panel de exportación
│   │   │   ├── FormatPicker.vue   # Selector de formato
│   │   │   ├── ExportOptions.vue  # Opciones específicas por formato
│   │   │   └── FileStructure.vue  # Vista de estructura (Obsidian/Joplin)
│   │   │
│   │   └── preview/
│   │       ├── PreviewPane.vue    # Container principal
│   │       ├── MarkdownPreview.vue
│   │       ├── JsonPreview.vue
│   │       ├── ObsidianPreview.vue
│   │       ├── JoplinPreview.vue
│   │       └── FolderTree.vue     # Árbol de carpetas
│   │
│   ├── composables/
│   │   ├── useKindleTools.ts      # Wrapper principal de kindle-tools-ts
│   │   ├── useImport.ts           # Lógica de importación
│   │   ├── useExport.ts           # Lógica de exportación
│   │   ├── useClippings.ts        # Clipping management CRUD
│   │   ├── useBooks.ts            # Book management
│   │   ├── useDataEditor.ts       # Gestión de edición de datos
│   │   ├── usePreview.ts          # Generación de previews
│   │   ├── useSearch.ts           # Fuse.js integration
│   │   ├── useFilters.ts          # Filter logic
│   │   ├── useDatabase.ts         # IndexedDB/Dexie wrapper
│   │   ├── useTheme.ts            # Dark/light mode
│   │   ├── useFileSystem.ts       # Manejo de archivos
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── pages/                     # File-based routing
│   │   ├── index.vue              # Home / Dashboard
│   │   ├── library.vue            # All books view
│   │   ├── books/
│   │   │   └── [id].vue           # Individual book view
│   │   ├── search.vue             # Search page
│   │   ├── settings.vue           # Settings page
│   │   └── import.vue             # Import page
│   │
│   ├── stores/
│   │   ├── clippings.ts           # Estado de clippings (Pinia)
│   │   ├── books.ts               # Books store
│   │   ├── ui.ts                  # Estado UI (modales, panels, etc)
│   │   └── settings.ts            # Configuración de usuario
│   │
│   ├── services/
│   │   ├── parser.service.ts      # Wrapper around kindle-tools-ts parser
│   │   ├── export.service.ts      # Wrapper around kindle-tools-ts exporters
│   │   └── db.service.ts          # Database operations
│   │
│   ├── db/
│   │   └── schema.ts              # Dexie.js schema
│   │
│   ├── types/
│   │   ├── clipping.ts            # Clipping types extendidos
│   │   ├── book.ts                # Book types
│   │   ├── export.ts              # Tipos de exportación
│   │   ├── import.ts              # Tipos de importación
│   │   └── index.ts               # Re-exports
│   │
│   ├── utils/
│   │   ├── validation.ts          # Validación de datos
│   │   ├── formatting.ts          # Formateo de texto/fechas
│   │   ├── download.ts            # Descarga de archivos
│   │   ├── colors.ts              # Book cover color generation
│   │   ├── preview.ts             # Helpers de preview
│   │   └── file.ts                # File handling utilities
│   │
│   ├── constants/
│   │   ├── routes.ts              # Route constants
│   │   └── config.ts              # App configuration
│   │
│   ├── App.vue                    # Root component
│   ├── main.ts                    # Application entry
│   ├── auto-imports.d.ts          # Auto-generated
│   ├── components.d.ts            # Auto-generated
│   └── typed-router.d.ts          # Auto-generated
│
├── tests/
│   ├── unit/
│   │   ├── composables/
│   │   └── components/
│   └── e2e/
│       └── import-flow.spec.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── kindle-tools-ts-0.5.0.tgz     # Librería local
├── ROADMAP.md                    # Este archivo
├── IMPROVE_LIB.md                # Mejoras sugeridas para kindle-tools-ts
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
├── biome.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🚀 Fases de Implementación

### Fase 1: Configuración Inicial y Setup (Día 1) ✅ 90% COMPLETADA

**Objetivos:**
- [x] Proyecto Vite + Vue + TypeScript configurado
- [x] kindle-tools-ts integrado desde archivo local
- [x] Estructura de carpetas creada
- [x] Configuraciones base (Tailwind, ESLint, TypeScript)

**Tareas:**
1. ~~Crear proyecto con `pnpm create vite@latest kindle-hub -- --template vue-ts`~~ ✅
2. ~~Configurar `package.json` con dependencies~~ ✅
3. ~~Configurar `vite.config.ts` con plugins (AutoImport, Components, VueRouter)~~ ✅
4. ~~Configurar `tsconfig.json` con strict mode~~ ✅
5. ~~Configurar `tailwind.config.js` con colores custom (primary, kindle)~~ ✅
6. ~~Configurar ESLint para linting (migrado de Biome)~~ ✅
7. ~~Crear `src/db/schema.ts` con Dexie (Book, Clipping tables)~~ ✅
8. [ ] Crear `src/types/index.ts` con tipos base (parcial)
9. ~~Crear `src/main.ts` con Pinia + Router~~ ✅
10. ~~Crear `src/assets/styles/main.css` con Tailwind imports~~ ✅ (como style.css)

**Resultado:**
- ✅ Proyecto compilando sin errores
- ✅ kindle-tools-ts importable
- ✅ Hot reload funcionando
- ✅ Tailwind aplicándose
- ✅ CI/CD workflows configurados
- ✅ Husky + lint-staged configurados
- ✅ Vitest configurado

---

### Fase 2: Layout y UI Base (Días 2-3) 🟡 50% COMPLETADA

**Objetivos:**
- [x] Estructura visual básica de la aplicación
- [ ] Sistema de componentes UI reutilizables
- [x] Tema claro/oscuro funcional
- [/] Layout responsive

**Componentes a crear:**
1. **Layout Components**
   - [x] `App.vue` - Header + Footer + Dark mode toggle (integrado)
   - [ ] `AppHeader.vue` - (actualmente inline en App.vue)
   - [ ] `AppSidebar.vue` - Navigation
   - [ ] `AppFooter.vue` - (actualmente inline en App.vue)

2. **Base UI Components** (NO CREADOS)
   - [ ] `BaseButton.vue` (primary/secondary/danger/ghost variants)
   - [ ] `BaseCard.vue`
   - [ ] `BaseInput.vue`
   - [ ] `BaseSelect.vue`
   - [ ] `BaseModal.vue`
   - [ ] `LoadingSpinner.vue`
   - [ ] `ProgressBar.vue`
   - [ ] `EmptyState.vue`
   - [ ] `TabGroup.vue`
   - [ ] `BaseTooltip.vue`

3. **Pages (estructura básica)**
   - [x] `index.vue` - Home/Dashboard
   - [x] `library.vue` - All books (solo empty state)
   - [x] `import.vue` - Import page (UI completa, lógica pendiente)

**Resultado:**
- ✅ Layout responsive funcionando
- ✅ Dark mode funcionando (usa VueUse useDark)
- ⏳ Componentes UI base pendientes
- ✅ Aplicación visualmente atractiva

---

### Fase 3: Sistema de Importación (Días 3-4) ✅ 90% COMPLETADA

**Objetivos:**
- [x] Importar TXT, CSV, JSON
- [x] Usar kindle-tools-ts parser
- [ ] Mostrar opciones de parser
- [x] Manejo de errores robusto
- [x] Guardar en IndexedDB

**Componentes/Composables:**
1. [x] `src/services/parser.service.ts` - Wrapper para kindle-tools-ts ✅
2. [x] `src/services/db.service.ts` - Database operations ✅
3. [ ] `src/composables/useImport.ts` - Import logic (opcional, integrado en página)
4. [x] `src/stores/clippings.ts` - Pinia store ✅
5. [x] `src/stores/books.ts` - Pinia store ✅
6. [x] `src/pages/import.vue` - UI completa con lógica real ✅

**Resultado:**
- ✅ Importación de TXT/CSV/JSON funcional
- ✅ Drag & drop funcionando
- ✅ Progress bar mostrándose
- ✅ kindle-tools-ts integrado
- ✅ Datos guardados en IndexedDB

---

### Fase 4: Visualización de Datos (Días 4-5)

**Objetivos:**
- [ ] Display books como cards
- [ ] Display clippings por libro
- [ ] Color-coded por tipo (highlight, note, bookmark)
- [ ] Agrupar/ordenar opciones

**Componentes/Composables:**
1. `src/composables/useBooks.ts` - Book management
2. `src/composables/useClippings.ts` - Clipping management
3. `src/stores/books.ts` - Books Pinia store
4. `src/components/books/BookCard.vue` (gradient cover generado)
5. `src/components/books/BookList.vue`
6. `src/components/clippings/ClippingCard.vue`
7. `src/components/clippings/ClippingList.vue`
8. Completar `src/pages/library.vue`
9. `src/pages/books/[id].vue` - Book detail page

**Resultado Esperado:**
- ✅ Books visibles en library
- ✅ Click en book → ver todos los clippings
- ✅ Color-coding por tipo

---

### Fase 5: Editor de Datos (Días 5-6)

**Objetivos:**
- [ ] Tabla editable con todos los campos de Clipping
- [ ] Edición inline de todos los campos
- [ ] Selección múltiple
- [ ] Acciones masivas (eliminar, duplicar)
- [ ] Añadir filas nuevas
- [ ] Validación de datos

**Componentes:**
1. `src/composables/useDataEditor.ts`
2. `src/components/editor/DataTable.vue`
3. `src/components/editor/TableRow.vue` (editable con Check/X para save/cancel)
4. `src/components/editor/TableFilters.vue`
5. `src/components/editor/BulkActions.vue`
6. `src/components/editor/FieldEditor.vue`

**Resultado Esperado:**
- ✅ Tabla editable funcionando
- ✅ Edición inline de todos los campos
- ✅ Selección múltiple
- ✅ Acciones masivas (eliminar)
- ✅ Añadir filas nuevas

---

### Fase 6: Búsqueda y Filtros (Días 6-7)

**Objetivos:**
- [ ] Full-text search con Fuse.js
- [ ] Search across all books
- [ ] Filtros por libro, autor, date range, tipo
- [ ] Highlight search terms en results

**Componentes/Composables:**
1. `src/composables/useSearch.ts` - Fuse.js integration
2. `src/composables/useFilters.ts` - Filter logic
3. `src/components/clippings/ClippingSearch.vue`
4. `src/components/clippings/ClippingFilters.vue`
5. `src/pages/search.vue`

**Resultado Esperado:**
- ✅ Search retorna resultados en <500ms
- ✅ Search terms highlighted
- ✅ Filters funcionando

---

### Fase 7: Sistema de Exportación y Preview (Días 7-8)

**Objetivos:**
- [ ] Exportar en todos los formatos de kindle-tools-ts
- [ ] Preview completo antes de exportar
- [ ] Opciones de exportación expuestas al usuario
- [ ] Visualización de estructura de carpetas (Obsidian/Joplin)

**Formatos soportados:**
- Markdown
- JSON
- Obsidian (multiple files with YAML frontmatter)
- Joplin JEX (importable archive)
- CSV
- HTML

**Componentes:**
1. `src/services/export.service.ts`
2. `src/composables/useExport.ts`
3. `src/components/export/ExportPanel.vue`
4. `src/components/export/FormatPicker.vue`
5. `src/components/export/ExportOptions.vue`
6. `src/components/preview/PreviewPane.vue`
7. `src/components/preview/MarkdownPreview.vue`
8. `src/components/preview/JsonPreview.vue`
9. `src/components/preview/ObsidianPreview.vue`
10. `src/components/preview/JoplinPreview.vue`
11. `src/components/preview/FolderTree.vue`

**Resultado Esperado:**
- ✅ Exportación en todos los formatos
- ✅ Preview funcional antes de descargar
- ✅ Opciones de exportación modificables
- ✅ Visualización de estructura de Obsidian/Joplin
- ✅ Descarga de archivos funcionando

---

### Fase 8: Mejoras UX y Pulido (Días 8-9)

**Objetivos:**
- [ ] Responsive design perfecto
- [ ] Transiciones y animaciones
- [ ] Estados vacíos elegantes
- [ ] Ayuda contextual (tooltips)
- [ ] Keyboard shortcuts (Ctrl+S, Ctrl+E, Ctrl+F)
- [ ] Accesibilidad (ARIA)

**Mejoras específicas:**
1. Tabla responsive con scroll horizontal en móvil
2. Sidebar colapsable
3. Modales fullscreen en móvil
4. Touch-friendly (botones más grandes en móvil)
5. Skeleton screens para loading states
6. Toast notifications para actions
7. WCAG AA compliant contrast

**Resultado Esperado:**
- ✅ Aplicación responsive en todos los dispositivos
- ✅ Animaciones suaves (200-300ms)
- ✅ Estados vacíos informativos
- ✅ Tooltips útiles
- ✅ Shortcuts de teclado
- ✅ Accesibilidad mejorada

---

### Fase 9: Settings y PWA (Día 9)

**Objetivos:**
- [ ] Dark/light mode persistente
- [ ] Export preferences
- [ ] Data management (clear all, backup, restore)
- [ ] PWA support (install as app, offline mode)

**Componentes:**
1. `src/composables/useTheme.ts`
2. `src/stores/settings.ts`
3. `src/pages/settings.vue`
4. PWA configuration en `vite.config.ts`

---

### Fase 10: GitHub Pages Deployment (Día 10)

**Objetivos:**
- [ ] Configurar GitHub Actions
- [ ] Build automático
- [ ] Deploy a GitHub Pages
- [ ] README completo
- [ ] Ejemplos de uso

**Archivos:**
- `.github/workflows/deploy.yml`
- `README.md` actualizado

**Resultado Esperado:**
- ✅ Auto-deploy en cada push a main
- ✅ Aplicación accesible en GitHub Pages
- ✅ URL funcional

---

## ✅ Checklist Final

### Funcionalidad Core
- [ ] Importar TXT (UI lista, lógica pendiente)
- [ ] Importar CSV (UI lista, lógica pendiente)
- [ ] Importar JSON (UI lista, lógica pendiente)
- [ ] Tabla editable
- [ ] Búsqueda y filtros
- [ ] Exportar Markdown
- [ ] Exportar JSON
- [ ] Exportar Obsidian
- [ ] Exportar Joplin
- [ ] Exportar CSV
- [ ] Exportar HTML
- [ ] Preview de todas las exportaciones

### UX/UI
- [x] Dark mode ✅
- [/] Responsive design (básico)
- [x] Drag & drop ✅ (UI ready)
- [/] Loading states (simulados)
- [/] Error handling (UI only)
- [x] Empty states ✅
- [ ] Tooltips
- [ ] Keyboard shortcuts
- [ ] Animations

### Técnico
- [x] TypeScript strict ✅
- [x] No errores de compilación ✅
- [ ] Bundle optimizado (<300KB gzipped)
- [ ] Lighthouse Score >90
- [x] GitHub Pages deployment ✅ (workflow listo)
- [ ] README completo
- [ ] Ejemplos de uso

---

## 🎯 Performance Targets

| Métrica | Objetivo |
|---------|----------|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| Lighthouse Score | >90 |
| Bundle Size | <300KB gzipped |
| Search Response | <500ms |
| Import (1000+ clippings) | <10s |

---

## 🔒 Security Considerations

1. **XSS Prevention**: Usar DOMPurify para todo user content
2. **CSP Headers**: Configurar en deployment
3. **Input Validation**: Validar todos los file uploads
4. **Data Privacy**: Todos los datos almacenados localmente (IndexedDB)
5. **No Backend**: 100% cliente, sin envío de datos a servidores

---

## 📝 Notas Finales

1. **Prioriza la funcionalidad core** antes que features avanzadas
2. **Testea con archivos reales** de Kindle durante desarrollo
3. **Documenta todo** - será útil para showcase de kindle-tools-ts
4. **Captura screenshots** del proceso para mostrar capabilities
5. **Solicita feedback** temprano sobre UX
6. **Itera rápido** - no busques perfección en primera versión

**El objetivo es demostrar el 100% de las capacidades de kindle-tools-ts de forma elegante y usable.**

---

## 🔗 Referencias

- **kindle-tools-ts**: [GitHub](https://github.com/KindleTools/kindle-tools-ts)
- **Vue 3**: [Documentation](https://vuejs.org)
- **Pinia**: [Documentation](https://pinia.vuejs.org)
- **Tailwind**: [Documentation](https://tailwindcss.com)
- **Dexie**: [Documentation](https://dexie.org)
- **VueUse**: [Documentation](https://vueuse.org)
- **Fuse.js**: [Documentation](https://fusejs.io)

---

*Generado: 2026-01-20*
