# KindleHub - Roadmap

> **Estado actual**: MVP funcional (~95% completado)
> **Objetivo**: Pulir UX, completar deployment y mejorar cobertura de tests

---

## Resumen de Estado

### Completado
- **Importacion**: TXT, CSV, JSON desde kindle-tools-ts
- **Almacenamiento**: IndexedDB con Dexie.js
- **Visualizacion**: Library de libros, detalle de libro, cards de clippings
- **Editor**: Tabla editable con CRUD, seleccion multiple, acciones masivas
- **Busqueda**: Full-text con Fuse.js, filtros por tipo/libro/fecha
- **Exportacion**: 6 formatos (Markdown, JSON, CSV, HTML, Obsidian, Joplin) con preview
- **Settings**: Dark mode, preferencias de exportacion, backup/restore
- **Infraestructura**: Vue 3 + Vite + TypeScript strict + Tailwind + Pinia + ESLint + Husky

---

## Pendiente

### Fase 1: Mejoras UX y Pulido

**Prioridad Alta:**
- [x] Toast notifications para feedback de acciones (importar, exportar, eliminar)
- [x] Skeleton component reutilizable (Skeleton.vue)
- [x] Mejorar responsive en tabla del editor (cards en mobile)
- [x] Modal de confirmacion reutilizable (ConfirmModal.vue)

**Prioridad Media:**
- [x] Animaciones y transiciones suaves (page transitions, card animations, toast animations)
- [x] Tooltips en botones de accion (Tooltip.vue)
- [ ] Sidebar colapsable en movil
- [x] Keyboard shortcuts (Ctrl+K/F buscar, / focus search, Escape cerrar)

**Prioridad Baja:**
- [ ] Mejoras de accesibilidad (ARIA labels, focus management)
- [ ] Skeleton loading para cards de libros
- [ ] Empty states con ilustraciones SVG

---

### Fase 2: Testing

**Cobertura actual:** ~50% (10 archivos de test, 82 tests)

**Tests unitarios pendientes:**
- [x] `parser.service.spec.ts` - Tests del servicio de importacion
- [x] `export.service.spec.ts` - Tests del servicio de exportacion (19 tests)
- [x] `db.service.spec.ts` - Tests de operaciones de base de datos
- [x] `books.spec.ts` - Tests del store de libros
- [x] `settings.spec.ts` - Tests del store de settings

**Tests de componentes pendientes:**
- [ ] `BookCard.spec.ts`
- [ ] `ClippingCard.spec.ts`
- [ ] `ExportPanel.spec.ts`
- [ ] `DataTable.spec.ts`

**Tests E2E (opcional):**
- [ ] Flujo completo de importacion
- [ ] Flujo completo de exportacion

---

### Fase 3: Deployment y Documentacion

**GitHub Pages:**
- [x] Workflow de CI/CD configurado (`.github/workflows/deploy.yml`)
- [x] Verificar que el build funciona correctamente
- [x] Configurar base URL para GitHub Pages (`/KindleHub/`)
- [ ] Probar deployment en produccion

**Documentacion:**
- [x] README actualizado con estado real del proyecto
- [x] ARCHITECTURE.md con documentacion tecnica
- [ ] Agregar screenshots/GIFs de la aplicacion

---

### Fase 4: Mejoras Futuras (Backlog)

Estas funcionalidades no son necesarias para el MVP pero agregarian valor:

**PWA Support:**
- [ ] Manifest.json
- [ ] Service Worker para offline
- [ ] Iconos para instalacion

**Funcionalidades adicionales:**
- [ ] Importar desde URL (pegar link a archivo)
- [ ] Historial de cambios (undo/redo)
- [ ] Tags personalizados para clippings
- [ ] Estadisticas avanzadas (graficos de lectura)
- [ ] Temas personalizables (colores custom)

**Optimizaciones:**
- [x] Verificar bundle size (~230KB gzipped - dentro del objetivo)
- [ ] Lighthouse audit (target >90)
- [ ] Lazy loading de rutas
- [ ] Virtual scrolling para listas grandes

---


## � Futuras Mejoras - Sistema de Lotes (Batches)

