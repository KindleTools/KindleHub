import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectFormat } from '@/services/parser.service'

// Note: parseContent tests require mocking kindle-tools-ts which has complex types
// Focus on testing the simpler utility functions

describe('Parser Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('detectFormat', () => {
    it('detects txt format', () => {
      expect(detectFormat('My Clippings.txt')).toBe('txt')
      expect(detectFormat('notes.TXT')).toBe('txt')
    })

    it('detects csv format', () => {
      expect(detectFormat('export.csv')).toBe('csv')
      expect(detectFormat('data.CSV')).toBe('csv')
    })

    it('detects json format', () => {
      expect(detectFormat('backup.json')).toBe('json')
      expect(detectFormat('clippings.JSON')).toBe('json')
    })

    it('defaults to txt for unknown extensions', () => {
      expect(detectFormat('file.unknown')).toBe('txt')
      expect(detectFormat('file.xml')).toBe('txt')
      expect(detectFormat('file')).toBe('txt')
    })

    it('handles files with multiple dots', () => {
      expect(detectFormat('my.clippings.backup.json')).toBe('json')
      expect(detectFormat('export.2024.01.csv')).toBe('csv')
    })

    it('handles empty string', () => {
      expect(detectFormat('')).toBe('txt')
    })
  })
})
