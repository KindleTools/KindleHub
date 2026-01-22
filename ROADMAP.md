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
🟢 En Progreso - Fase 1 (Core) completada

### Estado de Implementación
- [x] Store y Tipos de datos (`batches.ts`)
- [x] Página de revisión (`batch/[id].vue`)
- [x] Utilidades de servicio (`batch.service.ts`)
- [x] Redirección desde Importar
- [ ] Edición inline de clippings
- [ ] Acciones masivas (bulk actions)
- [ ] Historial de lotes



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

*Ultima actualizacion: 2026-01-22*