> **Propuesta**: Sistema avanzado de pre-procesamiento de datos antes de importar a la base de datos.

### Problema Actual
- Los archivos importados van directamente a IndexedDB sin revisión previa
- No hay opciones avanzadas de parser/exportación accesibles al usuario
- No hay forma de "purgar" o editar datos antes de guardarlos

### Solución Propuesta: Gestión de Lotes

#### Flujo de trabajo
1. **Cargar archivo** → Parsear con kindle-tools-ts
2. **Crear lote temporal** → Datos en memoria (no guardados aún)
3. **Revisar y editar lote**:
   - Ver warnings y errores de parsing
   - Marcar clippings para eliminar/ignorar
   - Editar campos individuales
   - **Edición masiva**: cambiar autor/libro en múltiples clippings
   - Aplicar tags a varios clippings
   - Ver opciones avanzadas de importación/exportación
4. **Decidir acción**:
   - "Importar a biblioteca" → Guardar en IndexedDB
   - "Solo exportar" → Descargar sin guardar
   - "Descartar" → Cancelar el lote

#### Componentes necesarios
```
src/
├── stores/
│   └── batches.ts              # Estado de lotes temporales
├── pages/
│   ├── batch/
│   │   ├── index.vue           # Lista de lotes (histórico)
│   │   └── [id].vue            # Editor de lote específico
├── components/
│   └── batch/
│       ├── BatchEditor.vue     # Editor de lote completo
│       ├── BatchActions.vue    # Acciones masivas
│       ├── ImportOptions.vue   # Opciones avanzadas de parser
│       └── ExportOptions.vue   # Opciones avanzadas de export
```

#### Funcionalidades de edición masiva
- Cambiar autor → aplica a todos los clippings del mismo libro
- Cambiar título de libro → actualiza todas las referencias
- Aplicar/quitar tags a selección múltiple
- Eliminar duplicados automáticamente
- Dividir/unir libros

#### Histórico de lotes
- Guardar metadatos de lotes procesados
- Fecha, archivo origen, cantidad importada/exportada
- Poder re-importar desde histórico

### Prioridad
🟢 En Progreso - Fase 2 (Editing) completada

### Estado de Implementación

#### Fase 1: Core Infrastructure ✅
- [x] Store y Tipos de datos (`batches.ts`, `batch.ts`)
- [x] Página de revisión (`batch/[id].vue`)
- [x] Utilidades de servicio (`batch.service.ts`)
- [x] Redirección desde Importar a Batch Editor

#### Fase 2: Editing Features ✅
- [x] `BatchClippingCard.vue` con edición inline (content, note, page, location)
- [x] `BatchActions.vue` barra flotante para acciones masivas
- [x] Multi-select con checkboxes
- [x] Bulk delete de clippings seleccionados
- [x] Badges de estado (Modified, Warnings)

#### Fase 3: Advanced Features ✅
- [x] `BatchWarnings.vue` panel de warnings (UI + Store support)
- [x] `batch/index.vue` página de historial de lotes
- [x] "Export Only" workflow (exportar sin guardar)
- [x] Persistir historial en IndexedDB
- [x] Bulk change author/title (edición masiva de autor/título)
- [ ] *Enhanced parser specifics* (infraestructura lista, parser pendiente de actualización para emitir warnings detallados)

### Próximos Pasos Recomendados
- Testing exhaustivo de casos borde en edición masiva
- Mejorar el parser para detectar anomalías reales
- Implementar PWA features (Fase 4)



---


## Metricas de Calidad

| Metrica | Objetivo | Estado |
|---------|----------|--------|
| TypeScript strict | Habilitado | OK |
| ESLint sin errores | 0 errores | OK |
| Tests unitarios | >60% coverage | ~50% (82 tests) |
| Bundle size | <300KB gzip | ~230KB OK |
| Lighthouse | >90 | Pendiente |
| Responsive | Mobile-first | Mejorado |
| Animaciones | 200-300ms | OK |
| Keyboard Shortcuts | Ctrl+K, /, Esc | OK |

---

## Referencias

