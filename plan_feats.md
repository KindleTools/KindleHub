# Plan de Funcionalidades - KindleHub

## Análisis Comparativo: kindle-tools-ts vs KindleHub UI

Este documento identifica las funcionalidades disponibles en `kindle-tools-ts` que **no están expuestas** en la interfaz de KindleHub, y propone cómo integrarlas.

---

## 1. Funcionalidades de Importación/Parsing

### 1.1 Configuración de Opciones de Parsing

**Estado actual:** El usuario solo puede elegir el formato (TXT/CSV/JSON) y arrastrar el archivo. No hay opciones configurables.

**Funcionalidades faltantes de kindle-tools-ts:**

| Opción | Descripción | Prioridad |
|--------|-------------|-----------|
| `language` | Selector de idioma (11 idiomas soportados: en, es, pt, de, fr, it, zh, ja, ko, nl, ru) o auto-detección | Alta |
| `mergeOverlapping` | Fusionar highlights superpuestos (cuando usuario extiende selección) | Alta |
| `extractTags` | Extraer etiquetas de las notas vinculadas | Media |
| `tagCase` | Transformación de tags: original, UPPERCASE, lowercase | Baja |
| `tagSeparators` | Separadores personalizados para tags | Baja |
| `highlightsOnly` | Importar solo highlights (ignorar notes/bookmarks) | Media |
| `removeUnlinkedNotes` | Eliminar notas que no se pudieron vincular | Media |
| `minContentLength` | Longitud mínima de contenido (filtrar muy cortos) | Baja |
| `excludeTypes` | Excluir tipos específicos (note, bookmark, clip, article) | Media |
| `excludeBooks` | Lista negra de libros a ignorar | Media |
| `onlyBooks` | Lista blanca de libros a importar | Media |
| `strict` | Modo estricto (fallar en errores vs advertencias) | Baja |

**Propuesta UI:**
- Añadir panel colapsable "Opciones avanzadas" en `/import` antes del dropzone
- Mostrar opciones más usadas por defecto, resto en "Más opciones..."

---

### 1.2 Re-importación de Formatos

**Estado actual:** Solo importa TXT nativo de Kindle.

**Funcionalidades faltantes:**

| Formato | Descripción | Prioridad |
|---------|-------------|-----------|
| JSON | Re-importar exportaciones JSON previas | Media |
| CSV | Re-importar exportaciones CSV previas (matching fuzzy de headers) | Media |

**Propuesta UI:**
- Extender selector de formato para incluir "JSON (re-import)" y "CSV (re-import)"
- Mostrar mensaje explicativo: "Importa un archivo previamente exportado"

---

## 2. Funcionalidades de Procesamiento

### 2.1 Detección de Calidad

**Estado actual:** No se muestran clippings sospechosos ni indicadores de calidad.

**Funcionalidades faltantes de kindle-tools-ts:**

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| `isSuspicious` | Marcar clippings problemáticos con razones: | Alta |
| - `too_short` | Contenido < 5 caracteres | |
| - `fragment` | Comienza con minúscula (selección incompleta) | |
| - `incomplete` | Sin puntuación final | |
| `isFuzzyDuplicate` | Detectar duplicados casi idénticos (similitud Jaccard) | Media |

**Propuesta UI:**
- Badge/icono de advertencia en ClippingCard para clippings sospechosos
- Filtro en búsqueda: "Mostrar solo sospechosos"
- Panel de revisión de calidad: listar todos los sospechosos para revisión manual

---

### 2.2 Merge de Highlights

**Estado actual:** Se hace automáticamente pero sin feedback visual.

**Funcionalidades faltantes:**

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Mostrar merges realizados | "X highlights fusionados" en warnings | Media |
| Merge manual | Seleccionar 2+ clippings y fusionarlos manualmente | Baja |
| Ver historial de merge | Qué clippings originaron uno fusionado | Baja |

**Propuesta UI:**
- Estadística en BatchWarnings: "5 highlights superpuestos fusionados"
- Botón "Merge" en acciones masivas del editor

---

### 2.3 Gestión de Tags

**Estado actual:** No hay soporte para tags en la UI.

