# Mejoras Sugeridas para kindle-tools-ts

> **Nota**: kindle-tools-ts está en v1.2 y es feature-complete. Este documento recopila mejoras que podrían mejorar la experiencia al usar la librería desde KindleHub/ClippingConverter.
> 
> Estas sugerencias se documentan aquí para evaluar su implementación conforme se desarrolla KindleHub.

---

## 🎯 Prioridad Alta (Impacto directo en KindleHub)

### 1. Preview Mode / Dry Run (GUI Support)

**Problema**: Las transformaciones (merge, dedupe, link) se aplican sin que el usuario pueda ver exactamente qué cambiará. Para una GUI, el usuario necesita revisar y aprobar decisiones antes de aplicarlas.

**Estado actual en kindle-tools-ts**:
- Las funciones individuales están exportadas y pueden llamarse por separado
- `removeDuplicates(clippings, false)` flaguea en vez de borrar
- `smartMergeHighlights(clippings, false)` flaguea en vez de fusionar
- Los clippings tienen campos: `isSuspiciousHighlight`, `possibleDuplicateOf`, `similarityScore`

**Lo que falta**: No hay forma de obtener los **pares exactos** de qué se fusionaría con qué.

**Propuesta**:
```typescript
interface ProcessingPreview {
  duplicates: Array<{ keep: Clipping; discard: Clipping; reason: 'exact' | 'fuzzy' }>;
  merges: Array<{ result: Clipping; sources: [Clipping, Clipping] }>;
  noteLinks: Array<{ highlight: Clipping; note: Clipping; confidence: number }>;
  suspicious: Array<{ clipping: Clipping; reason: SuspiciousReason }>;
  orphanNotes: Clipping[];  // Notas sin highlight asociado
}

// Uso en GUI
const preview = previewProcessing(clippings);
// Mostrar al usuario: "Se fusionarán estos 5 pares de highlights..."
// Usuario aprueba/rechaza cada uno
const approved = userSelectsFromPreview(preview);
const final = applyApprovedChanges(clippings, approved);
```

**Beneficio para KindleHub**: GUI puede mostrar decisiones antes de aplicarlas.
**Esfuerzo estimado**: ~4-6 horas
**Archivos afectados**: `core/processor.ts`, nuevo `core/preview.ts`

---

### 2. Normalización de Autores

**Problema**: El mismo autor puede aparecer como:
- "J.K. Rowling"
- "Rowling, J.K."
- "JK Rowling"

Esto crea libros "duplicados" en la vista de biblioteca.

**Estado actual**: Existe `author-normalizer.ts` con `areSameAuthor()` pero NO está integrado en el procesamiento.

**Propuesta**:
```typescript
processClippings(clippings, {
  normalizeAuthors: true,  // Unifica variantes de autor
});

// O para GUI, preview de sugerencias:
const authorGroups = detectAuthorVariants(clippings);
// [{ canonical: "J.K. Rowling", variants: ["Rowling, J.K.", "JK Rowling"], count: 15 }]
```

**Beneficio para KindleHub**: Vista más limpia agrupando por autor real.
**Esfuerzo estimado**: ~2-3 horas
**Archivos afectados**: `core/processing/author-normalizer.ts` (nuevo), `processor.ts`

---

### 3. Batch Processing con Callback de Progreso

**Problema**: Al procesar archivos grandes, no hay forma de informar al usuario sobre el progreso.

**Propuesta**:
```typescript
export async function parseClippingsBatch(
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Clipping[]> {
  // Procesar múltiples archivos con callback de progreso
}

// Uso en KindleHub
await parseClippingsBatch(files, (current, total) => {
  progress.value = (current / total) * 100;
});
```

**Beneficio para KindleHub**: Progress bar real durante importación.

---

## 🔧 Prioridad Media (Nice to have)

### 4. Mejorar Tipado de Opciones

**Problema**: Algunas opciones podrían ser más específicas para mejor autocomplete.

**Propuesta**:
```typescript
export interface ParserOptions {
  encoding?: 'utf-8' | 'latin1' | 'ascii';  // Más específico que string
  strictMode?: boolean;
  ignoreEmpty?: boolean;
  customDelimiter?: string;  // Para CSV
}

export interface ExportOptions {
  includeMetadata?: boolean;
  groupBy?: 'book' | 'author' | 'date' | 'type';
  sortBy?: 'date' | 'location' | 'book';
  sortOrder?: 'asc' | 'desc';
  template?: string;  // Custom Handlebars template
  fileNaming?: (clipping: Clipping) => string;  // Custom file naming
}
```

---

### 5. Validación de Datos con Detalle

**Problema**: No hay forma de validar clippings individuales para mostrar errores al usuario.

**Propuesta**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export function validateClipping(clipping: Clipping): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (!clipping.book) {
    errors.push({ field: 'book', message: 'Book title is required' });
  }
  
  if (!clipping.content && clipping.type !== 'bookmark') {
    errors.push({ field: 'content', message: 'Content is required for highlights and notes' });
  }
  
  if (clipping.wordCount && clipping.wordCount < 5) {
    warnings.push({ field: 'content', message: 'Content is very short' });
  }
  
  return { valid: errors.length === 0, errors, warnings };
}
```

**Beneficio para KindleHub**: Mostrar errores de validación inline en la tabla editable.

---

### 6. Estadísticas Avanzadas

**Problema**: Sería útil tener estadísticas más detalladas para dashboards.

**Propuesta**:
```typescript
export function getStatistics(clippings: Clipping[]): Statistics {
  return {
    total: clippings.length,
    byType: {
      highlights: clippings.filter(c => c.type === 'highlight').length,
      notes: clippings.filter(c => c.type === 'note').length,
      bookmarks: clippings.filter(c => c.type === 'bookmark').length
    },
    byBook: groupByBook(clippings),  // Map<string, number>
    byAuthor: groupByAuthor(clippings),
    dateRange: {
      earliest: findEarliest(clippings),
      latest: findLatest(clippings)
    },
    wordStats: {
      total: sumWords(clippings),
      average: avgWords(clippings),
      longest: findLongest(clippings)
    }
  };
}
```

---

### 7. Merge/Deduplicate con Estrategia

**Problema**: Cuando se importan múltiples archivos, hay opciones de cómo manejar duplicados.

**Propuesta**:
```typescript
export function mergeClippings(
  sources: Clipping[][],
  strategy: 'keep-first' | 'keep-last' | 'keep-all' = 'keep-last'
): Clipping[] {
  // Merge multiple imports
}

