# Plan de Mejoras UI/UX - KindleHub

> **Última actualización**: 2026-01-22
> **Estado base**: MVP ~98% completado
> **Objetivo**: Elevar la experiencia de usuario al nivel "premium"

---

## Estado Actual vs Visión

### Ya Implementado
- [x] Sistema de diseño con Tailwind CSS + HeadlessUI
- [x] Dark mode funcional
- [x] Toast notifications con animaciones
- [x] Skeleton component reutilizable
- [x] ConfirmModal con variantes (danger, warning, info)
- [x] Tooltips en botones de acción
- [x] Keyboard shortcuts (Ctrl+K, /, Escape)
- [x] Responsive design (mobile cards, desktop table)
- [x] Accesibilidad (ARIA labels, focus management)
- [x] i18n completo (6 idiomas)
- [x] Sistema de Batches para pre-importación

### Brechas Identificadas

| Área | Visión (ROADMAP_UI) | Estado Actual | Impacto |
|------|---------------------|---------------|---------|
| **Dashboard** | Gráficos interactivos, heatmaps, insights | Contadores simples | 🔴 Alto |
| **Biblioteca** | Portadas generadas, metadatos ricos | Cards básicas con gradientes | 🟡 Medio |
| **Editor** | Inline editing fluido, column toggle | Modal editing (funcional pero lento) | 🟡 Medio |
| **Empty States** | Ilustraciones SVG atractivas | Texto simple | 🟢 Bajo |
| **Mobile Nav** | Hamburger menu, sidebar colapsable | Navegación hidden en mobile | 🟡 Medio |

---

## Fases de Implementación

### Fase 1: Quick Wins (1-2 días)

Mejoras de alto impacto con bajo esfuerzo.

#### 1.1 Mobile Navigation
**Problema**: En móvil, la navegación está oculta (`hidden md:flex`).

**Solución**:
```
src/components/layout/
├── AppHeader.vue      # Agregar hamburger button
├── MobileMenu.vue     # Nuevo: Slide-over menu con HeadlessUI
└── MobileNav.vue      # Nuevo: Links de navegación móvil
```

**Implementación**:
```vue
<!-- MobileMenu.vue usando HeadlessUI TransitionRoot + Dialog -->
<TransitionRoot :show="isOpen" as="template">
  <Dialog @close="isOpen = false" class="relative z-50">
    <TransitionChild enter="ease-out duration-300" leave="ease-in duration-200" ...>
      <div class="fixed inset-0 bg-black/30" />
    </TransitionChild>
    <div class="fixed inset-0 flex">
      <DialogPanel class="w-64 bg-white dark:bg-slate-900 p-4">
        <!-- Navigation links -->
      </DialogPanel>
    </div>
  </Dialog>
</TransitionRoot>
```

#### 1.2 Empty States con SVG
**Problema**: Estados vacíos solo tienen texto.

**Solución**: Crear componente `EmptyState.vue` con ilustraciones SVG inline.

```
src/components/ui/
└── EmptyState.vue     # Props: type, title, description, action
```

**Variantes necesarias**:
- `library-empty` - Estantería vacía
- `search-empty` - Lupa sin resultados
- `batch-empty` - Documento vacío
- `error` - Error genérico

**Referencia visual**: Usar iconos de Lucide expandidos o crear SVGs simples.

#### 1.3 Skeleton en BookCard
**Problema**: No hay loading state en la library.

**Solución**: Usar el componente `Skeleton.vue` existente dentro de `BookCard.vue`.

```vue
<!-- BookCard.vue -->
<template v-if="loading">
  <div class="card">
    <Skeleton variant="rectangular" height="120px" />
    <Skeleton variant="text" class="mt-2" />
    <Skeleton variant="text" width="60%" />
  </div>
</template>
```

---

### Fase 2: Dashboard de Estadísticas (3-5 días)

Implementar la visión de ROADMAP_STATS.md.

#### 2.1 Dependencias
```bash
pnpm add vue-echarts echarts
```

**Por qué ECharts**:
- Interactividad out-of-the-box
- Responsive automático
- Tooltips avanzados
- Exportación a imagen
- Buen performance
- TypeScript support

#### 2.2 Composable `useStatistics`

