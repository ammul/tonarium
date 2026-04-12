import { describe, it, expect } from 'vitest'
import {
  OPEN_STRINGS, STRING_NAMES, FRET_COUNT,
  PIANO_WHITE, PIANO_BLACK,
} from '../index.js'

describe('Guitar layout', () => {
  it('has 6 open strings', () => expect(OPEN_STRINGS).toHaveLength(6))
  it('has 6 string names', () => expect(STRING_NAMES).toHaveLength(6))
  it('open string indices are in 0–11', () => {
    for (const s of OPEN_STRINGS) {
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(11)
    }
  })
  it('FRET_COUNT is a positive integer', () => {
    expect(FRET_COUNT).toBeGreaterThan(0)
    expect(Number.isInteger(FRET_COUNT)).toBe(true)
  })
})

describe('Piano layout', () => {
  it('has 7 white keys', () => expect(PIANO_WHITE).toHaveLength(7))
  it('has 5 black keys', () => expect(PIANO_BLACK).toHaveLength(5))

  it('white key indices are in 0–11', () => {
    for (const idx of PIANO_WHITE) {
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThanOrEqual(11)
    }
  })

  it('black keys have noteIdx in 0–11 and after >= 0', () => {
    for (const bk of PIANO_BLACK) {
      expect(bk.noteIdx).toBeGreaterThanOrEqual(0)
      expect(bk.noteIdx).toBeLessThanOrEqual(11)
      expect(bk.after).toBeGreaterThanOrEqual(0)
    }
  })

  it('no overlap between white and black key note indices', () => {
    const whiteSet = new Set(PIANO_WHITE)
    for (const bk of PIANO_BLACK) {
      expect(whiteSet.has(bk.noteIdx)).toBe(false)
    }
  })
})