**Funcionalidades faltantes:**

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Ver tags extraídos | Mostrar tags en ClippingCard | Media |
| Editar tags | Añadir/quitar tags a clippings | Media |
| Filtrar por tag | Búsqueda por tag específico | Media |
| Tag cloud | Visualización de tags más usados | Baja |

**Propuesta UI:**
- Chips de tags debajo del contenido en ClippingCard
- Input de tags con autocompletado en modo edición
- Filtro "Por tag" en `/search`

---

### 2.4 Estadísticas de Procesamiento

**Estado actual:** Solo se muestran warnings básicos.

**Funcionalidades faltantes de `ProcessResult`:**

| Estadística | Descripción | Prioridad |
|-------------|-------------|-----------|
| `duplicatesRemoved` | Cantidad de duplicados exactos eliminados | Alta |
| `mergedHighlights` | Cantidad de highlights fusionados | Alta |
| `linkedNotes` | Cantidad de notas vinculadas a highlights | Alta |
| `emptyRemoved` | Clippings vacíos eliminados | Media |
| `suspiciousFlagged` | Clippings marcados como sospechosos | Media |
| `fuzzyDuplicatesFlagged` | Duplicados fuzzy detectados | Media |
| `tagsExtracted` | Tags extraídos de notas | Media |
| `notesConsumed` | Notas consumidas (movidas a highlights) | Media |

**Propuesta UI:**
- Panel expandible en `/batch/{id}` con estadísticas detalladas de procesamiento
- Tooltips explicando cada métrica

---

## 3. Funcionalidades de Exportación

### 3.1 Templates de Markdown

**Estado actual:** Un solo formato Markdown fijo.

**Funcionalidades faltantes:**

| Preset | Descripción | Prioridad |
|--------|-------------|-----------|
| `default` | Estándar con blockquotes | Ya implementado |
| `minimal` | Minimalista, sin metadatos | Media |
| `obsidian` | Optimizado para Obsidian (callouts) | Alta |
| `notion` | Formato Notion | Media |
| `academic` | Estilo académico (citas) | Baja |
| `compact` | Compacto, menos espaciado | Media |
| `verbose` | Todos los metadatos | Baja |
| Custom | Template Handlebars personalizado | Baja |

**Propuesta UI:**
- Dropdown "Estilo de template" al seleccionar Markdown
- Preview actualiza según template seleccionado
- Opción avanzada: editor de template custom

---

### 3.2 Estructura de Carpetas

**Estado actual:** Exportación plana (un archivo o ZIP simple).

**Funcionalidades faltantes:**

| Estructura | Descripción | Prioridad |
|------------|-------------|-----------|
| `flat` | Todo en raíz | Ya implementado |
| `by-book` | `books/Título/Título.md` | Alta |
| `by-author` | `books/Autor/Título.md` | Alta |
| `by-author-book` | `books/Autor/Título/Título.md` | Media |

**Propuesta UI:**
- Selector "Estructura de carpetas" para formatos multi-archivo (Obsidian, Joplin)
- Preview de estructura de directorios

---

### 3.3 Opciones de Exportación Avanzadas

**Estado actual:** Solo "Incluir metadatos" y "Agrupar por libro" en settings.

**Funcionalidades faltantes:**

| Opción | Descripción | Prioridad |
|--------|-------------|-----------|
| `includeStats` | Incluir estadísticas en exportación | Media |
| `includeRaw` | Incluir campos originales (*Raw) | Baja |
| `includeClippingTags` | Incluir tags extraídos | Media |
| `archive` | Exportar como ZIP o TAR | Media |
| `noteGranularity` | per-clipping o per-book (Joplin/Obsidian) | Media |
| `authorCase` | Transformar mayúsculas del autor | Baja |
| `title` | Título personalizado de exportación | Baja |
| `notebookName` | Nombre del notebook (Joplin) | Baja |

**Propuesta UI:**
- Panel "Opciones avanzadas" colapsable en `/export`
- Opciones contextuales según formato seleccionado

---

## 4. Idiomas de Kindle

### 4.1 Selector de Idioma de Parsing

**Estado actual:** Auto-detección sin opción de override.

**Funcionalidades faltantes:**

