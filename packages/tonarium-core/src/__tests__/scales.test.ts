import { describe, it, expect } from 'vitest'
import { JAM_SCALES, VISUALIZER_SCALES, LEARN_SCALES } from '../index.js'

function validIntervals(intervals: number[]) {
  return intervals.every(n => n >= 0 && n <= 11)
}

describe('JAM_SCALES', () => {
  it('is non-empty', () => expect(JAM_SCALES.length).toBeGreaterThan(0))
  it('each entry has id, label, intervals, description', () => {
    for (const s of JAM_SCALES) {
      expect(typeof s.id).toBe('string')
      expect(typeof s.label).toBe('string')
      expect(Array.isArray(s.intervals)).toBe(true)
      expect(typeof s.description).toBe('string')
    }
  })
  it('all intervals are in 0–11', () => {
    for (const s of JAM_SCALES) expect(validIntervals(s.intervals)).toBe(true)
  })
  it('ids are unique', () => {
    const ids = JAM_SCALES.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('VISUALIZER_SCALES', () => {
  it('is non-empty', () => expect(VISUALIZER_SCALES.length).toBeGreaterThan(0))
  it('all intervals are in 0–11', () => {
    for (const s of VISUALIZER_SCALES) expect(validIntervals(s.intervals)).toBe(true)
  })
  it('ids are unique', () => {
    const ids = VISUALIZER_SCALES.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('LEARN_SCALES', () => {
  it('is non-empty', () => expect(LEARN_SCALES.length).toBeGreaterThan(0))
  it('each entry has name, steps, feel', () => {
    for (const s of LEARN_SCALES) {
      expect(typeof s.name).toBe('string')
      expect(Array.isArray(s.steps)).toBe(true)
      expect(typeof s.feel).toBe('string')
    }
  })
})
