# KindleHub - Roadmap

> **Estado actual**: MVP avanzado (~99% completado)
> **Última actualización**: 2026-01-22

---

## Resumen de Estado

### 🚀 Recién Completado (Sprint Actual)

- ✨ **Mobile Navigation**: Menú hamburguesa y slide-over responsive integrado.
- ✨ **UI Polish**:
    - Empty States con ilustraciones SVG personalizadas.
    - Skeleton Loading para mejor experiencia de carga.
- ✨ **Infraestructura de Tests**:
    - Tests creados para `ExportPanel` (Pasando).
    - Setup inicial para `DataTable` (WIP).
- ✨ **Auditoría i18n**: Script de detección de claves faltantes implementado.

### ✅ Completado (MVP Core)

**Core Features:**
- Importación: TXT, CSV, JSON desde kindle-tools-ts
- Almacenamiento: IndexedDB con Dexie.js
- Visualización: Library de libros, detalle de libro, cards de clippings
- Editor: Tabla editable con CRUD, selección múltiple, acciones masivas
- Búsqueda: Full-text con Fuse.js, filtros por tipo/libro/fecha
- Exportación: 6 formatos (Markdown, JSON, CSV, HTML, Obsidian, Joplin) con preview
- Settings: Dark mode, preferencias de exportación, backup/restore
- Sistema de Lotes (Batches): Edición pre-importación, warnings, historial

**UX & Infraestructura:**
- Toast notifications, Skeleton, ConfirmModal, Tooltips
- Animaciones y transiciones (200-300ms)
- Responsive design completo
- Keyboard shortcuts (Ctrl+K, /, Escape)
- Accesibilidad (ARIA labels, focus management, HeadlessUI, Skip Links)
- i18n: 6 idiomas (EN, ES, IT, DE, FR, PT)
- Error handling centralizado (AppError + useErrorHandler)

**Arquitectura:**
- Vue 3 + Vite 7 + TypeScript strict + Tailwind + Pinia
- Lazy loading de rutas (importMode: 'async')
- Service layer desacoplado (db.service.ts con CRUD completo)
- Tests centralizados en `tests/unit/` (>125 tests)

---

## 📋 Pendiente

### Prioridad Alta (Mejoras y Deuda Técnica)

| Tarea | Impacto | Notas |
|-------|---------|-------|
| **Auditoría de Traducciones** | UX | Rellenar claves faltantes en DE, FR, IT, PT (detectadas por script de auditoría) |
| **Fix DataTable Tests** | Calidad | Resolver mocking de `useDataEditor` en tests unitarios |
| **Fix Lint Errors** | Calidad | Resolver 1 error residual de ESLint |

### Prioridad Media (Optimizaciones)

| Tarea | Impacto | Notas |
|-------|---------|-------|
| **Virtual Scrolling** | Performance | Implementar en `BookList` y `DataTable` para librerías grandes (>500 items) |
| **Lighthouse Audit** | Performance | Alcanzar score >90 en móvil y desktop |
| **PWA Basics** | Acceso | Añadir `manifest.json` e iconos básicos |

### Prioridad Baja (Nuevas Features)

| Tarea | Impacto | Notas |
|-------|---------|-------|
| **Importar desde URL** | Feature | Permitir pegar URL de Goodreads/Amazon (future scope) |
| **Estadísticas Avanzadas** | Feature | Gráficos de lectura por mes/año |
| **Temas Personalizables** | UX | Permitir elegir accent color |

---

## 🔄 Estado de Tests

**Cobertura:** ~62% (16 archivos, >125 tests)

- ✅ **Core Services**: Parser, DB, Export (100% passing)
- ✅ **UI Components**: AppHeader, BookCard, ExportPanel (Passing)
- ⚠️ **Complex Components**: `DataTable` (Tests implementados pero requieren fix de mocks)

---

## 📊 Métricas de Calidad

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| TypeScript strict | Habilitado | ✅ OK |
| ESLint sin errores | 0 errores | ⚠️ 1 pendiente |
| Tests unitarios | >60% coverage | ✅ ~62% |
| Bundle size | <300KB gzip | ✅ ~230KB |
| Lighthouse | >90 | ⏳ Pendiente |
| Responsive | Mobile-first | ✅ OK |
| i18n | Multi-idioma | ⚠️ Faltan keys |

---

*Última actualización: 2026-01-22*
