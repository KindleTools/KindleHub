/**
 * Parser Service - Wrapper for kindle-tools-ts importing functionality.
 *
 * Provides a unified API for parsing Kindle clippings from TXT, CSV, and JSON formats.
 */
import {
  type Clipping,
  type ImportResult,
  type ParseOptions,
  type SupportedLanguage,
  parseParseOptions,
  CsvImporter,
  JsonImporter,
  TxtImporter,
  processClippings
} from 'kindle-tools-ts'

export type ImportFormat = 'txt' | 'csv' | 'json'

export interface ParsedResult {
  clippings: Clipping[]
  stats: {
    totalClippings: number
    totalBooks: number
    duplicatesRemoved: number
    linkedNotes: number
  }
}

/**
 * Parse file content based on format type.
 */
export async function parseContent(
  content: string,
  format: ImportFormat,
  options?: Partial<ParseOptions>
): Promise<ParsedResult> {
  let importResult: ImportResult

  switch (format) {
    case 'txt': {
      const importer = new TxtImporter()
      importResult = await importer.import(content)
      break
    }
    case 'csv': {
      const importer = new CsvImporter()
      importResult = await importer.import(content)
      break
    }
    case 'json': {
      const importer = new JsonImporter()
      importResult = await importer.import(content)
      break
    }
    default:
      throw new Error(`Unsupported format: ${format}`)
  }

  if (importResult.isErr()) {
    throw new Error(importResult.error.message || 'Failed to parse file')
  }

  const successData = importResult.value
  const detectedLanguage = successData.meta?.detectedLanguage as SupportedLanguage | undefined

  const safeOptions = parseParseOptions(options ?? {})

  // Process clippings (deduplication, linking, etc.)
  const processed = processClippings(successData.clippings, {
    ...safeOptions,
    detectedLanguage: detectedLanguage ?? 'en'
  })

  // Count unique books
  const uniqueBooks = new Set(processed.clippings.map((c) => c.title))

  return {
    clippings: processed.clippings,
    stats: {
      totalClippings: processed.clippings.length,
      totalBooks: uniqueBooks.size,
      duplicatesRemoved: processed.duplicatesRemoved,
      linkedNotes: processed.linkedNotes
    }
  }
}

/**
 * Detect format from file name extension.
 */
export function detectFormat(fileName: string): ImportFormat {
  const ext = fileName.toLowerCase().split('.').pop()
  switch (ext) {
    case 'txt':
      return 'txt'
    case 'csv':
      return 'csv'
    case 'json':
      return 'json'
    default:
      return 'txt' // Default to TXT
  }
}