| Idioma | Código | Prioridad |
|--------|--------|-----------|
| English | `en` | Ya soportado |
| Español | `es` | Ya soportado |
| Português | `pt` | Ya soportado |
| Deutsch | `de` | Ya soportado |
| Français | `fr` | Ya soportado |
| Italiano | `it` | Ya soportado |
| 中文 (Chinese) | `zh` | Media |
| 日本語 (Japanese) | `ja` | Media |
| 한국어 (Korean) | `ko` | Baja |
| Nederlands | `nl` | Baja |
| Русский (Russian) | `ru` | Baja |

**Propuesta UI:**
- Selector de idioma en opciones de importación
- Default: "Auto-detectar"
- Útil cuando auto-detección falla

---

## 5. Visualización y Estadísticas

### 5.1 Dashboard Mejorado

**Estado actual:** Dashboard con gráficos básicos.

**Funcionalidades faltantes:**

| Funcionalidad | Descripción | Prioridad |
|---------------|-------------|-----------|
| Estadísticas de procesamiento | Mostrar totales históricos de merges, dedup, etc. | Baja |
| Tag cloud | Visualización de tags más frecuentes | Media |
| Timeline por autor | Gráfico de actividad por autor | Baja |
| Heatmap de lectura | Calendario de actividad estilo GitHub | Media |

---

### 5.2 Indicadores de Calidad

**Estado actual:** No hay indicadores visuales de calidad.

**Funcionalidades faltantes:**

| Indicador | Descripción | Prioridad |
|-----------|-------------|-----------|
| Badge "Sospechoso" | Icono de advertencia en clippings problemáticos | Alta |
| Badge "Fuzzy Duplicate" | Indicador de posible duplicado | Media |
| Score de calidad | Puntuación general del batch importado | Baja |

**Propuesta UI:**
- Icono/badge en ClippingCard
- Tooltip explicando la razón
- Filtro rápido "Ver sospechosos"

---

## 6. Resumen de Prioridades

### Alta Prioridad (MVP v1.1)
1. Opciones de parsing configurables (mergeOverlapping, language, highlightsOnly)
2. Detección y visualización de clippings sospechosos
3. Templates de Markdown (presets)
4. Estructura de carpetas en exportación multi-archivo
5. Estadísticas detalladas de procesamiento en batch

### Media Prioridad (v1.2)
1. Soporte de tags (extracción, visualización, filtrado)
2. Re-importación JSON/CSV
3. Opciones de exportación avanzadas
4. Filtros por libro en importación
5. Detección de fuzzy duplicates
6. Heatmap de lectura

### Baja Prioridad (v1.3+)
1. Templates custom (Handlebars)
2. Merge manual de clippings
3. Idiomas adicionales (zh, ja, ko, nl, ru)
4. Tag cloud
5. Editor de templates

---

## 7. Propuesta de Implementación

### Fase 1: Opciones de Importación
```
/import
├── Selector de formato (existente)
├── [NUEVO] Panel "Opciones de parsing" (colapsable)
│   ├── Idioma (dropdown: Auto, EN, ES, ...)
│   ├── Fusionar superpuestos (toggle)
│   ├── Solo highlights (toggle)
│   └── [Más opciones...]
│       ├── Extraer tags (toggle)
│       ├── Eliminar notas sueltas (toggle)
│       └── Longitud mínima (input)
└── Dropzone (existente)
```

### Fase 2: Indicadores de Calidad
```
BatchClippingCard
├── Contenido (existente)
├── Metadatos (existente)
└── [NUEVO] Badges
    ├── ⚠️ Sospechoso (tooltip: "Fragmento incompleto")
    └── 🔄 Posible duplicado
```

### Fase 3: Exportación Avanzada
```
/export
├── Selector de formato (existente)
├── [NUEVO] Opciones por formato
│   ├── Markdown: Preset de template
│   ├── Obsidian: Estructura de carpetas
│   └── Joplin: Granularidad de notas
├── [NUEVO] Opciones generales
│   ├── Incluir estadísticas
│   ├── Incluir tags
│   └── Formato de archivo (single/ZIP)
└── Preview (existente)
```

