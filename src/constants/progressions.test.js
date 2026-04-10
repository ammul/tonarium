import { describe, it, expect } from 'vitest'
import { GENRES, ALL_PROGRESSIONS } from './progressions.js'

describe('GENRES', () => {
  it('first genre is "all"', () => {
    expect(GENRES[0].id).toBe('all')
  })

  it('each genre has id and label', () => {
    for (const g of GENRES) {
      expect(g.id).toBeTruthy()
      expect(g.label).toBeTruthy()
    }
  })
})

describe('ALL_PROGRESSIONS', () => {
  it('has at least 40 progressions', () => {
    expect(ALL_PROGRESSIONS.length).toBeGreaterThanOrEqual(40)
  })

  it('each progression has required structure', () => {
    for (const p of ALL_PROGRESSIONS) {
      expect(p.id).toBeTruthy()
      expect(p.genre).toBeTruthy()
      expect(['major', 'minor']).toContain(p.key)
      expect(p.label).toBeTruthy()
      expect(p.numeral).toBeTruthy()
      expect(p.chords).toBeInstanceOf(Array)
      expect(p.chords.length).toBeGreaterThan(0)
    }
  })

  it('each chord in a progression has degree and type', () => {
    for (const p of ALL_PROGRESSIONS) {
      for (const c of p.chords) {
        expect(typeof c.degree).toBe('number')
        expect(c.degree).toBeGreaterThanOrEqual(0)
        expect(c.degree).toBeLessThan(12)
        expect(c.type).toBeTruthy()
      }
    }
  })

  it('progression ids are unique', () => {
    const ids = ALL_PROGRESSIONS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every progression genre is listed in GENRES', () => {
    const genreIds = new Set(GENRES.map(g => g.id).filter(id => id !== 'all'))
    for (const p of ALL_PROGRESSIONS) {
      expect(genreIds.has(p.genre)).toBe(true)
    }
  })
})
