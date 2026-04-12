import { describe, it, expect } from 'vitest'
import { CHORD_TYPES, CHORD_SUFFIX, CHORD_DETECT_TYPES } from '../index.js'

const CHORD_TYPE_IDS = ['maj', 'min', 'dim', 'aug', 'dom7', 'maj7', 'min7', 'sus4'] as const

describe('CHORD_TYPES', () => {
  it('has all required chord type ids', () => {
    for (const id of CHORD_TYPE_IDS) expect(CHORD_TYPES).toHaveProperty(id)
  })

  it('each chord starts on interval 0', () => {
    for (const [id, intervals] of Object.entries(CHORD_TYPES)) {
      expect(intervals[0], `${id} must start at 0`).toBe(0)
    }
  })

  it('all intervals are in 0–11', () => {
    for (const intervals of Object.values(CHORD_TYPES)) {
      for (const n of intervals) {
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThanOrEqual(11)
      }
    }
  })
})

describe('CHORD_SUFFIX', () => {
  it('has an entry for every CHORD_TYPES key', () => {
    for (const id of CHORD_TYPE_IDS) expect(CHORD_SUFFIX).toHaveProperty(id)
  })
})

describe('CHORD_DETECT_TYPES', () => {
  it('is a non-empty array', () => expect(CHORD_DETECT_TYPES.length).toBeGreaterThan(0))

  it('every entry has intervals, suffix, and name', () => {
    for (const t of CHORD_DETECT_TYPES) {
      expect(Array.isArray(t.intervals)).toBe(true)
      expect(typeof t.suffix).toBe('string')
      expect(typeof t.name).toBe('string')
    }
  })

  it('all intervals within each detect type are in 0–11', () => {
    for (const t of CHORD_DETECT_TYPES) {
      for (const n of t.intervals) {
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThanOrEqual(11)
      }
    }
  })
})