```typescript
// src/composables/useStatistics.ts
export function useStatistics() {
  const clippingsStore = useClippingsStore()
  const booksStore = useBooksStore()

  // Basic metrics
  const totalClippings = computed(() => clippingsStore.clippings.length)
  const totalBooks = computed(() => booksStore.books.length)
  const totalAuthors = computed(() =>
    new Set(booksStore.books.map(b => b.author)).size
  )

  // Type distribution (para Donut Chart)
  const typeDistribution = computed(() => ({
    highlights: clippingsStore.highlights.length,
    notes: clippingsStore.notes.length,
    bookmarks: clippingsStore.bookmarks.length
  }))

  // Top books (para Bar Chart)
  const topBooks = computed(() =>
    booksStore.books
      .map(b => ({ ...b, count: b.clippingCount }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  )

  // Timeline data (para Line Chart)
  const timelineData = computed(() => {
    const grouped = clippingsStore.clippings.reduce((acc, c) => {
      const month = format(c.date, 'yyyy-MM')
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  })

  // Reading patterns (para Heatmap)
  const heatmapData = computed(() => {
    // Matriz 7 días × 6 franjas horarias
    // ... implementación
  })

  // Smart insights
  const insights = computed(() => generateInsights(/* ... */))

  return {
    totalClippings,
    totalBooks,
    totalAuthors,
    typeDistribution,
    topBooks,
    timelineData,
    heatmapData,
    insights
  }
}
```

#### 2.3 Componentes de Gráficos

```
src/components/stats/
├── StatCard.vue           # Card con número + trend indicator
├── TypeDistributionChart.vue  # Donut chart
├── TopBooksChart.vue      # Horizontal bar chart
├── ActivityChart.vue      # Line chart temporal
├── ReadingHeatmap.vue     # Heatmap día/hora
└── InsightsPanel.vue      # Smart insights con AI
```

#### 2.4 Página Dashboard Mejorada

Actualizar `src/pages/index.vue`:

```
┌────────────────────────────────────────────────────────────┐
│  KindleHub Dashboard                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │   247    │ │    12    │ │    8     │ │   2.5    │     │
│  │Highlights│ │  Books   │ │ Authors  │ │  Years   │     │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                            │
│  ┌─ Activity ────────────┐ ┌─ Top Books ─────────────┐   │
│  │ [LINE CHART]          │ │ [BAR CHART]             │   │
│  └───────────────────────┘ └─────────────────────────┘   │
│                                                            │
│  ┌─ Distribution ────────┐ ┌─ Insights ──────────────┐   │
│  │ [DONUT CHART]         │ │ • Peak: August (52)     │   │
│  │                       │ │ • You prefer highlights │   │
│  │                       │ │ • Active 156 days       │   │
│  └───────────────────────┘ └─────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### Fase 3: Mejoras de Editor (2-3 días)

#### 3.1 Inline Editing en DataTable

**Estado actual**: Click → Modal → Editar → Guardar
**Objetivo**: Click celda → Editar in-place → Blur/Enter guarda

```vue
<!-- Celda editable -->
<td @dblclick="startEditing(row.id, 'content')">
  <template v-if="isEditing(row.id, 'content')">
    <textarea
      v-model="editValue"
      @blur="saveEdit()"
      @keydown.enter.ctrl="saveEdit()"
      @keydown.escape="cancelEdit()"
      class="w-full border rounded p-1"
      ref="editInput"
    />
  </template>
  <template v-else>
    <span class="truncate">{{ row.content }}</span>
  </template>
</td>
```

#### 3.2 Column Visibility Toggle

```vue
<!-- ColumnToggle.vue -->
<Menu as="div" class="relative">
  <MenuButton class="btn-icon">
    <Columns3 class="h-4 w-4" />
  </MenuButton>
  <MenuItems class="dropdown-menu">
    <MenuItem v-for="col in columns" :key="col.key">
      <label class="flex items-center gap-2 px-3 py-2">
        <input type="checkbox" v-model="col.visible" />
        {{ col.label }}
      </label>
    </MenuItem>
  </MenuItems>
</Menu>
```

#### 3.3 Density Toggle

Permitir cambiar entre vista compacta y expandida:
- **Compacta**: Más filas visibles, menos padding
- **Normal**: Como está ahora
- **Expandida**: Contenido completo visible

---

### Fase 4: Biblioteca Premium (2-3 días)

#### 4.1 Portadas Generativas

El componente `BookCover.vue` ya existe con `generateCoverColor()`. Mejorarlo:

```vue
<!-- BookCover.vue mejorado -->
<template>
  <div
    class="book-cover relative aspect-[2/3] rounded-lg overflow-hidden"
    :style="{ background: gradient }"
  >
    <!-- Patrón decorativo -->
    <div class="absolute inset-0 opacity-20" :style="{ backgroundImage: pattern }" />

    <!-- Título centrado -->
    <div class="absolute inset-0 flex items-center justify-center p-4">
      <h3 class="text-white font-serif text-lg text-center font-medium leading-tight">
        {{ truncatedTitle }}
      </h3>
    </div>

    <!-- Autor en la base -->
    <div class="absolute bottom-0 left-0 right-0 bg-black/30 px-3 py-2">
      <p class="text-white/80 text-xs truncate">{{ author }}</p>
    </div>
  </div>
