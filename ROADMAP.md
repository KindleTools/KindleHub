# KindleHub - Roadmap

> **Estado actual**: MVP avanzado (~99% completado)
> **Última actualización**: 2026-01-23

---

## Resumen de Estado

### 🚀 Recién Completado (Sprint Actual)

- ✨ **Mobile Navigation**: Menú hamburguesa y slide-over responsive integrado.
- ✨ **UI Polish**: Empty States con ilustraciones SVG, Skeleton Loading.
- ✨ **Tests**: 130 tests pasando, ~62% cobertura.
- ✨ **Auditoría i18n**: Script de detección de claves faltantes implementado.
- ✨ **ESLint Config**: Configuración completa con coverage ignorado y globals de Node.

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
- Tests centralizados en `tests/unit/` (130 tests)

---

## 📋 Plan de Implementación

### 🔴 Prioridad Alta (Mejoras y Deuda Técnica)

| # | Tarea | Impacto | Archivos/Acciones | Estimación |
|---|-------|---------|-------------------|------------|
| 1 | **Auditoría de Traducciones** | UX | Rellenar claves faltantes en `src/i18n/locales/{de,fr,it,pt}.json` detectadas por script | 1-2h |
| 2 | **Fix DataTable Tests** | Calidad | Mejorar mocking de `useDataEditor` en `tests/unit/components/editor/DataTable.spec.ts` | 1h |
| 3 | **Fix Lint Errors** | Calidad | Resolver error residual de ESLint (ejecutar `npm run lint`) | 15min |

---

### 🟡 Prioridad Media (Optimizaciones)

| # | Tarea | Impacto | Detalles Técnicos | Estimación |
|---|-------|---------|-------------------|------------|
| 4 | **Virtual Scrolling** | Performance | Implementar `@tanstack/vue-virtual` en `BookList.vue` y `DataTable.vue` para >500 items | 3-4h |
| 5 | **Lighthouse Audit** | Performance | Alcanzar score >90 en móvil/desktop. Optimizar LCP, CLS, FID | 2-3h |
| 6 | **PWA Basics** | Acceso | Ver sección PWA Support abajo | 2-3h |

---

### 🟢 Prioridad Baja (Nuevas Features)

| # | Tarea | Impacto | Notas |
|---|-------|---------|-------|
| 7 | **Importar desde URL** | Feature | Permitir pegar URL de Goodreads/Amazon (future scope) |
| 8 | **Estadísticas Avanzadas** | Feature | Gráficos de lectura por mes/año con Chart.js |
| 9 | **Temas Personalizables** | UX | Permitir elegir accent color desde Settings |

---

## � PWA Support (Tarea #6)

### Checklist de Implementación

- [ ] **manifest.json** para instalabilidad
  - Crear `public/manifest.json` con nombre, iconos, theme_color, background_color
  - Añadir `<link rel="manifest">` en `index.html`
  
- [ ] **Service Worker** para offline
  - Instalar `vite-plugin-pwa`
  - Configurar workbox en `vite.config.ts`
  - Estrategia: NetworkFirst para API, CacheFirst para assets
  
- [ ] **Iconos para instalación**
  - Generar iconos en múltiples tamaños: 192x192, 512x512
  - Añadir apple-touch-icon para iOS
  - Crear maskable icon para Android

### Archivos a crear/modificar:

```
public/
├── manifest.json          [NEW]
├── icons/
│   ├── icon-192x192.png   [NEW]
│   ├── icon-512x512.png   [NEW]
│   └── apple-touch-icon.png [NEW]
src/
├── vite.config.ts         [MODIFY] - añadir VitePWA plugin
index.html                 [MODIFY] - añadir manifest link
```

---

## �🔄 Estado de Tests

**Cobertura:** ~62% (16 archivos, 130 tests)

- ✅ **Core Services**: Parser, DB, Export (100% passing)
- ✅ **UI Components**: AppHeader, BookCard, ExportPanel, ClippingCard (Passing)
- ✅ **Stores**: books, clippings (Passing)
- ✅ **Composables**: useSearch (Passing)

---

## 📊 Métricas de Calidad

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| TypeScript strict | Habilitado | ✅ OK |
| ESLint sin errores | 0 errores | ✅ OK |
| Tests unitarios | >60% coverage | ✅ ~62% |
| Bundle size | <300KB gzip | ✅ ~230KB |
| Lighthouse | >90 | ⏳ Pendiente |
| Responsive | Mobile-first | ✅ OK |
| i18n | Multi-idioma | ⚠️ Faltan keys |

---

*Última actualización: 2026-01-23*
