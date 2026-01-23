/**
 * Export Service - Wrapper for kindle-tools-ts exporting functionality.
 *
 * Provides a unified API for exporting clippings to various formats.
 * Uses a unified Registry pattern with single source of truth for format configuration.
 */
import {
  type Clipping,
  type Exporter,
  type ExporterOptions,
  type ExportedFile,
  MarkdownExporter,
  JsonExporter,
  CsvExporter,
  HtmlExporter,
  ObsidianExporter,
  JoplinExporter
} from 'kindle-tools-ts'
import JSZip from 'jszip'

import type { ExportFormat } from '@/types'
import { i18n } from '@/plugins/i18n'

// Helper for i18n in service context
const t = (key: string, params?: Record<string, unknown>) =>
  i18n.global.t(key, params as Record<string, string>)

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

/**
 * Complete configuration for each export format.
 * Single source of truth for all format-related data.
 */
export interface FormatConfig {
  // Factory
  create: () => Exporter
  // Export metadata
  filename: string
  mimeType: string
  isMultiFile: boolean
  // UI metadata
  label: string
  description: string
  icon: string
}

/**
 * Extract extension from filename.
 */
function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot >= 0 ? filename.slice(lastDot) : ''
}

const defaultOptions: Partial<ExporterOptions> = {
  includeEmptyContent: false,
  groupByBook: true,
  sortBy: 'date'
}

/**
 * Unified format registry - single source of truth for all format configuration.
 * To add a new format: add one entry here, everything else derives from it.
 */
export const FORMAT_REGISTRY: Record<ExportFormat, FormatConfig> = {
  markdown: {
    create: () => new MarkdownExporter(),
    filename: 'kindle-highlights.md',
    mimeType: 'text/markdown',
    isMultiFile: false,
    label: 'Markdown',
    description: 'Plain text with formatting, compatible with most note apps',
    icon: 'file-text'
  },
  json: {
    create: () => new JsonExporter(),
    filename: 'kindle-highlights.json',
    mimeType: 'application/json',
    isMultiFile: false,
    label: 'JSON',
    description: 'Structured data format for developers and automation',
    icon: 'braces'
  },
  csv: {
    create: () => new CsvExporter(),
    filename: 'kindle-highlights.csv',
    mimeType: 'text/csv',
    isMultiFile: false,
    label: 'CSV',
    description: 'Spreadsheet format, works with Excel and Google Sheets',
    icon: 'table'
  },
  html: {
    create: () => new HtmlExporter(),
    filename: 'kindle-highlights.html',
    mimeType: 'text/html',
    isMultiFile: false,
    label: 'HTML',
    description: 'Web page format, viewable in any browser',
    icon: 'globe'
  },
  obsidian: {
    create: () => new ObsidianExporter(),
    filename: 'kindle-obsidian.zip',
    mimeType: 'application/zip',
    isMultiFile: true,
    label: 'Obsidian',
    description: 'Multiple markdown files with YAML frontmatter',
    icon: 'diamond'
  },
  joplin: {
    create: () => new JoplinExporter(),
    filename: 'kindle-highlights.jex',
    mimeType: 'application/octet-stream',
    isMultiFile: false,
    label: 'Joplin JEX',
    description: 'Joplin archive format, importable directly',
    icon: 'package'
  }
}

/**
 * List of all available export formats.
 * Derived from FORMAT_REGISTRY keys.
 */
export const EXPORT_FORMATS = Object.keys(FORMAT_REGISTRY) as ExportFormat[]

/**
 * Export clippings to the specified format.
 */
export async function exportClippings(
  clippings: Clipping[],
  format: ExportFormat,
  options?: Partial<ExporterOptions>
): Promise<ExportResultData> {
  const config = FORMAT_REGISTRY[format]
  if (!config) {
    throw new Error(`Unsupported export format: ${format}`)
  }

  const exporter = config.create()
  const mergedOptions = { ...defaultOptions, ...options }

  const result = await exporter.export(clippings, mergedOptions)
  if (result.isErr()) throw new Error(result.error.message)

  const output = result.value.output
  const files = result.value.files ?? []

  return {
    format,
    content: typeof output === 'string' ? output : '',
    files,
    filename: config.filename,
    mimeType: config.mimeType,
    isMultiFile: config.isMultiFile || files.length > 0
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
      const content = typeof file.content === 'string' ? file.content : t('export.preview_binary')
      return `📄 ${file.path}\n${content.slice(0, 200)}${content.length > 200 ? '...' : ''}`
    }).join('\n\n---\n\n')
    const moreFiles = result.files.length > 5
      ? `\n\n${t('export.preview_more_files', { count: result.files.length - 5 })}`
      : ''
    return preview + moreFiles
  }

  const previewLength = 2000
  const truncated = result.content.length > previewLength
    ? `\n\n${t('export.preview_truncated')}`
    : ''
  return result.content.slice(0, previewLength) + truncated
}

/**
 * Download export as a file.
 * For multi-file exports, creates a ZIP archive.
 */
export async function downloadExport(result: ExportResultData): Promise<void> {
  if (result.isMultiFile && result.files.length > 0) {
    // Create ZIP for multi-file exports
    const zip = new JSZip()

    for (const file of result.files) {
      if (typeof file.content === 'string') {
        zip.file(file.path, file.content)
      } else if (file.content instanceof Uint8Array) {
        zip.file(file.path, file.content)
      }
    }

    try {
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, result.filename)
    } catch (error) {
      console.error('Failed to generate ZIP:', error)
      throw new Error(t('export.zip_failed'))
    }
  } else {
    downloadFile(result.content, result.filename, result.mimeType)
  }
}

/**
 * Helper to trigger file download from string content.
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  downloadBlob(blob, filename)
}

/**
 * Helper to trigger file download from Blob.
 */
function downloadBlob(blob: Blob, filename: string): void {
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
 * Derives from FORMAT_REGISTRY for single source of truth.
 */
export function getFormatInfo(format: ExportFormat): {
  label: string
  description: string
  extension: string
  icon: string
} {
  const config = FORMAT_REGISTRY[format]
  return {
    label: config.label,
    description: config.description,
    extension: getExtension(config.filename),
    icon: config.icon
  }
}
