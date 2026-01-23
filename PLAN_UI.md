# Plan de Mejoras UI/UX - KindleHub

> **Última actualización**: 2026-01-23
> **Estado base**: MVP 99% completado

---

## Tareas Pendientes

### 1. DataTable: String Hardcodeado (Bug)

**Prioridad**: Alta

En [DataTable.vue:399](src/components/editor/DataTable.vue#L399) hay un string hardcodeado:
```vue
{{ getClipping(virtualRow.index).content || '(vacío)' }}
```

**Solución**: Cambiar a `$t('clipping.no_content')`.

---

### 2. BookListItem: Skeleton Loading

**Prioridad**: Media

El componente [BookListItem.vue](src/components/books/BookListItem.vue) no tiene prop `loading` ni skeleton state como `BookCard.vue`.

**Implementación**:
```vue
<script setup lang="ts">
import UiSkeleton from '@/components/ui/Skeleton.vue'

const props = defineProps<{
  book?: Book
  loading?: boolean
}>()
</script>

<template>
  <div v-if="loading" class="flex items-center gap-4 p-3 ...">
    <UiSkeleton variant="rounded" class="h-16 w-12" />
    <div class="flex-1">
      <UiSkeleton variant="text" width="60%" />
      <UiSkeleton variant="text" width="40%" class="mt-1" />
    </div>
  </div>
  <!-- existing template -->
</template>
```

---

### 3. Editor: Column Visibility Toggle

**Prioridad**: Media

Permitir ocultar/mostrar columnas en el DataTable.

**Implementación**:
```vue
<Menu as="div" class="relative">
  <MenuButton class="btn-icon" :aria-label="$t('datatable.toggle_columns')">
    <Columns3 class="h-4 w-4" />
  </MenuButton>
  <MenuItems class="dropdown-menu">
    <MenuItem v-for="col in columns" :key="col.key">
      <label class="flex items-center gap-2 px-3 py-2">
        <input type="checkbox" v-model="col.visible" />
        {{ $t(`datatable.${col.key}`) }}
      </label>
    </MenuItem>
  </MenuItems>
</Menu>
```

**Archivos a modificar**:
- `src/components/editor/DataTable.vue`
- `src/composables/useDataEditor.ts`

---

### 4. Editor: Density Toggle

**Prioridad**: Baja

Permitir cambiar entre vista compacta, normal y expandida:
- **Compacta**: Más filas visibles, menos padding
- **Normal**: Como está ahora
- **Expandida**: Contenido completo visible

---

### 5. EmptyState: Ilustraciones SVG Personalizadas (Opcional)

**Prioridad**: Baja

**Estado actual**: El componente usa iconos Lucide simples.

**Mejora opcional**: Crear ilustraciones SVG más atractivas inspiradas en unDraw o Storyset.

```
src/assets/illustrations/
├── empty-library.svg
├── empty-search.svg
└── empty-batch.svg
```

---

### 6. Glassmorphism Header (Opcional)

**Prioridad**: Baja

Efecto de cristal difuminado en el header cuando hay scroll.

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

## Backlog (Futuro)

### PWA Support
- Service worker para offline
- Manifest.json
- Icons para instalación

### Test Coverage
- Estado actual: ~60%
- Objetivo: >80%

### Heatmap de Lectura
El useStatistics tiene comentado el `heatmapData`. Implementar un heatmap de actividad (día/hora) al estilo GitHub.

---

## Priorización

| Tarea | Esfuerzo | Impacto | Prioridad |
|-------|----------|---------|-----------|
| DataTable string hardcodeado | Bajo | Alto | Alta |
| BookListItem skeleton | Bajo | Medio | Media |
| Column Visibility Toggle | Medio | Medio | Media |
| Density Toggle | Medio | Bajo | Baja |
| EmptyState ilustraciones | Medio | Bajo | Baja |
| Glassmorphism Header | Bajo | Bajo | Baja |

---

*Última actualización: 2026-01-23*
