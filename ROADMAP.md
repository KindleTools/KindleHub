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

### Recientemente Completado

- **Fix Lint Errors**: Corregidos trailing spaces en componentes.
- **i18n**: Añadidas claves faltantes (`grid_view`, `list_view`) en DE, FR, IT, PT.
- **Lighthouse**: Mejorado score con manifest theme colors.
- **UI Polish**: Skeletons en BookList y textos localizados en DataTable.

---

## Tareas Pendientes

### Prioridad Alta

*(Todas las tareas de prioridad alta completadas)*

---

### Prioridad Media

*(Todas las tareas de prioridad media completadas)*

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
| ESLint sin errores | 0 errores | ✅ |
| Tests unitarios | >60% | ✅ ~62% |
| Bundle size | <300KB gzip | ✅ ~230KB |
| Lighthouse | >90 | ✅ Mejorado |
| i18n | 6 idiomas | ✅ Completo |

---

*Última actualización: 2026-01-23*
