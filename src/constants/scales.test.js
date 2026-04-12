import { describe, it, expect } from 'vitest'
import { JAM_SCALES, VISUALIZER_SCALES } from '@tonarium/core'

describe('JAM_SCALES', () => {
  it('has at least 5 scales', () => {
    expect(JAM_SCALES.length).toBeGreaterThanOrEqual(5)
  })

  it('each scale has id, label, and intervals', () => {
    for (const s of JAM_SCALES) {
      expect(s.id).toBeTruthy()
      expect(s.label).toBeTruthy()
      expect(s.intervals).toBeInstanceOf(Array)
      expect(s.intervals.length).toBeGreaterThan(0)
    }
  })

  it('all intervals are 0-11', () => {
    for (const s of JAM_SCALES) {
      for (const i of s.intervals) {
        expect(i).toBeGreaterThanOrEqual(0)
        expect(i).toBeLessThanOrEqual(11)
      }
    }
  })

  it('every scale starts with 0 (root)', () => {
    for (const s of JAM_SCALES) {
      expect(s.intervals[0]).toBe(0)
    }
  })

  it('ids are unique', () => {
    const ids = JAM_SCALES.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('VISUALIZER_SCALES', () => {
  it('has at least 10 scales', () => {
    expect(VISUALIZER_SCALES.length).toBeGreaterThanOrEqual(10)
  })

  it('each scale has id, label, intervals, and description', () => {
    for (const s of VISUALIZER_SCALES) {
      expect(s.id).toBeTruthy()
      expect(s.label).toBeTruthy()
      expect(s.intervals).toBeInstanceOf(Array)
      expect(s.description).toBeTruthy()
    }
  })
})
