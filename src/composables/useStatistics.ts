import { computed } from 'vue'
import { useClippingsStore } from '@/stores/clippings'
import { useBooksStore } from '@/stores/books'
import {
  startOfMonth,
  format,
  parseISO
} from 'date-fns'

export interface TimelinePoint {
  label: string
  count: number
  date: Date
}

export interface HeatmapPoint {
  date: string // yyyy-MM-dd
  count: number
}

export interface DayHourPoint {
  day: number // 0-6 (Sun-Sat)
  hour: number // 0-23
  count: number
}

export interface BookStats {
  book: string
  author: string
  count: number
  highlights: number
  notes: number
  bookmarks: number
}

export interface AuthorStats {
  author: string
  count: number
  books: BookStats[]
}

export interface TypeDistribution {
  highlights: number
  notes: number
  bookmarks: number
}

export interface Insight {
  key: string
  params?: Record<string, any>
}

export function useStatistics() {
  const clippingsStore = useClippingsStore()
  const booksStore = useBooksStore()

  // Helper to resolve book details
  const getBookDetails = (bookId: number) => {
    return booksStore.books.find((b) => b.id === bookId)
  }

  // Basic metrics
  const totalClippings = computed(() =>
    clippingsStore.clippings.length
  )

  const totalBooks = computed(() =>
    new Set(clippingsStore.clippings.map((c) => c.bookId)).size
  )

  // We can't rely on clippings alone for total authors if we normalize,
  // but we can try to get unique authors from the books referenced by clippings
  const totalAuthors = computed(() => {
    const bookIds = new Set(clippingsStore.clippings.map((c) => c.bookId))
    const authors = new Set<string>()
    bookIds.forEach((id) => {
      const book = getBookDetails(id)
      if (book) authors.add(book.author)
    })
    return authors.size
  })

  // Days Active (unique days with at least one clipping)
  const daysActive = computed(() => {
    const dates = new Set(clippingsStore.clippings.map((c) => format(c.date, 'yyyy-MM-dd')))
    return dates.size
  })

  // Highligth Length Stats (Box Plot data)
  const highlightLengths = computed(() => {
    const highlights = clippingsStore.clippings
      .filter((c) => c.type === 'highlight' && c.content)
      .map((c) => c.content.length)
      .sort((a, b) => a - b)

    if (highlights.length < 4) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] }

    const q1 = highlights[Math.floor((highlights.length / 4))]
    const median = highlights[Math.floor((highlights.length / 2))]
    const q3 = highlights[Math.floor((highlights.length * (3 / 4)))]

    if (q1 === undefined || median === undefined || q3 === undefined) {
      return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] }
    }

    const iqr = q3 - q1
    const minVal = q1 - 1.5 * iqr
    const maxVal = q3 + 1.5 * iqr

    const validData = highlights.filter((v) => v >= minVal && v <= maxVal)
    const outliers = highlights.filter((v) => v < minVal || v > maxVal)

    return {
      min: Math.min(...validData),
      q1,
      median,
      q3,
      max: Math.max(...validData),
      outliers
    }
  })

  // Type distribution
  const typeDistribution = computed<TypeDistribution>(() => {
    const dist = { highlights: 0, notes: 0, bookmarks: 0 }
    clippingsStore.clippings.forEach((c) => {
      if (c.type === 'highlight') dist.highlights++
      else if (c.type === 'note') dist.notes++
      else if (c.type === 'bookmark') dist.bookmarks++
    })
    return dist
  })

  // Top books and Author stats
  const bookStats = computed<BookStats[]>(() => {
    const stats: Record<string, BookStats> = {} // key: bookId (as string)

    clippingsStore.clippings.forEach((c) => {
      const book = getBookDetails(c.bookId)
      if (!book) return // Should hopefully not happen if referential integrity is kept

      const key = String(c.bookId)
      if (!stats[key]) {
        stats[key] = {
          book: book.title,
          author: book.author,
          count: 0,
          highlights: 0,
          notes: 0,
          bookmarks: 0
        }
      }
      stats[key].count++
      if (c.type === 'highlight') stats[key].highlights++
      else if (c.type === 'note') stats[key].notes++
      else if (c.type === 'bookmark') stats[key].bookmarks++
    })

    return Object.values(stats).sort((a, b) => b.count - a.count)
  })

  const topBooks = computed(() => bookStats.value.slice(0, 10))

  const authorStats = computed<AuthorStats[]>(() => {
    const stats: Record<string, AuthorStats> = {}

    bookStats.value.forEach((book) => {
      let entry = stats[book.author]
      if (!entry) {
        entry = {
          author: book.author,
          count: 0,
          books: []
        }
        stats[book.author] = entry
      }
      entry.count += book.count
      entry.books.push(book)
    })

    return Object.values(stats).sort((a, b) => b.count - a.count)
  })

  // Timeline data (Monthly activity)
  const timelineData = computed<TimelinePoint[]>(() => {
    const grouped = clippingsStore.clippings.reduce((acc, c) => {
      const monthKey = format(startOfMonth(c.date), 'yyyy-MM')
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped)
      .map(([month, count]) => ({
        label: format(parseISO(month + '-01'), 'MMM yyyy'),
        count,
        date: parseISO(month + '-01')
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  })

  // Monthly Breakdown (Stacked Bar: Highlights vs Notes vs Bookmarks)
  const monthlyBreakdown = computed(() => {
    const grouped = clippingsStore.clippings.reduce((acc, c) => {
      const monthKey = format(startOfMonth(c.date), 'yyyy-MM')
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, highlights: 0, notes: 0, bookmarks: 0 }
      }
      const entry = acc[monthKey]
      if (entry) {
        if (c.type === 'highlight') entry.highlights++
        else if (c.type === 'note') entry.notes++
        else if (c.type === 'bookmark') entry.bookmarks++
      }
      return acc
    }, {} as Record<string, { month: string, highlights: number, notes: number, bookmarks: number }>)

    return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month))
  })

  // Day x Hour Heatmap data
  const heatmapData = computed<DayHourPoint[]>(() => {
    const points: Record<string, number> = {} // key: "day-hour"

    // Initialize with 0
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        points[`${d}-${h}`] = 0
      }
    }

    clippingsStore.clippings.forEach((c) => {
      const day = c.date.getDay()
      const hour = c.date.getHours()
      const key = `${day}-${hour}`
      if (points[key] !== undefined) {
        points[key]++
      }
    })

    return Object.entries(points).map(([key, count]) => {
      const [dStr, hStr] = key.split('-')
      const d = Number(dStr)
      const h = Number(hStr)
      return { day: d, hour: h, count }
    })
  })

  // Calendar Heatmap data (for StreakChart)
  const calendarData = computed<HeatmapPoint[]>(() => {
    const grouped = clippingsStore.clippings.reduce((acc, c) => {
      const day = format(c.date, 'yyyy-MM-dd')
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(grouped).map(([date, count]) => ({ date, count }))
  })

  // Has Data flag
  const hasData = computed(() => totalClippings.value > 0)

  const firstClippingDate = computed(() => {
    const clips = clippingsStore.clippings
    if (clips.length === 0) return null
    const first = clips[0]
    if (!first) return null
    return clips.reduce((min, c) => c.date < min ? c.date : min, first.date)
  })

  const yearsReading = computed(() => {
    if (!firstClippingDate.value) return 0
    const start = firstClippingDate.value.getFullYear()
    const end = new Date().getFullYear()
    return end - start + 1
  })

  // Insights
  const insights = computed<Insight[]>(() => {
    const result: Insight[] = []

    // Years Reading
    if (yearsReading.value > 1) {
      result.push({ key: 'stats.insight_years_reading', params: { years: yearsReading.value } })
    }

    const clips = clippingsStore.clippings
    if (clips.length === 0) return result

    // Peak Month
    if (timelineData.value.length > 0) {
      const first = timelineData.value[0]
      if (first) {
        const peak = timelineData.value.reduce((max, p) => p.count > max.count ? p : max, first)
        result.push({ key: 'stats.insight_peak_month', params: { month: peak.label, count: peak.count } })
      }
    }

    // Highlight Preference
    const total = totalClippings.value
    if (total > 0) {
      const highlights = typeDistribution.value.highlights
      const pct = Math.round((highlights / total) * 100)
      result.push({ key: 'stats.insight_highlight_preference', params: { percentage: pct } })
    }

    // Top Author
    if (authorStats.value.length > 0) {
      const top = authorStats.value[0]
      if (top) {
        result.push({ key: 'stats.insight_top_author', params: { author: top.author, count: top.count } })
      }
    }

    // Avg per Book
    if (totalBooks.value > 0) {
      const avg = Math.round(total / totalBooks.value)
      result.push({ key: 'stats.insight_avg_per_book', params: { avg } })
    }

    return result
  })

  return {
    clippingsStore,
    booksStore,
    hasData,
    yearsReading,
    insights,
    totalClippings,
    totalBooks,
    totalAuthors,
    daysActive,
    highlightLengths,
    typeDistribution,
    topBooks,
    bookStats,
    authorStats,
    timelineData,
    monthlyBreakdown,
    heatmapData,
    calendarData
  }
}
