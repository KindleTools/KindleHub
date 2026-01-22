import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock kindle-tools-ts exporters
vi.mock('kindle-tools-ts', () => {
  const createMockExporter = (output: string | object, files?: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    return class MockExporter {
      async export() {
        return {
          isErr: () => false,
          value: {
            output,
            files
          }
        }
      }
    }
  }

  const createFailingExporter = (errorMessage: string) => {
    return class FailingExporter {
      async export() {
        return {
          isErr: () => true,
          error: { message: errorMessage }
        }
      }
    }
  }

  return {
    MarkdownExporter: createMockExporter('# Highlights\n\n## Book Title\n\n> Highlight content'),
    JsonExporter: createMockExporter(JSON.stringify({ clippings: [] })),
    CsvExporter: createMockExporter('title,author,content\n"Book","Author","Content"'),
    HtmlExporter: createMockExporter('<html><body><h1>Highlights</h1></body></html>'),
    ObsidianExporter: createMockExporter('', [
      { path: 'Book1.md', content: '# Book 1\n\n> Highlight' },
      { path: 'Book2.md', content: '# Book 2\n\n> Highlight' }
    ]),
    JoplinExporter: createMockExporter('[joplin export data]'),
    // Store failing exporter for error tests
    _createFailingExporter: createFailingExporter
  }
})

// Import after mocking
import {
  exportClippings,
  previewExport,
  getFormatInfo,
  EXPORT_FORMATS,
  type ExportFormat
} from '@/services/export.service'
import type { Clipping } from 'kindle-tools-ts'

describe('Export Service', () => {
  const mockClippings: Clipping[] = [
    {
      bookTitle: 'Test Book',
      bookAuthor: 'Test Author',
      type: 'highlight',
      content: 'This is a highlight',
      location: 'Location 100-120',
      date: new Date('2024-01-01'),
      page: undefined
    },
    {
      bookTitle: 'Test Book',
      bookAuthor: 'Test Author',
      type: 'note',
      content: 'This is a note',
      location: 'Location 200-220',
      date: new Date('2024-01-02'),
      page: undefined
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('exportClippings', () => {
    it('exports to markdown format', async () => {
      const result = await exportClippings(mockClippings, 'markdown')

      expect(result.format).toBe('markdown')
      expect(result.filename).toBe('kindle-highlights.md')
      expect(result.mimeType).toBe('text/markdown')
      expect(result.content).toContain('Highlights')
    })

    it('exports to json format', async () => {
      const result = await exportClippings(mockClippings, 'json')

      expect(result.format).toBe('json')
      expect(result.filename).toBe('kindle-highlights.json')
      expect(result.mimeType).toBe('application/json')
    })

    it('exports to csv format', async () => {
      const result = await exportClippings(mockClippings, 'csv')

      expect(result.format).toBe('csv')
      expect(result.filename).toBe('kindle-highlights.csv')
      expect(result.mimeType).toBe('text/csv')
    })

    it('exports to html format', async () => {
      const result = await exportClippings(mockClippings, 'html')

      expect(result.format).toBe('html')
      expect(result.filename).toBe('kindle-highlights.html')
      expect(result.mimeType).toBe('text/html')
    })

    it('exports to obsidian format with multiple files', async () => {
      const result = await exportClippings(mockClippings, 'obsidian')

      expect(result.format).toBe('obsidian')
      expect(result.filename).toBe('kindle-obsidian.zip')
      expect(result.mimeType).toBe('application/zip')
      expect(result.isMultiFile).toBe(true)
      expect(result.files.length).toBeGreaterThan(0)
    })

    it('exports to joplin format', async () => {
      const result = await exportClippings(mockClippings, 'joplin')

      expect(result.format).toBe('joplin')
      expect(result.filename).toBe('kindle-highlights.jex')
      expect(result.mimeType).toBe('application/octet-stream')
    })

    it('throws error for unsupported format', async () => {
      await expect(
        exportClippings(mockClippings, 'invalid' as ExportFormat)
      ).rejects.toThrow('Unsupported export format')
    })

    it('merges options with defaults', async () => {
      const result = await exportClippings(mockClippings, 'markdown', {
        sortBy: 'location'
      })

      expect(result.format).toBe('markdown')
      // The service should merge options with defaults
    })
  })

  describe('previewExport', () => {
    it('returns preview for single-file exports', async () => {
      const preview = await previewExport(mockClippings, 'markdown')

      expect(typeof preview).toBe('string')
      expect(preview.length).toBeGreaterThan(0)
    })

    it('returns preview for multi-file exports', async () => {
      const preview = await previewExport(mockClippings, 'obsidian')

      expect(typeof preview).toBe('string')
      // Should show file structure
      expect(preview).toContain('📄')
    })

    it('truncates long content', async () => {
      const preview = await previewExport(mockClippings, 'json')

      // Preview should not be longer than 2000 chars + truncation indicator
      expect(preview.length).toBeLessThanOrEqual(2020)
    })
  })

  describe('getFormatInfo', () => {
    it('returns correct info for markdown', () => {
      const info = getFormatInfo('markdown')

      expect(info.label).toBe('Markdown')
      expect(info.extension).toBe('.md')
      expect(info.icon).toBe('file-text')
    })

    it('returns correct info for json', () => {
      const info = getFormatInfo('json')

      expect(info.label).toBe('JSON')
      expect(info.extension).toBe('.json')
    })

    it('returns correct info for csv', () => {
      const info = getFormatInfo('csv')

      expect(info.label).toBe('CSV')
      expect(info.extension).toBe('.csv')
    })

    it('returns correct info for html', () => {
      const info = getFormatInfo('html')

      expect(info.label).toBe('HTML')
      expect(info.extension).toBe('.html')
    })

    it('returns correct info for obsidian', () => {
      const info = getFormatInfo('obsidian')

      expect(info.label).toBe('Obsidian')
      expect(info.extension).toBe('.zip')
      expect(info.description).toContain('markdown')
    })

    it('returns correct info for joplin', () => {
      const info = getFormatInfo('joplin')

      expect(info.label).toBe('Joplin JEX')
      expect(info.extension).toBe('.jex')
    })
  })

  describe('EXPORT_FORMATS', () => {
    it('contains all expected formats', () => {
      expect(EXPORT_FORMATS).toContain('markdown')
      expect(EXPORT_FORMATS).toContain('json')
      expect(EXPORT_FORMATS).toContain('csv')
      expect(EXPORT_FORMATS).toContain('html')
      expect(EXPORT_FORMATS).toContain('obsidian')
      expect(EXPORT_FORMATS).toContain('joplin')
    })

    it('has 6 formats', () => {
      expect(EXPORT_FORMATS.length).toBe(6)
    })
  })
})
