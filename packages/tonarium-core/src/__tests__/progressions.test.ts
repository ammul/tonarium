import { describe, it, expect } from 'vitest'
import { GENRES, ALL_PROGRESSIONS } from '../index.js'

describe('GENRES', () => {
  it('is non-empty', () => expect(GENRES.length).toBeGreaterThan(0))
  it('ids are unique', () => {
    const ids = GENRES.map(g => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('each entry has id and label', () => {
    for (const g of GENRES) {
      expect(typeof g.id).toBe('string')
      expect(typeof g.label).toBe('string')
    }
  })
})

describe('ALL_PROGRESSIONS', () => {
  it('is non-empty', () => expect(ALL_PROGRESSIONS.length).toBeGreaterThan(0))

  it('ids are unique', () => {
    const ids = ALL_PROGRESSIONS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each progression has required fields', () => {
    for (const p of ALL_PROGRESSIONS) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.genre).toBe('string')
      expect(['major', 'minor']).toContain(p.key)
      expect(typeof p.label).toBe('string')
      expect(typeof p.numeral).toBe('string')
      expect(Array.isArray(p.chords)).toBe(true)
      expect(p.chords.length).toBeGreaterThan(0)
    }
  })

  it('each chord has degree, type, and numeral', () => {
    for (const p of ALL_PROGRESSIONS) {
      for (const c of p.chords) {
        expect(typeof c.degree).toBe('number')
        expect(typeof c.type).toBe('string')
        expect(typeof c.numeral).toBe('string')
      }
    }
  })

  it('all chord degrees are in 0–11', () => {
    for (const p of ALL_PROGRESSIONS) {
      for (const c of p.chords) {
        expect(c.degree).toBeGreaterThanOrEqual(0)
        expect(c.degree).toBeLessThanOrEqual(11)
      }
    }
  })

  it('genre of each progression appears in GENRES', () => {
    const genreIds = new Set(GENRES.map(g => g.id))
    for (const p of ALL_PROGRESSIONS) {
      expect(genreIds.has(p.genre), `unknown genre "${p.genre}" in "${p.id}"`).toBe(true)
    }
  })
})
