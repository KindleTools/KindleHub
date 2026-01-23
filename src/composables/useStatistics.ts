/**
 * useStatistics Composable - Dashboard statistics and insights.
 *
 * Provides computed statistics, chart data, and smart insights
 * for the dashboard.
 */
import { computed } from 'vue'
import { format, differenceInDays } from 'date-fns'

import { useBooksStore } from '@/stores/books'
import { useClippingsStore } from '@/stores/clippings'
import type { Book, StoredClipping } from '@/db/schema'

export interface TypeDistribution {
  highlights: number
  notes: number
  bookmarks: number
}

export interface TopBook {
  id: number
  title: string
  author: string
  count: number
}

export interface TimelinePoint {
  month: string
  label: string
  count: number
}

export interface Insight {
  key: string
  params?: Record<string, string | number>
}

export function useStatistics() {
  const booksStore = useBooksStore()
  const clippingsStore = useClippingsStore()

  // Basic metrics
  const totalClippings = computed(() => clippingsStore.stats.totalClippings)
  const totalBooks = computed(() => booksStore.totalBooks)

  const totalAuthors = computed(() => {
    const authors = new Set(booksStore.books.map((b: Book) => b.author))
    return authors.size
  })

  const yearsReading = computed(() => {
    if (booksStore.books.length === 0) return 0

    const dates = booksStore.books
      .map((b: Book) => b.lastReadDate)
      .filter((d): d is Date => d instanceof Date)

    if (dates.length === 0) return 0

    const earliest = new Date(Math.min(...dates.map((d) => d.getTime())))
    const latest = new Date(Math.max(...dates.map((d) => d.getTime())))
    const days = differenceInDays(latest, earliest)

    return Math.max(1, Math.round((days / 365) * 10) / 10)
  })

  // Type distribution (for Donut Chart)
  const typeDistribution = computed<TypeDistribution>(() => ({
    highlights: clippingsStore.stats.totalHighlights,
    notes: clippingsStore.stats.totalNotes,
    bookmarks: clippingsStore.stats.totalBookmarks
  }))

  // Top books by clipping count (for Bar Chart)
  const topBooks = computed<TopBook[]>(() =>
    booksStore.books
      .map((b: Book) => ({
        id: b.id!,
        title: b.title,
        author: b.author,
        count: b.clippingCount
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  )

  // Timeline data (for Line Chart)
  const timelineData = computed<TimelinePoint[]>(() => {
    const clippings = clippingsStore.clippings as StoredClipping[]
    if (clippings.length === 0) return []

    const grouped = clippings.reduce(
      (acc, c) => {
        if (!(c.date instanceof Date)) return acc
        const month = format(c.date, 'yyyy-MM')
        acc[month] = (acc[month] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(grouped)
      .map(([month, count]) => ({
        month,
        label: format(new Date(month + '-01'), 'MMM yyyy'),
        count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  })

  // Heatmap data (for Calendar Chart)
  const heatmapData = computed<[string, number][]>(() => {
    const clippings = clippingsStore.clippings as StoredClipping[]
    if (clippings.length === 0) return []

    const grouped = clippings.reduce(
      (acc, c) => {
        if (!(c.date instanceof Date)) return acc
        const day = format(c.date, 'yyyy-MM-dd')
        acc[day] = (acc[day] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(grouped)
  })

  // Average clippings per book
  const avgClippingsPerBook = computed(() => {
    if (totalBooks.value === 0) return 0
    return Math.round((totalClippings.value / totalBooks.value) * 10) / 10
  })

  // Most active month
  const mostActiveMonth = computed(() => {
    if (timelineData.value.length === 0) return null
    return timelineData.value.reduce((max, point) =>
      point.count > max.count ? point : max
    )
  })

  // Top author
  const topAuthor = computed(() => {
    if (booksStore.books.length === 0) return null

    const authorCounts = booksStore.books.reduce(
      (acc, b: Book) => {
        acc[b.author] = (acc[b.author] || 0) + b.clippingCount
        return acc
      },
      {} as Record<string, number>
    )

    const [author, count] = Object.entries(authorCounts).reduce((max, entry) =>
      entry[1] > max[1] ? entry : max
    )

    return { author, count }
  })

  // Highlights percentage
  const highlightsPercentage = computed(() => {
    if (totalClippings.value === 0) return 0
    return Math.round((typeDistribution.value.highlights / totalClippings.value) * 100)
  })

  // Smart insights (i18n keys with params)
  const insights = computed<Insight[]>(() => {
    const result: Insight[] = []

    if (mostActiveMonth.value) {
      result.push({
        key: 'stats.insight_peak_month',
        params: {
          month: mostActiveMonth.value.label,
          count: mostActiveMonth.value.count
        }
      })
    }

    if (highlightsPercentage.value > 0) {
      result.push({
        key: 'stats.insight_highlight_preference',
        params: { percentage: highlightsPercentage.value }
      })
    }

    if (topAuthor.value && topAuthor.value.count > 5) {
      result.push({
        key: 'stats.insight_top_author',
        params: {
          author: topAuthor.value.author,
          count: topAuthor.value.count
        }
      })
    }

    if (avgClippingsPerBook.value > 0) {
      result.push({
        key: 'stats.insight_avg_per_book',
        params: { avg: avgClippingsPerBook.value }
      })
    }

    if (yearsReading.value >= 1) {
      result.push({
        key: 'stats.insight_years_reading',
        params: { years: yearsReading.value }
      })
    }

    return result
  })

  // Loading state
  const isLoading = computed(
    () => booksStore.isLoading || clippingsStore.isLoading
  )

  // Has data
  const hasData = computed(() => totalBooks.value > 0)

  return {
    // Basic metrics
    totalClippings,
    totalBooks,
    totalAuthors,
    yearsReading,

    // Chart data
    typeDistribution,
    topBooks,
    timelineData,
    heatmapData,

    // Derived metrics
    avgClippingsPerBook,
    mostActiveMonth,
    topAuthor,
    highlightsPercentage,

    // Insights
    insights,

    // State
    isLoading,
    hasData
  }
}
