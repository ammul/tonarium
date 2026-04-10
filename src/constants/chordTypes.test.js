import { describe, it, expect } from 'vitest'
import { CHORD_TYPES, IMPROV_CHORD_TYPES, IMPROV_EXAMPLES } from './chordTypes.js'

describe('CHORD_TYPES', () => {
  it('has at least 3 chord types', () => {
    expect(CHORD_TYPES.length).toBeGreaterThanOrEqual(3)
  })

  it('each has chord, def, and itvs', () => {
    for (const ct of CHORD_TYPES) {
      expect(ct.chord).toBeTruthy()
      expect(ct.def).toBeTruthy()
      expect(ct.itvs).toBeInstanceOf(Array)
      expect(ct.itvs[0]).toBe(0)
    }
  })
})

describe('IMPROV_CHORD_TYPES', () => {
  it('has entries with scales', () => {
    expect(IMPROV_CHORD_TYPES.length).toBeGreaterThan(0)
    for (const ct of IMPROV_CHORD_TYPES) {
      expect(ct.chord).toBeTruthy()
      expect(ct.itvs).toBeInstanceOf(Array)
      expect(ct.scales).toBeInstanceOf(Array)
      expect(ct.scales.length).toBeGreaterThan(0)
      for (const sc of ct.scales) {
        expect(sc.name).toBeTruthy()
        expect(sc.desc).toBeTruthy()
      }
    }
  })
})

describe('IMPROV_EXAMPLES', () => {
  it('has entries with good and bad notes', () => {
    expect(IMPROV_EXAMPLES.length).toBeGreaterThan(0)
    for (const ex of IMPROV_EXAMPLES) {
      expect(ex.chordSemi).toBeInstanceOf(Array)
      expect(ex.goodNotes).toBeInstanceOf(Array)
      expect(ex.badNotes).toBeInstanceOf(Array)
      for (const n of ex.goodNotes) {
        expect(typeof n.semi).toBe('number')
        expect(n.name).toBeTruthy()
        expect(n.why).toBeTruthy()
      }
    }
  })
})
