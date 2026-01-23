# KindleHub - Roadmap

> **Estado actual**: MVP completado (~99%)
> **Última actualización**: 2026-01-23

---

## Resumen

El MVP está esencialmente completo. Este roadmap contiene solo las tareas pendientes y mejoras opcionales.

### Completado

- Importación: TXT, CSV, JSON
- Almacenamiento: IndexedDB con Dexie.js
- Visualización: Library con grid/list, dashboard con ECharts
- Editor: Tabla editable con inline editing, CRUD, acciones masivas
- Búsqueda: Full-text con Fuse.js, filtros
- Exportación: 6 formatos con preview y Factory Pattern
- Settings: Dark mode, i18n (6 idiomas), backup/restore
- Sistema de Batches: Edición pre-importación, warnings, historial, route guard, duplicates detection
- UX: Toast, Skeleton, ConfirmModal, Tooltips, Page Transitions, Skip Links
- Utilidades: date.utils.ts, color.utils.ts
- Mobile: Navegación slide-over, responsive completo
- Performance: Virtual scrolling en BookList y DataTable
- PWA: VitePWA configurado con manifest inline
- Tests: 130 tests pasando (~62% cobertura)

---

## Tareas Pendientes

### Prioridad Alta

| # | Tarea | Descripción | Archivos |
|---|-------|-------------|----------|
| 1 | **Fix Lint Errors** | Trailing spaces en BookCard.vue y BookList.vue | `src/components/books/` |
| 2 | **i18n: Claves faltantes** | Añadir `grid_view`, `list_view` a de, fr, it, pt | `src/locales/{de,fr,it,pt}.json` |

---

### Prioridad Media

| # | Tarea | Descripción |
|---|-------|-------------|
| 3 | **Lighthouse Audit** | Alcanzar score >90 en móvil/desktop |
| 4 | **DataTable string hardcodeado** | Cambiar `'(vacío)'` por `$t('clipping.no_content')` en línea 399 |
| 5 | **BookListItem skeleton** | Añadir prop `loading` y skeleton state |

---

### Prioridad Baja (Mejoras Opcionales)

| # | Tarea | Descripción |
|---|-------|-------------|
| 6 | **Column Visibility Toggle** | Permitir ocultar columnas en DataTable |
| 7 | **Density Toggle** | Vista compacta/normal/expandida en editor |
| 8 | **EmptyState ilustraciones** | Reemplazar iconos Lucide con SVGs personalizados |
| 9 | **Glassmorphism Header** | Efecto blur en scroll |
| 10 | **Heatmap de lectura** | Implementar `heatmapData` en useStatistics |

---

## Mejoras del Sistema de Batches (Futuro)

### Alta Prioridad

| # | Tarea | Descripción |
|---|-------|-------------|
| B1 | Undo/Redo | Historial de cambios en batch, Ctrl+Z |
| B2 | Filtros en batch | Filtrar por tipo, libro, items con warnings |
| B3 | Selección inteligente | Shift+click para rango, Ctrl+A |

### Media Prioridad

| # | Tarea | Descripción |
|---|-------|-------------|
| B4 | Merge duplicados | Fusionar dos clippings combinando notas |
| B5 | Preview de cambios | Mostrar diff antes de importar |
| B6 | Marcar ambos duplicados | Actualmente solo c1 se marca |
| B7 | Re-detectar duplicados | Llamar `detectDuplicates()` al cambiar content |

### Baja Prioridad

| # | Tarea | Descripción |
|---|-------|-------------|
| B8 | Batch history detallado | Ver qué se importó, re-importar descartado |
| B9 | Persistir en localStorage | Guardar estado periódicamente |

---

## Backlog (Sin fecha)

- Test Coverage >80%
- Tests E2E con Playwright
- Screenshots/GIFs en README
- Importar desde URL (Goodreads/Amazon)
- Temas personalizables (accent color)

---

## Métricas de Calidad

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| TypeScript strict | Habilitado | ✅ |
| ESLint sin errores | 0 errores | ⚠️ 3 errors |
| Tests unitarios | >60% | ✅ ~62% |
| Bundle size | <300KB gzip | ✅ ~230KB |
| Lighthouse | >90 | ⏳ Pendiente |
| i18n | 6 idiomas | ⚠️ 2 keys faltantes |

---

*Última actualización: 2026-01-23*
