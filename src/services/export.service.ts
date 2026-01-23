/**
 * Export Service - Wrapper for kindle-tools-ts exporting functionality.
 *
 * Provides a unified API for exporting clippings to various formats.
 * Uses Registry/Factory pattern for clean, extensible code.
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

interface FormatMetadata {
  filename: string
  mimeType: string
  isMultiFile: boolean
}

// Type for exporter instances from kindle-tools-ts
type BaseExporter = InstanceType<typeof MarkdownExporter>

const defaultOptions: Partial<ExporterOptions> = {
  includeEmptyContent: false,
  groupByBook: true,
  sortBy: 'date'
}

/**
 * Registry of exporter factory functions.
 * Each entry creates a new exporter instance for the given format.
 */
const exporterRegistry: Record<ExportFormat, () => BaseExporter> = {
  markdown: () => new MarkdownExporter(),
  json: () => new JsonExporter(),
  csv: () => new CsvExporter(),
  html: () => new HtmlExporter(),
  obsidian: () => new ObsidianExporter(),
  joplin: () => new JoplinExporter()
}

/**
 * Metadata configuration for each export format.
 */
const formatMetadata: Record<ExportFormat, FormatMetadata> = {
  markdown: { filename: 'kindle-highlights.md', mimeType: 'text/markdown', isMultiFile: false },
  json: { filename: 'kindle-highlights.json', mimeType: 'application/json', isMultiFile: false },
  csv: { filename: 'kindle-highlights.csv', mimeType: 'text/csv', isMultiFile: false },
  html: { filename: 'kindle-highlights.html', mimeType: 'text/html', isMultiFile: false },
  obsidian: { filename: 'kindle-obsidian.zip', mimeType: 'application/zip', isMultiFile: true },
  joplin: { filename: 'kindle-highlights.jex', mimeType: 'application/octet-stream', isMultiFile: false }
}

/**
 * Export clippings to the specified format.
 */
export async function exportClippings(
  clippings: Clipping[],
  format: ExportFormat,
  options?: Partial<ExporterOptions>
): Promise<ExportResultData> {
  const exporterFactory = exporterRegistry[format]
  if (!exporterFactory) {
    throw new Error(`Unsupported export format: ${format}`)
  }

  const exporter = exporterFactory()
  const metadata = formatMetadata[format]
  const mergedOptions = { ...defaultOptions, ...options }

  const result = await exporter.export(clippings, mergedOptions)
  if (result.isErr()) throw new Error(result.error.message)

  const output = result.value.output
  const files = result.value.files ?? []

  return {
    format,
    content: typeof output === 'string' ? output : '',
    files,
    ...metadata,
    // Override isMultiFile if we actually have files (for markdown edge case)
    isMultiFile: metadata.isMultiFile || files.length > 0
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
