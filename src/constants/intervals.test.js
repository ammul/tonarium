import { describe, it, expect } from 'vitest'
import { INTERVALS } from './intervals.js'

describe('INTERVALS', () => {
  it('has 11 intervals (semitones 1-11)', () => {
    expect(INTERVALS).toHaveLength(11)
  })

  it('semitones are sequential 1-11', () => {
    INTERVALS.forEach((itv, i) => {
      expect(itv.semi).toBe(i + 1)
    })
  })

  it('each has name and feel', () => {
    for (const itv of INTERVALS) {
      expect(itv.name).toBeTruthy()
      expect(itv.feel).toBeTruthy()
    }
  })
})
