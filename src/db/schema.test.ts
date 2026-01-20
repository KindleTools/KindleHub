import { describe, expect, it } from 'vitest'
import { KindleHubDB } from './schema'

describe('KindleHubDB', () => {
  it('should create a database instance', () => {
    const db = new KindleHubDB()
    expect(db).toBeInstanceOf(KindleHubDB)
    expect(db.name).toBe('KindleHubDB')
  })

  it('should have books table', () => {
    const db = new KindleHubDB()
    expect(db.books).toBeDefined()
  })

  it('should have clippings table', () => {
    const db = new KindleHubDB()
    expect(db.clippings).toBeDefined()
  })
})
