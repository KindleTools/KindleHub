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
    mergedHighlights: number
    suspiciousFlagged: number
    tagsExtracted: number
  }
  /** IDs of clippings flagged as suspicious */
  suspiciousIds: string[]
}

export interface ParserServiceOptions extends Omit<Partial<ParseOptions>, 'tagCase'> {
  tagCase?: 'original' | 'uppercase' | 'lowercase' | 'title'
  discardExtractedNotes?: boolean
}

/**
 * Parse file content based on format type.
 */
export async function parseContent(
  content: string,
  format: ImportFormat,
  options?: ParserServiceOptions
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
    extractTags: true,
    tagCase: (options?.tagCase ?? 'original') as any,
    detectedLanguage: detectedLanguage ?? 'en'
  })

  // Filter out Notes that were consumed/converted to tags if requested
  if (options?.discardExtractedNotes) {
    processed.clippings = processed.clippings.filter((c) => {
      if (c.type === 'note' && c.tags && c.tags.length > 0) {
        // This note has tags. We assume if tags were extracted, we check strict content match or just presence?
        // "Pure" tag notes usually have their content equal to the tags text, but let's be safe.
        // For now, consistent with previous logic: if it has tags, it was likely a tag-only note.
        return false
      }
      return true
    })
  }

  // Link tags to parent highlights if applicable (Library might strictly link ID, we backup with location match)
  const clippingsWithTags = new Map<string, string[]>()

  processed.clippings.forEach((c) => {
    if (c.tags && c.tags.length > 0 && c.location) {
      // Use raw location string for matching keys
      const locStr = typeof c.location === 'object' ? (c.location as any).raw : c.location
      const key = `${c.title}-${locStr}`
      clippingsWithTags.set(key, c.tags)
    }
  })

  processed.clippings = processed.clippings.map((c) => {
    // If highlight has no tags but a matching note does, copy them
    if (c.type === 'highlight' && (!c.tags || c.tags.length === 0) && c.location) {
      const locStr = typeof c.location === 'object' ? (c.location as any).raw : c.location
      const key = `${c.title}-${locStr}`
      if (clippingsWithTags.has(key)) {
        return { ...c, tags: clippingsWithTags.get(key) }
      }
    }
    return c
  })

  // Count unique books
  const uniqueBooks = new Set(processed.clippings.map((c) => c.title))

  // Extract suspicious clipping IDs
  // We check if the property exists on the processed result (it usually does in newer versions)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const suspiciousIds = (processed as any).suspicious?.map((c: any) => c.id) ?? []

  // Count unique tags
  const uniqueTags = new Set<string>()
  processed.clippings.forEach((c) => {
    c.tags?.forEach((t) => uniqueTags.add(t))
  })
  const tagsExtracted = uniqueTags.size

  return {
    clippings: processed.clippings,
    stats: {
      totalClippings: processed.clippings.length,
      totalBooks: uniqueBooks.size,
      duplicatesRemoved: processed.duplicatesRemoved,
      linkedNotes: processed.linkedNotes,
      mergedHighlights: processed.mergedHighlights ?? 0,
      suspiciousFlagged: suspiciousIds.length,
      tagsExtracted
    },
    suspiciousIds
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
