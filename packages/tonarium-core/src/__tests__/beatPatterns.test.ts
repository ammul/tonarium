import { describe, it, expect } from 'vitest'
import { BEAT_PATTERNS } from '../index.js'

describe('BEAT_PATTERNS', () => {
  it('is non-empty', () => expect(BEAT_PATTERNS.length).toBeGreaterThan(0))

  it('each pattern has name, genre, bpm, desc, rows', () => {
    for (const bp of BEAT_PATTERNS) {
      expect(typeof bp.name).toBe('string')
      expect(typeof bp.genre).toBe('string')
      expect(typeof bp.bpm).toBe('number')
      expect(typeof bp.desc).toBe('string')
      expect(Array.isArray(bp.rows)).toBe(true)
      expect(bp.rows.length).toBeGreaterThan(0)
    }
  })

  it('bpm is in a reasonable range (40–220)', () => {
    for (const bp of BEAT_PATTERNS) {
      expect(bp.bpm).toBeGreaterThanOrEqual(40)
      expect(bp.bpm).toBeLessThanOrEqual(220)
    }
  })

  it('every row has exactly 16 steps', () => {
    for (const bp of BEAT_PATTERNS) {
      for (const row of bp.rows) {
        expect(row.steps, `${bp.name} › ${row.name}`).toHaveLength(16)
      }
    }
  })

  it('all step values are 0 or 1', () => {
    for (const bp of BEAT_PATTERNS) {
      for (const row of bp.rows) {
        for (const step of row.steps) {
          expect([0, 1]).toContain(step)
        }
      }
    }
  })

  it('names are unique', () => {
    const names = BEAT_PATTERNS.map(bp => bp.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
