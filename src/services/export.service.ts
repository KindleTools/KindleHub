/**
 * Export Service - Wrapper for kindle-tools-ts exporting functionality.
 *
 * Provides a unified API for exporting clippings to various formats.
 */
import {
  type Clipping,
  type ExporterOptions,
  type ExportedFile,
  MarkdownExporter,
  JsonExporter,
  CsvExporter,
  HtmlExporter,
  ObsidianExporter,
  JoplinExporter
} from 'kindle-tools-ts'

import type { ExportFormat } from '@/types'

// Re-export for backward compatibility with existing imports
export type { ExportFormat } from '@/types'

export interface ExportResultData {
  format: ExportFormat
  content: string
  files: ExportedFile[]
  filename: string
  mimeType: string
  isMultiFile: boolean
}

const defaultOptions: Partial<ExporterOptions> = {
  includeEmptyContent: false,
  groupByBook: true,
  sortBy: 'date'
}

/**
 * Export clippings to the specified format.
 */
export async function exportClippings(
  clippings: Clipping[],
  format: ExportFormat,
  options?: Partial<ExporterOptions>
): Promise<ExportResultData> {
  const mergedOptions = { ...defaultOptions, ...options }

  switch (format) {
    case 'markdown': {
      const exporter = new MarkdownExporter()
      const result = await exporter.export(clippings, mergedOptions)
      if (result.isErr()) throw new Error(result.error.message)
      const output = result.value.output
      return {
        format,
        content: typeof output === 'string' ? output : '',
        files: result.value.files ?? [],
        filename: 'kindle-highlights.md',
        mimeType: 'text/markdown',
        isMultiFile: Boolean(result.value.files?.length)
      }
    }

    case 'json': {
      const exporter = new JsonExporter()
      const result = await exporter.export(clippings, mergedOptions)
      if (result.isErr()) throw new Error(result.error.message)
      const output = result.value.output
      return {
        format,
        content: typeof output === 'string' ? output : '',
        files: [],
        filename: 'kindle-highlights.json',
        mimeType: 'application/json',
        isMultiFile: false
      }
    }

    case 'csv': {
      const exporter = new CsvExporter()
      const result = await exporter.export(clippings, mergedOptions)
      if (result.isErr()) throw new Error(result.error.message)
      const output = result.value.output
      return {
        format,
        content: typeof output === 'string' ? output : '',
        files: [],
        filename: 'kindle-highlights.csv',
        mimeType: 'text/csv',
        isMultiFile: false
      }
    }

    case 'html': {
      const exporter = new HtmlExporter()
      const result = await exporter.export(clippings, mergedOptions)
      if (result.isErr()) throw new Error(result.error.message)
      const output = result.value.output
      return {
        format,
        content: typeof output === 'string' ? output : '',
        files: [],
        filename: 'kindle-highlights.html',
        mimeType: 'text/html',
        isMultiFile: false
      }
    }

    case 'obsidian': {
      const exporter = new ObsidianExporter()
      const result = await exporter.export(clippings, mergedOptions)
      if (result.isErr()) throw new Error(result.error.message)
      const output = result.value.output
      return {
        format,
        content: typeof output === 'string' ? output : '',
        files: result.value.files ?? [],
        filename: 'kindle-obsidian.zip',
        mimeType: 'application/zip',
        isMultiFile: true
      }
    }

    case 'joplin': {
      const exporter = new JoplinExporter()
      const result = await exporter.export(clippings, mergedOptions)
      if (result.isErr()) throw new Error(result.error.message)
      const output = result.value.output
      return {
        format,
        content: typeof output === 'string' ? output : '',
        files: [],
        filename: 'kindle-highlights.jex',
        mimeType: 'application/octet-stream',
        isMultiFile: false
      }
    }

    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Generate a preview of the export (first N characters/entries).
 */
export async function previewExport(
  clippings: Clipping[],
  format: ExportFormat,
  options?: Partial<ExporterOptions>
): Promise<string> {
  const result = await exportClippings(clippings, format, options)

  if (result.isMultiFile && result.files.length > 0) {
    // For multi-file exports, show structure
    const preview = result.files.slice(0, 5).map((file) => {
      const content = typeof file.content === 'string' ? file.content : '[binary content]'
      return `📄 ${file.path}\n${content.slice(0, 200)}${content.length > 200 ? '...' : ''}`
    }).join('\n\n---\n\n')
    return preview + (result.files.length > 5 ? `\n\n...and ${result.files.length - 5} more files` : '')
  }

  const previewLength = 2000
  return result.content.slice(0, previewLength) + (result.content.length > previewLength ? '\n\n...[truncated]' : '')
}

/**
 * Download export as a file.
 */
export function downloadExport(result: ExportResultData): void {
  if (result.isMultiFile && result.files.length > 0) {
    // For multi-file exports, download each file separately (simplified)
    result.files.forEach((file) => {
      if (typeof file.content === 'string') {
        downloadFile(file.content, file.path, 'text/plain')
      }
    })
  } else {
    downloadFile(result.content, result.filename, result.mimeType)
  }
}

/**
 * Helper to trigger file download.
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Get format metadata for UI display.
 */
export function getFormatInfo(format: ExportFormat): {
  label: string
  description: string
  extension: string
  icon: string
} {
  const formats: Record<ExportFormat, { label: string, description: string, extension: string, icon: string }> = {
    markdown: {
      label: 'Markdown',
      description: 'Plain text with formatting, compatible with most note apps',
      extension: '.md',
      icon: 'file-text'
    },
    json: {
      label: 'JSON',
      description: 'Structured data format for developers and automation',
      extension: '.json',
      icon: 'braces'
    },
    csv: {
      label: 'CSV',
      description: 'Spreadsheet format, works with Excel and Google Sheets',
      extension: '.csv',
      icon: 'table'
    },
    html: {
      label: 'HTML',
      description: 'Web page format, viewable in any browser',
      extension: '.html',
      icon: 'globe'
    },
    obsidian: {
      label: 'Obsidian',
      description: 'Multiple markdown files with YAML frontmatter',
      extension: '.zip',
      icon: 'diamond'
    },
    joplin: {
      label: 'Joplin JEX',
      description: 'Joplin archive format, importable directly',
      extension: '.jex',
      icon: 'package'
    }
  }

  return formats[format]
}

/**
 * List of all available export formats.
 */
export const EXPORT_FORMATS: ExportFormat[] = ['markdown', 'json', 'csv', 'html', 'obsidian', 'joplin']