### Fase 4: Gestión de Tags
```
/search
├── Búsqueda (existente)
├── Filtros (existente)
│   ├── Por tipo
│   ├── Por libro
│   └── [NUEVO] Por tag (multi-select)
└── Resultados con tags visibles

ClippingCard
├── Contenido
├── Metadatos
└── [NUEVO] Tags (chips editables)
```

---

## 8. Consideraciones Técnicas

### Cambios en Servicios

**parser.service.ts:**
- Exponer `ParseOptions` completas al llamar a kindle-tools-ts
- Devolver `ProcessResult` con estadísticas de procesamiento

**export.service.ts:**
- Exponer `ExporterOptions` completas
- Soporte para templates presets
- Soporte para estructuras de carpetas

### Cambios en Stores

**batches.ts:**
- Almacenar `ProcessResult` con estadísticas
- Almacenar opciones de parsing usadas

**clippings.ts:**
- Añadir campo `tags: string[]`
- Añadir campo `isSuspicious?: { reasons: string[] }`

### Cambios en DB Schema

```typescript
// Añadir a Clipping
tags?: string[]
isSuspicious?: {
  reasons: ('too_short' | 'fragment' | 'incomplete')[]
}
isFuzzyDuplicate?: boolean
```

---

## 9. Wireframes Conceptuales

### Import Options Panel
```
┌─────────────────────────────────────────────────┐
│ ⚙️ Opciones de parsing                    [▼]  │
├─────────────────────────────────────────────────┤
│ Idioma:        [Auto-detectar     ▼]           │
│                                                 │
│ ☑ Fusionar highlights superpuestos             │
│ ☐ Solo highlights (ignorar notas/marcadores)   │
│ ☐ Extraer tags de notas                        │
│                                                 │
│ [+ Más opciones...]                            │
└─────────────────────────────────────────────────┘
```

### Batch Stats Panel
```
┌─────────────────────────────────────────────────┐
│ 📊 Estadísticas de procesamiento               │
├─────────────────────────────────────────────────┤
│ Duplicados eliminados:        12               │
│ Highlights fusionados:         3               │
│ Notas vinculadas:             45               │
│ Clippings sospechosos:         5 [Ver ▶]      │
│ Tags extraídos:               28               │
└─────────────────────────────────────────────────┘
```

### Export Options Panel
```
┌─────────────────────────────────────────────────┐
│ Formato: [Markdown              ▼]             │
├─────────────────────────────────────────────────┤
│ Template:  ○ Default  ○ Minimal  ● Obsidian    │
│            ○ Notion   ○ Academic ○ Custom      │
│                                                 │
│ ☑ Incluir tags                                 │
│ ☐ Incluir estadísticas                         │
│ ☐ Exportar como ZIP                            │
└─────────────────────────────────────────────────┘
```

---

## 10. Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Opciones de parsing expuestas | 100% de ParseOptions accesibles |
| Formatos de exportación | 7 presets de Markdown disponibles |
| Cobertura de idiomas | 11 idiomas seleccionables |
| Indicadores de calidad | 100% de clippings sospechosos marcados |
| Gestión de tags | CRUD completo de tags |

---

## 11. Implementación Completada (2026-01-24)

### Fase 1: Opciones de Parsing ✅
- **ImportOptions.vue**: Panel colapsable con opciones de parsing
- **settings.ts**: `ImportPreferences` con language, mergeOverlapping, extractTags, highlightsOnly, removeUnlinkedNotes
- **parser.service.ts**: Paso de `ParseOptions` a kindle-tools-ts
- **Traducciones**: EN/ES para todas las opciones

### Fase 2: Estadísticas de Procesamiento y Calidad ✅
- **BatchStatsPanel.vue**: Panel con estadísticas de procesamiento (duplicados, merges, links, sospechosos, tags)
- **types/batch.ts**: Extended `BatchStats` con mergedHighlights, suspiciousFlagged, tagsExtracted
- **BatchClippingCard.vue**: Badge de "Sospechoso" con tooltip
- **parser.service.ts**: Extracción de `suspiciousIds` del ProcessResult
- **batches.ts**: Almacenamiento de estadísticas extendidas

