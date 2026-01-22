# KindleHub - Roadmap

> **Estado actual**: MVP funcional (~98% completado)
> **Última actualización**: 2026-01-22

---

## Resumen de Estado

### ✅ Completado

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
- Responsive design (cards en mobile, tabla en desktop)
- Keyboard shortcuts (Ctrl+K, /, Escape)
- Accesibilidad (ARIA labels, focus management, HeadlessUI)
- i18n: 6 idiomas (EN, ES, IT, DE, FR, PT)
- Error handling centralizado (AppError + useErrorHandler)
- Utilidades: date.utils.ts, color.utils.ts

**Arquitectura:**
- Vue 3 + Vite 7 + TypeScript strict + Tailwind + Pinia
- Lazy loading de rutas (importMode: 'async')
- Service layer desacoplado (db.service.ts con CRUD completo)
- Tipos centralizados en `@/types`
- Tests centralizados en `tests/unit/` (14 archivos, 120 tests, ~60% coverage)
- CI/CD con GitHub Actions

---

## 📋 Pendiente

### Fase 1: Mejoras UX

| Tarea | Prioridad | Notas |
|-------|-----------|-------|
| Sidebar colapsable en móvil | Media | Hamburger menu para navegación mobile |
| Empty states con SVG | Baja | Ilustraciones para estados vacíos |
| Skeleton loading en BookCard | Baja | Loading state mientras carga library |

### Fase 2: Testing

**Cobertura actual:** ~60% (14 archivos, 120 tests) ✅ Objetivo alcanzado

| Tarea | Prioridad | Notas |
|-------|-----------|-------|
| `ExportPanel.spec.ts` | Media | Tests del panel de exportación |
| `DataTable.spec.ts` | Media | Tests de la tabla editable |
| Tests E2E con Playwright | Baja | Flujos completos import→export |

### Fase 3: Deployment

| Tarea | Prioridad | Notas |
|-------|-----------|-------|
| Probar deployment en producción | Media | Verificar GitHub Pages live |
| Screenshots/GIFs en README | Baja | Documentación visual |
| Lighthouse audit (target >90) | Media | Verificar performance |

### Fase 4: Mejoras Futuras (Backlog)

**PWA Support:**
- [ ] manifest.json para instalabilidad
- [ ] Service Worker para offline (vite-plugin-pwa)
- [ ] Iconos para instalación

**Refactoring (opcional):**
- [ ] Patrón Factory para exportadores (reducir switch en export.service.ts)
- [ ] Auditoría de traducciones (verificar consistencia IT, DE, FR, PT)
- [ ] Skip links para navegación accesible

**Funcionalidades adicionales:**
- [ ] Importar desde URL
- [ ] Historial de cambios (undo/redo)
- [ ] Tags personalizados para clippings
- [ ] Estadísticas avanzadas (gráficos)
- [ ] Temas personalizables

**Optimizaciones:**
- [x] Bundle size ~230KB gzipped ✅
- [x] Lazy loading de rutas ✅
- [ ] Virtual scrolling para listas grandes (solo si hay problemas de rendimiento)

---

## 🔄 Sistema de Lotes (Batches)

> **Estado**: ✅ Implementado (Fase 1-3 completadas)

Sistema de pre-procesamiento de datos antes de importar a la base de datos.

### Flujo implementado
1. Cargar archivo → Parsear con kindle-tools-ts
2. Crear lote temporal → Datos en memoria
3. Revisar y editar lote (warnings, edición inline, bulk actions)
4. Decidir: Importar a biblioteca / Solo exportar / Descartar

### Pendiente
- [ ] Enhanced parser specifics (parser pendiente de actualización para emitir warnings detallados)

---

## 📊 Métricas de Calidad

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| TypeScript strict | Habilitado | ✅ OK |
| ESLint sin errores | 0 errores | ✅ OK |
| Tests unitarios | >60% coverage | ✅ ~60% (120 tests) |
| Bundle size | <300KB gzip | ✅ ~230KB |
| Lighthouse | >90 | ⏳ Pendiente |
| Responsive | Mobile-first | ✅ OK |
| i18n | Multi-idioma | ✅ 6 idiomas |
| Accesibilidad | ARIA + focus | ✅ OK |

---

### 🏗️ Arquitectura Avanzada: Feature-Sliced Design (Futuro)

Para proyectos que escalan significativamente, considerar migrar a [Feature-Sliced Design](https://feature-sliced.design/):

```
src/
├── app/              # App-level: providers, routing, global styles
├── pages/            # Full pages (ya lo tienes)
├── widgets/          # Large self-contained UI chunks
├── features/         # User interactions (import, export, search)
│   ├── import/
│   │   ├── ui/
│   │   ├── model/
│   │   └── api/
│   └── export/
├── entities/         # Business entities (book, clipping)
│   ├── book/
│   │   ├── ui/       # BookCard, BookList
│   │   ├── model/    # book store slice
│   │   └── api/      # book service
│   └── clipping/
└── shared/           # Shared utilities, UI kit, config
    ├── ui/
    ├── lib/
    └── config/
```

**Nota**: Solo considerar esta migración si el proyecto crece significativamente. La estructura actual es adecuada para el tamaño actual.

---

## 📚 Referencias

- [kindle-tools-ts](https://github.com/KindleTools/kindle-tools-ts) - Librería core
- [Vue 3](https://vuejs.org) - Framework
- [Pinia](https://pinia.vuejs.org) - State management
- [Tailwind CSS](https://tailwindcss.com) - Estilos
- [Dexie.js](https://dexie.org) - IndexedDB wrapper
- [Fuse.js](https://fusejs.io) - Búsqueda fuzzy
- [vue-i18n](https://vue-i18n.intlify.dev/) - Internacionalización

---

*Última actualización: 2026-01-22*
