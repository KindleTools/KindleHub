Plan de Mejora de UI/UX - KindleHub
Este documento detalla el plan para elevar la calidad visual y funcional de la interfaz, basado en la inspección visual actual, los roadmaps existentes (
ROADMAP_UI.md
, 
ROADMAP_STATS.md
) y estándares modernos de diseño web.

1. Diagnóstico Actual
Inspección Visual
Estado General: Funcional y limpio ("Clean MVP"), pero básico. Le falta identidad visual fuerte y refinamiento.
Navegación: Los enlaces en el header funcionan pero carecen de jerarquía visual y espaciado adecuado.
Home: Muestra estadísticas básicas pero desaprovecha el espacio. No invita a la exploración.
Settings: Bug crítico de i18n. Títulos en español aunque el idioma seleccionado sea inglés.
Library: Cards demasiado grandes con poca densidad de información. Desaprovechamiento del espacio en escritorio.
Editor: Tabla funcional pero monótona. Falta feedback visual en interacciones (hover, focus).
Análisis de Brechas (Gaps) vs Roadmap
Área	Vision (
ROADMAP_UI.md
)	Estado Actual	Brecha
Dashboard	Rico en gráficos, actividad de lectura, heatmaps.	Contadores simples (Libros, Highlights).	Alta. Faltan todas las visualizaciones de datos.
Biblioteca	Cards con portadas generadas, metadatos ricos.	Cards de texto simple + icono.	Media. Falta diseño visual atractivo.
Editor	Edición inline, filtros avanzados visibles, densidad variable.	Tabla estándar, edición por modal/página aparte se siente lenta.	Media. Falta fluidez en la edición.
Import	Feedback de progreso detallado, drag & drop con estados ricos.	Funcional pero visualmente estático.	Baja. Funciona bien, mejora visual opcional.
2. Propuestas de Mejora (Priorizadas)
Fase 1: Correcciones Inmediatas (Polishing)
Objetivo: Eliminar errores obvios y mejorar la consistencia.

 Fix i18n en Settings: Asegurar que los textos de la página de configuración reaccionen reactivamente al cambio de idioma.
 Header Redesign:
Aumentar espaciado entre enlaces (gap-6 -> gap-8).
Añadir indicador activo más claro (subrayado o cambio de peso de fuente).
Mejorar el alineamiento vertical del logo y textos.
 Feedback de Vacío (Empty States):
Diseñar estados vacíos ilustrados (usando SVGs o iconos grandes) para Library y Search cuando no hay datos.
El texto actual es demasiado pequeño y genérico.
Fase 2: Dashboard Visual (Data Viz)
Objetivo: Implementar la visión de 
ROADMAP_STATS.md
 para dar valor inmediato al usuario.

 Integrar Librería de Gráficos: Recomiendo Chart.js (via vue-chartjs) o ECharts (más potente) como sugiere el roadmap.
 Widgets Clave:
Actividad de Lectura: Gráfico de barras (Highlights por mes/año).
Distribución de Tipos: Donut chart (Highlights vs Notes vs Bookmarks).
Top Libros: Listado horizontal con barras de progreso relativas.
 Layout: Grid 2x2 o Masonry para los widgets en la Home.
Fase 3: Rediseño de Biblioteca (UI Cards)
Objetivo: Hacer que la colección se sienta como una estantería real.

 Generación de Portadas:
Crear un componente BookCover que genere una portada visual basada en el título (color aleatorio consistente + tipografía elegante).
Inspiración: Estilo de portadas de Notion o Apple Books simplificado.
 Compact Mode Toggle: Opción para ver lista densa vs cards.
 Nuevos Metadatos: Mostrar "Última lectura", " % completado" (si se puede inferir), "Tags principales".
Fase 4: Experiencia "Premium" (Look & Feel)
Objetivo: Wow factor.

 Tipografía: Cambiar la fuente default por una combinación moderna (ej. Inter para UI, Merriweather o Lora para el contenido de los libros).
 Sombras y Profundidad:
Usar sombras suaves (shadow-lg, shadow-xl con opacidad baja) para modales y dropdowns.
Efecto "Glassmorphism" sutil en la cabecera sticky.
 Micro-interacciones:
Botones con efecto de escala al click (active:scale-95).
Transiciones de entrada (v-enter-active) suaves para las páginas.
Hover en filas de tabla que resalte acciones disponibles.
3. Plan de Acción Técnico
Refactor de Settings: Revisar SettingsView.vue y useSettingsStore para garantizar reactividad de i18n.
Instalar Dependencias UI:
@fontsource/inter, @fontsource/lora.
vue-chartjs y chart.js.
Crear Componentes Base:
StatCard.vue (para widgets del dashboard).
BookCover.vue (generador de arte procedural).
Iterar Estilos: Update 
tailwind.config.js
 con nueva paleta de colores extendida (semántica).
4. Referencias y Recursos
Inspiración:
Linear.app (por su tabla densa y limpia).
Readwise (competidor directo, benchmark de funcionalidad).
Apple Books (por la estética de biblioteca).
Recursos:
Tremor (Inspiración para charts en React, copiar estilo en Vue).
Phosphor Icons (Alternativa a Lucide si buscamos un estilo más "soft", aunque Lucide es excelente).