export function deduplicateClippings(
  clippings: Clipping[],
  by: 'content' | 'location' | 'exact' = 'content'
): Clipping[] {
  // Remove duplicates
}
```

---

### 8. Templates Personalizables Completos

**Problema**: Los templates de Handlebars son fijos. Sería útil poder personalizar completamente.

**Propuesta**:
```typescript
export interface ExportTemplate {
  header?: string;
  footer?: string;
  clippingFormat?: (clipping: Clipping) => string;
  bookSeparator?: string;
  dateFormat?: string;
}

export function exportWithTemplate(
  clippings: Clipping[],
  template: ExportTemplate
): string {
  // Custom template rendering
}
```

---

### 9. Control Granular de Metadatos (CSV/JSON)

**Problema**: El usuario solo puede elegir `includeRaw: true/false`, pero no tiene control fino sobre qué campos incluir.

**Propuesta**:
```typescript
const exporter = new CsvExporter();
await exporter.export(clippings, {
  fields: ['title', 'author', 'content', 'date'],  // Solo estos campos
  excludeFields: ['id', 'isEmpty', 'isLimitReached'],  // Excluir estos
});
```

**Beneficio para KindleHub**: El usuario decide exactamente qué datos exportar.

---

### 10. Exportar Metadatos de Formato (Prioridad: Baja)

**Contexto**: Al refactorizar KindleHub (v1.1), se creó un `FORMAT_REGISTRY` unificado que contiene factory functions + metadatos. Cada consumidor debe definir sus propios metadatos (filename, mimeType, extension, label).

**Estado actual en kindle-tools-ts**:
- ✅ Exporta `Exporter` (interfaz) y `BaseExporter` (clase abstracta)
- ✅ Cada exporter tiene `name` y `extension`
- ❌ No exporta `mimeType` ni metadatos adicionales

**Propuesta**:
```typescript
// Añadir a la interfaz Exporter
export interface Exporter {
  name: string
  extension: string
  mimeType?: string       // Nuevo - e.g., 'text/markdown'
  isMultiFile?: boolean   // Nuevo - true para obsidian/joplin
  export(...): Promise<ExportResult>
}

// O alternativamente, exportar metadatos como constante
export const EXPORTER_METADATA: Record<string, { mimeType: string; isMultiFile: boolean }> = {
  markdown: { mimeType: 'text/markdown', isMultiFile: false },
  // ...
}
```

**Beneficio**: Evita que cada consumidor duplique esta información técnica.

**Contraargumento**: Los metadatos de UI (label, description, icon) sí deben quedar en el consumidor. Solo los técnicos (mimeType, isMultiFile) podrían estar en la lib.

**Workaround actual en KindleHub**: `FORMAT_REGISTRY` unificado en `export.service.ts`.

---

## 📋 Mejoras Técnicas (Zod Next Steps)

**Contexto**: Tras la migración a Zod (v2.0), existen oportunidades para aprovechar mejor la librería.

### 11. Validación de Configuración (Runtime)
- **Idea**: Usar `ParseOptionsSchema.parse(input)` para validar inputs de usuario (CLI/GUI).
- **Beneficio**: Validación robusta y mensajes de error detallados gratis.

### 12. Transformadores para RegExp
- **Idea**: Usar `z.preprocess()` o `transform()` en `ParseOptionsSchema` para convertir strings a RegExp automáticamente (útil para cargar config desde JSON).

### 13. Performance Check
- **Idea**: Validar impacto de rendimiento si se usa `ClippingStrictSchema.parse()` en bucles masivos. Zod puede ser intensivo en CPU.

---

## ❌ Fuera de Scope

Estas ideas fueron evaluadas pero **no se implementarán** por bajo valor o scope creep:

| Item | Razón |
|------|-------|
| PDF Export | Requiere librería pesada (~500KB) |
| Readwise Sync | API propietaria, scope creep |
| Highlight Colors | Kindle no exporta colores en `My Clippings.txt` |
| Streaming Architecture | Caso raro (archivos >50MB) |
| Plugin System | Over-engineering |
| Notion/Kobo/Apple Books | APIs propietarias, diferentes formatos |
| CLI | Fuera de scope, usuarios crean wrappers |

---

## 📝 Cómo Documentar Nuevas Mejoras

Al desarrollar KindleHub, si encuentras que necesitas algo de kindle-tools-ts que no existe:

1. **Documenta el problema** específico que enfrentaste
2. **Describe el workaround** que usaste (si lo hay)
3. **Propón una API** ideal para la librería
4. **Estima el esfuerzo** si es posible
5. **Añádelo aquí** bajo la sección correspondiente

---

*Este documento se actualiza conforme se desarrolla KindleHub.*
*Última actualización: 2026-01-23*