### Fase 3: Opciones de Exportación Avanzadas ✅
- **ExportOptions.vue**: Panel con opciones contextuales por formato
- **settings.ts**: Extended `ExportPreferences` con markdownPreset, folderStructure, noteGranularity, includeStats, includeTags
- **ExportPanel.vue**: Integración de opciones con kindle-tools-ts ExporterOptions
- **Traducciones**: 7 presets de Markdown, 4 estructuras de carpetas, granularidad

### Fase 4: Gestión de Tags ✅
- **TagInput.vue**: Componente reutilizable con chips coloreados, sugerencias, teclado
- **ClippingCard.vue**: Display de tags como chips
- **BatchClippingCard.vue**: Edición de tags en modo edición
- **useSearch.ts**: Filtrado por tags con `toggleTagFilter()`
- **search.vue**: UI de filtro por tags
- **db.service.ts**: Función `getAllTags()` para obtener tags únicos

### Fase 5: Re-importación JSON/CSV ✅
- **import.vue**: Labels descriptivos para formatos de re-importación
- **Traducciones**: format_txt, format_csv, format_json con descripciones

### Archivos Creados
| Archivo | Descripción |
|---------|-------------|
| `src/components/import/ImportOptions.vue` | Panel de opciones de parsing |
| `src/components/batch/BatchStatsPanel.vue` | Estadísticas de procesamiento |
| `src/components/export/ExportOptions.vue` | Opciones de exportación avanzadas |
| `src/components/ui/TagInput.vue` | Input de tags con chips |

### Archivos Modificados
- `src/stores/settings.ts` - ImportPreferences, ExportPreferences extendidos
- `src/services/parser.service.ts` - ParseOptions, suspiciousIds
- `src/services/export.service.ts` - ExporterOptions completas
- `src/services/db.service.ts` - getAllTags()
- `src/stores/batches.ts` - BatchStats extendido
- `src/types/batch.ts` - SuspiciousReason, campos nuevos
- `src/composables/useSearch.ts` - Filtrado por tags
- `src/pages/import.vue` - Integración ImportOptions
- `src/pages/batch/[id].vue` - Integración BatchStatsPanel
- `src/pages/search.vue` - Filtro por tags
- `src/components/batch/BatchClippingCard.vue` - Tags y badge sospechoso
- `src/components/clippings/ClippingCard.vue` - Display de tags
- `src/components/export/ExportPanel.vue` - ExportOptions
- `src/locales/en.json`, `es.json` - Traducciones

---

## 12. Roadmap Futuro

### Mejoras de UX (Prioridad Alta)

| Idea | Descripción | Complejidad |
|------|-------------|-------------|
| **Filtro por rango de fechas** | Exponer `dateRange` en UI de búsqueda con date picker | Baja |
| **Portadas de libros** | Integrar Open Library API para obtener covers automáticamente | Media |
| **Merge de libros duplicados** | Fusionar libros importados con títulos ligeramente diferentes | Media |
| **Daily Review** | Estilo Readwise: X highlights aleatorios al día para repaso espaciado | Media |

### Mejoras Técnicas (Prioridad Media)

| Idea | Descripción | Complejidad |
|------|-------------|-------------|
| **PWA completa** | Service worker para uso offline real | Media |
| **Keyboard shortcuts globales** | Ctrl+K búsqueda rápida, atajos de navegación | Baja |
| **Exportación selectiva** | Exportar solo libros/highlights seleccionados | Media |
| **Undo/Redo** | Historial de cambios para ediciones | Alta |

### Integraciones Externas (Prioridad Baja)

| Idea | Descripción | Complejidad |
|------|-------------|-------------|
| **Goodreads** | Fetch de metadatos y portadas | Alta |
| **Notion API** | Exportación directa a Notion | Alta |
| **Obsidian Sync** | Detección de carpeta de Obsidian | Media |

### Visualización Avanzada

| Idea | Descripción | Complejidad |
|------|-------------|-------------|
| **Timeline por autor** | Gráfico de actividad por autor en el tiempo | Media |
| **Comparación de períodos** | Estadísticas año vs año | Media |
| **Goals/Streaks** | Objetivos de lectura con tracking de rachas | Media |

---

*Documento generado el 2026-01-23*
*Actualizado el 2026-01-24 con implementación completada*
*Basado en análisis de kindle-tools-ts v0.5.0 y KindleHub MVP*
