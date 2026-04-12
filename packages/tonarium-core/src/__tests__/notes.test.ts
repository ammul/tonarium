import { describe, it, expect } from 'vitest'
import { NOTES, LABELS, SHARPS, FLAT_MAP, NOTE_TO_SEMI, SEMI_TO_NAME } from '../index.js'

describe('NOTES', () => {
  it('has exactly 12 entries', () => expect(NOTES).toHaveLength(12))
  it('starts with A', () => expect(NOTES[0]).toBe('A'))
  it('contains no duplicates', () => expect(new Set(NOTES).size).toBe(12))
})

describe('LABELS', () => {
  it('has exactly 12 entries', () => expect(LABELS).toHaveLength(12))
  it('matches NOTES length', () => expect(LABELS.length).toBe(NOTES.length))
})

describe('SHARPS', () => {
  it('is a Set', () => expect(SHARPS).toBeInstanceOf(Set))
  it('has 5 entries (A# C# D# F# G#)', () => expect(SHARPS.size).toBe(5))
  it('only contains notes that appear in NOTES', () => {
    for (const s of SHARPS) expect(NOTES).toContain(s)
  })
})

describe('FLAT_MAP', () => {
  it('maps every value to a note in NOTES', () => {
    for (const v of Object.values(FLAT_MAP)) expect(NOTES).toContain(v)
  })
})

describe('NOTE_TO_SEMI / SEMI_TO_NAME', () => {
  it('NOTE_TO_SEMI has 12 entries', () => expect(NOTE_TO_SEMI).toHaveLength(12))
  it('SEMI_TO_NAME has 12 entries', () => expect(SEMI_TO_NAME).toHaveLength(12))
  it('all semitone values are in 0–11', () => {
    for (const s of NOTE_TO_SEMI) {
      expect(s).toBeGreaterThanOrEqual(0)
      expect(s).toBeLessThanOrEqual(11)
    }
  })
})
