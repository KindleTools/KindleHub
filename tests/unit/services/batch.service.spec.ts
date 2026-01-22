import { describe, it, expect } from 'vitest'
import {
  generateBatchId,
  generateClippingId,
  createBookKey,
  normalizeString,
  arePotentialDuplicates,
  formatFileSize,
  formatBatchDate
} from '../../../src/services/batch.service'

describe('BatchService', () => {
  describe('generateBatchId', () => {
    it('should generate a valid UUID', () => {
      const id = generateBatchId()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should generate unique IDs', () => {
      const id1 = generateBatchId()
      const id2 = generateBatchId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateClippingId', () => {
    it('should generate a valid UUID', () => {
      const id = generateClippingId()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })
  })

  describe('normalizeString', () => {
    it('should lowercase and trim strings', () => {
      expect(normalizeString('  TEST  ')).toBe('test')
    })

    it('should replace multiple spaces with single space', () => {
      expect(normalizeString('foo   bar')).toBe('foo bar')
    })
  })

  describe('createBookKey', () => {
    it('should create key from author and title', () => {
      expect(createBookKey('The Book', 'The Author')).toBe('the book::the author')
    })

    it('should normalize inputs', () => {
      expect(createBookKey('  The Book  ', '  THE AUTHOR  ')).toBe('the book::the author')
    })
  })

  describe('arePotentialDuplicates', () => {
    it('should return true for identical strings', () => {
      expect(arePotentialDuplicates('content', 'content')).toBe(true)
    })

    it('should return true for close matches within threshold', () => {
      // "Hello world" vs "Hello world!" (len 11 vs 12). Diff is 1. 1/12 = 0.083. 1 - 0.9 = 0.1. 0.083 < 0.1. Match.
      expect(arePotentialDuplicates('Hello world', 'Hello world!')).toBe(true)
    })

    it('should return false for different strings', () => {
      expect(arePotentialDuplicates('something completely different', 'hello world')).toBe(false)
    })

    it('should return true if one is substring of another with lower threshold', () => {
      // "Hello world" (11) vs "Hello world checks" (18). Diff 7/18 = 0.38. Default threshold 0.9 (diff < 0.1) fails.
      // We set threshold to 0.5 (diff < 0.5) to test the substring logic.
      expect(arePotentialDuplicates('Hello world', 'Hello world checks', 0.5)).toBe(true)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format KB', () => {
      expect(formatFileSize(1500)).toBe('1.5 KB')
    })

    it('should format MB', () => {
      expect(formatFileSize(1500000)).toBe('1.4 MB')
    })
  })

  describe('formatBatchDate', () => {
    it('should format date correctly', () => {
      // Mock date to ensure consistent testing mostly for locale, though actual output depends on timezone of test runner
      // We can check if it returns a string with some expected parts
      const date = new Date('2023-01-01T12:00:00')
      const formatted = formatBatchDate(date)
      expect(typeof formatted).toBe('string')
      expect(formatted).toContain('2023')
    })
  })
})