- [kindle-tools-ts](https://github.com/KindleTools/kindle-tools-ts) - Libreria core
- [Vue 3](https://vuejs.org) - Framework
- [Pinia](https://pinia.vuejs.org) - State management
- [Tailwind CSS](https://tailwindcss.com) - Estilos
- [Dexie.js](https://dexie.org) - IndexedDB wrapper
- [Fuse.js](https://fusejs.io) - Busqueda fuzzy

---

## 🔬 Análisis de Arquitectura y Propuestas de Mejora (2026)

> **Fecha del análisis**: 2026-01-22
> **Basado en**: Best practices de Vue 3, Pinia, TypeScript y Feature-Sliced Design 2025-2026

### ✅ Lo que está bien implementado

El proyecto sigue la mayoría de las mejores prácticas actuales:

| Aspecto | Estado | Notas |
|---------|--------|-------|
| Vue 3 Composition API | ✅ Excelente | `<script setup>` en todos los componentes |
| TypeScript strict | ✅ Excelente | `exactOptionalPropertyTypes`, `noUnchecked*` |
| Pinia setup stores | ✅ Excelente | Stores modulares con Composition API syntax |
| Vite + plugins modernos | ✅ Excelente | Auto-imports, file-based routing, chunk splitting |
| Arquitectura por capas | ✅ Bien | Pages → Components → Composables → Stores → Services |
| Alias `@/` para imports | ✅ Bien | Evita imports relativos complejos |
| ESLint + Stylistic | ✅ Bien | Reemplaza Prettier con mejor integración |
| Pre-commit hooks | ✅ Bien | Husky + lint-staged |
| CI/CD | ✅ Bien | GitHub Actions para deploy |

---

### 🔧 Propuestas de Mejora por Categoría

#### 1. Consolidación de Tipos (Prioridad: Alta)

**Problema**: Duplicación de tipos entre archivos
- `ClippingsStats` definido en `stores/clippings.ts` y `types/index.ts`
- `ExportFormat` definido en `types/index.ts` y `export.service.ts`

**Solución**:
```
src/types/
├── index.ts          # Re-exports públicos
├── clipping.types.ts # Tipos de clippings
├── book.types.ts     # Tipos de libros
├── export.types.ts   # Tipos de exportación
└── batch.types.ts    # Tipos de batches (ya existe)
```

**Tareas**:
- [ ] Centralizar `ClippingsStats` en `types/clipping.types.ts`
- [ ] Centralizar `ExportFormat` y `ExportOptions` en `types/export.types.ts`
- [ ] Eliminar duplicaciones y usar imports desde `@/types`

---

#### 2. Desacoplamiento de Composables (Prioridad: Alta)

**Problema**: `useDataEditor.ts` importa `db` directamente, acoplándose a Dexie.

**Solución**: Inyectar el servicio de DB como dependencia.

```typescript
// Antes (acoplado)
import { db } from '@/db/schema'

// Después (desacoplado)
export function useDataEditor(options: UseDataEditorOptions & {
  dbService?: typeof import('@/services/db.service')
}) {
  const dbService = options.dbService ?? defaultDbService
  // ...
}
```

**Tareas**:
- [ ] Refactorizar `useDataEditor` para recibir servicio de DB
- [ ] Crear `useClippingsEditor` como wrapper con dependencias inyectadas
- [ ] Facilitar testing sin mocks complejos

---

#### 3. Patrón Factory para Exportadores (Prioridad: Media)

**Problema**: `export.service.ts` tiene un switch con 6 casos muy similares.

**Solución**: Implementar patrón Registry/Factory.

```typescript
// export.service.ts
const exporterRegistry: Record<ExportFormat, () => BaseExporter> = {
  markdown: () => new MarkdownExporter(),
  json: () => new JsonExporter(),
  csv: () => new CsvExporter(),
  html: () => new HtmlExporter(),
  obsidian: () => new ObsidianExporter(),
  joplin: () => new JoplinExporter()
}

const formatMetadata: Record<ExportFormat, FormatMetadata> = {
  markdown: { filename: 'kindle-highlights.md', mimeType: 'text/markdown', isMultiFile: false },
  // ...
}

export async function exportClippings(clippings: Clipping[], format: ExportFormat, options?: Partial<ExporterOptions>): Promise<ExportResultData> {
  const exporter = exporterRegistry[format]()
  const metadata = formatMetadata[format]
  const result = await exporter.export(clippings, { ...defaultOptions, ...options })
  if (result.isErr()) throw new Error(result.error.message)
  return { format, ...metadata, content: result.value.output, files: result.value.files ?? [] }
}
```

**Tareas**:
- [ ] Crear `exporterRegistry` con factory functions
- [ ] Crear `formatMetadata` con configuración por formato
- [ ] Reducir `exportClippings` a ~15 líneas

---

#### 4. Unificación de Tests (Prioridad: Media)

**Problema**: Tests distribuidos en dos ubicaciones:
- `tests/unit/` (stores, services, composables)
- `src/components/*.spec.ts` (componentes)

**Mejor práctica 2025**: Co-location (tests junto al código) o centralización consistente.

**Opción A - Co-location** (recomendada para componentes):
```
src/components/books/
├── BookCard.vue
├── BookCard.spec.ts   ← Test junto al componente
└── BookList.vue
```

**Opción B - Centralización** (mantener estructura actual):
```
tests/
├── unit/
│   ├── components/    ← Mover tests de src/ aquí
│   ├── composables/
│   ├── services/
│   └── stores/
└── e2e/               ← Futuro
```

**Tareas**:
- [ ] Decidir estrategia (co-location vs centralización)
- [ ] Mover/unificar archivos `.spec.ts`
- [ ] Actualizar `vitest.config.ts` si es necesario

---

#### 5. Utilidades Puras (Prioridad: Baja)

**Problema**: Funciones como `formatDate` en `BookCard.vue` podrían reutilizarse.

**Solución**: Crear directorio `utils/` o `lib/` para funciones puras.

```
src/
├── utils/
│   ├── date.utils.ts      # formatRelativeDate, formatDate
│   ├── color.utils.ts     # generateCoverColor
│   └── string.utils.ts    # truncate, slugify
```

**Tareas**:
- [ ] Crear `src/utils/date.utils.ts` con `formatRelativeDate`
- [ ] Extraer `generateCoverColor` si existe inline
- [ ] Documentar utilidades disponibles

---

#### 6. Error Handling Centralizado (Prioridad: Media)

**Problema**: Error handling inconsistente entre stores y services.

**Solución**: Crear un sistema de errores tipados.

```typescript
// types/error.types.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public context?: Record<string, unknown>
  ) {
    super(message)
  }
}

export type ErrorCode =
  | 'DB_READ_ERROR'
  | 'DB_WRITE_ERROR'
  | 'PARSE_ERROR'
  | 'EXPORT_ERROR'
  | 'NETWORK_ERROR'

// composables/useErrorHandler.ts
export function useErrorHandler() {
  const toast = useToast()

  function handleError(error: unknown) {
    if (error instanceof AppError) {
      toast.error(getErrorMessage(error.code))
      console.error(`[${error.code}]`, error.message, error.context)
    } else {
      toast.error('An unexpected error occurred')
      console.error(error)
    }
  }

  return { handleError }
}
```

**Tareas**:
- [ ] Crear `types/error.types.ts` con clases de error
- [ ] Crear `composables/useErrorHandler.ts`
- [ ] Migrar stores para usar errores tipados
- [ ] Integrar con sistema de toasts existente

---

#### 7. Lazy Loading de Rutas (Prioridad: Media)

**Problema**: Todas las páginas se cargan en el bundle inicial.

**Solución**: Configurar lazy loading en `unplugin-vue-router`.

```typescript
// vite.config.ts
VueRouter({
  routesFolder: 'src/pages',
  // Lazy load all pages except index
  importMode: (filepath) => {
    return filepath.includes('index.vue') ? 'sync' : 'async'
  }
})
```

**Tareas**:
- [ ] Configurar `importMode` en VueRouter plugin
- [ ] Verificar que code splitting funciona correctamente
- [ ] Medir impacto en bundle size inicial

---

#### 8. Virtual Scrolling (Prioridad: Baja - Para escala)

**Problema**: Listas grandes (1000+ clippings) pueden afectar rendimiento.

**Solución**: Implementar virtual scrolling con `@vueuse/core` o `vue-virtual-scroller`.

```typescript
// Ya tienes @vueuse/core instalado
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(clippings, {
  itemHeight: 120
})
```

**Tareas**:
- [x] Evaluar necesidad basada en uso real
- [x] Implementar en `ClippingList.vue` si hay problemas de rendimiento
- [x] Considerar paginación como alternativa más simple

---

#### 9. Accesibilidad (a11y) (Prioridad: Media)

**Problema**: Faltan ARIA labels y focus management.

**Mejoras específicas**:

```vue
<!-- Antes -->
<button @click="handleDelete">
  <Trash class="h-4 w-4" />
</button>

<!-- Después -->
<button
  @click="handleDelete"
  :aria-label="`Delete ${clipping.content.slice(0, 20)}...`"
>
  <Trash class="h-4 w-4" aria-hidden="true" />
</button>
```

**Tareas**:
- [x] Agregar `aria-label` a botones con solo iconos
- [ ] Agregar `aria-hidden="true"` a iconos decorativos
- [ ] Implementar focus trap en modales (ya usa HeadlessUI)
- [ ] Agregar skip links para navegación
- [ ] Ejecutar audit con axe-core o Lighthouse

---

#### 10. Internacionalización (i18n) (Prioridad: Baja)

**Problema**: Strings hardcoded, setting de idioma sin implementar.

**Solución**: Implementar vue-i18n cuando sea necesario.

```typescript
// plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, es }
})
```

**Tareas**:
- [x] Instalar `vue-i18n`
- [x] Crear estructura de archivos de traducción
- [x] Extraer strings de componentes principales (Completado)
- [x] Conectar con `settings.language`
- [x] Extraer strings: Layout & Navigation <!-- id: 17 -->
- [x] Extraer strings: Home & Library Pages <!-- id: 18 -->
- [x] Extraer strings: Import & Export Pages <!-- id: 19 -->
- [x] Extraer strings: Editor & Search Pages <!-- id: 20 -->
- [x] Extraer strings: Components (Cards, Modals) <!-- id: 21 -->
- [x] Update locale files (EN, ES comprehensive) <!-- id: 22 -->
- [ ] Update other locales (IT, DE, FR, PT) to match EN/ES structure <!-- id: 23 -->
- [ ] Auditoría de traducciones (Fix English strings appearing in other languages) <!-- id: 24 -->
- [x] Implementar detección automática del navegador
- [x] Agregar idiomas adicionales: IT, DE, FR, PT

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

### 📊 Matriz de Prioridades

| Mejora | Impacto | Esfuerzo | Prioridad |
|--------|---------|----------|-----------|
| Consolidación de tipos | Alto | Bajo | 🔴 Alta |
| Desacoplamiento composables | Alto | Medio | 🔴 Alta |
| Factory para exportadores | Medio | Bajo | 🟡 Media |
| Unificación de tests | Medio | Bajo | 🟡 Media |
| Error handling centralizado | Alto | Medio | 🟡 Media |
| Lazy loading rutas | Medio | Bajo | 🟡 Media |
| Accesibilidad | Alto | Medio | 🟡 Media |
| Utilidades puras | Bajo | Bajo | 🟢 Baja |
| Virtual scrolling | Medio | Medio | ✅ Completado |
| Internacionalización | Bajo | Alto | 🟡 En Progreso |
| Migración completa i18n | Alto | Alto | 🔴 Alta |

---

### 📚 Referencias de Mejores Prácticas Consultadas

- [Vue 3 Composition API Best Practices 2025](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia Best Practices](https://masteringpinia.com/blog/5-best-practices-for-scalable-vuejs-state-management-with-pinia)
- [Vue 3 + TypeScript Enterprise Architecture 2025](https://eastondev.com/blog/en/posts/dev/20251124-vue3-typescript-best-practices/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Vite Advanced Guide 2025](https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025)
- [Vue.js Large Scale App Structure](https://vueschool.io/articles/vuejs-tutorials/how-to-structure-a-large-scale-vue-js-application/)

---

*Ultima actualizacion: 2026-01-22*