</template>
```

#### 4.2 View Toggle (Grid/List)

```vue
<!-- Library controls -->
<div class="flex items-center gap-2">
  <button
    @click="view = 'grid'"
    :class="{ 'bg-primary-100': view === 'grid' }"
  >
    <Grid3x3 class="h-4 w-4" />
  </button>
  <button
    @click="view = 'list'"
    :class="{ 'bg-primary-100': view === 'list' }"
  >
    <List class="h-4 w-4" />
  </button>
</div>
```

#### 4.3 Metadatos Enriquecidos

En cada BookCard mostrar:
- Última fecha de lectura (ya existe)
- Número de highlights/notes/bookmarks por separado
- Tags principales (si se implementan)
- Indicador de "leído recientemente"

---

### Fase 5: Polish & Delight (1-2 días)

#### 5.1 Micro-interacciones

```css
/* Botones con feedback táctil */
.btn-primary:active {
  transform: scale(0.98);
}

/* Filas de tabla con hover suave */
.table-row {
  transition: background-color 150ms ease;
}
.table-row:hover {
  background-color: var(--color-primary-50);
}

/* Cards con elevación al hover */
.card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgb(0 0 0 / 0.1);
}
```

#### 5.2 Transiciones de Página

```vue
<!-- App.vue -->
<RouterView v-slot="{ Component }">
  <Transition name="page" mode="out-in">
    <component :is="Component" />
  </Transition>
</RouterView>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

#### 5.3 Glassmorphism en Header (opcional)

```css
.header-sticky {
  backdrop-filter: blur(12px);
  background-color: rgb(255 255 255 / 0.8);
}
.dark .header-sticky {
  background-color: rgb(15 23 42 / 0.8);
}
```

---

## Priorización Final

| Fase | Descripción | Esfuerzo | Impacto | Prioridad |
|------|-------------|----------|---------|-----------|
| 1.1 | Mobile Navigation | Bajo | Alto | 🔴 Alta |
| 1.2 | Empty States SVG | Bajo | Medio | 🟡 Media |
| 1.3 | Skeleton BookCard | Bajo | Bajo | 🟢 Baja |
| 2.x | Dashboard Stats | Alto | Alto | 🔴 Alta |
| 3.x | Editor Inline | Medio | Medio | 🟡 Media |
| 4.x | Biblioteca Premium | Medio | Medio | 🟡 Media |
| 5.x | Polish & Delight | Bajo | Medio | 🟢 Baja |

---

## Orden de Implementación Recomendado

1. **Mobile Navigation** (Fase 1.1) - Crítico para UX móvil
2. **Dashboard Stats** (Fase 2) - Mayor valor percibido
3. **Empty States** (Fase 1.2) - Mejora la primera impresión
4. **Editor Inline** (Fase 3.1) - Mejora flujo de trabajo
5. **Biblioteca Premium** (Fase 4) - Diferenciación visual
6. **Polish** (Fase 5) - Toques finales

---

## Dependencias a Instalar

```bash
# Para gráficos de estadísticas
pnpm add vue-echarts echarts

# Ya instalado
# - @headlessui/vue (para MobileMenu)
# - lucide-vue-next (iconos)
```

---

## Archivos a Crear/Modificar

### Nuevos Archivos
```
src/
├── components/
│   ├── layout/
│   │   └── MobileMenu.vue
│   ├── stats/
│   │   ├── StatCard.vue
│   │   ├── TypeDistributionChart.vue
│   │   ├── TopBooksChart.vue
│   │   ├── ActivityChart.vue
│   │   └── InsightsPanel.vue
│   └── ui/
│       └── EmptyState.vue
├── composables/
│   └── useStatistics.ts
└── assets/
    └── illustrations/
        ├── empty-library.svg
        ├── empty-search.svg
        └── empty-batch.svg
```

### Archivos a Modificar
```
src/
├── components/
│   ├── layout/AppHeader.vue  # Agregar hamburger + MobileMenu
│   ├── books/BookCard.vue    # Agregar skeleton state
│   ├── books/BookList.vue    # Agregar EmptyState
│   └── editor/DataTable.vue  # Agregar inline editing
├── pages/
│   ├── index.vue             # Nuevo dashboard con stats
│   ├── library.vue           # View toggle + empty state
│   └── search.vue            # Empty state mejorado
└── App.vue                   # Page transitions
```

---

## Referencias

- **Inspiración UI**: Linear.app, Notion, Readwise
- **Gráficos**: [Apache ECharts](https://echarts.apache.org/)
- **Ilustraciones**: [unDraw](https://undraw.co/), [Storyset](https://storyset.com/)
- **Patrones**: [Refactoring UI](https://www.refactoringui.com/)

---

*Plan creado: 2026-01-22*
