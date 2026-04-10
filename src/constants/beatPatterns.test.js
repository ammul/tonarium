import { describe, it, expect } from 'vitest'
import { BEAT_PATTERNS, BEAT_TIPS } from './beatPatterns.js'

describe('BEAT_PATTERNS', () => {
  it('contains 10 patterns', () => {
    expect(BEAT_PATTERNS).toHaveLength(10)
  })

  it('each pattern has required fields', () => {
    for (const bp of BEAT_PATTERNS) {
      expect(bp.name).toBeTruthy()
      expect(bp.genre).toBeTruthy()
      expect(bp.bpm).toBeGreaterThanOrEqual(60)
      expect(bp.bpm).toBeLessThanOrEqual(200)
      expect(bp.desc).toBeTruthy()
      expect(bp.rows).toBeInstanceOf(Array)
      expect(bp.rows.length).toBeGreaterThan(0)
    }
  })

  it('each row has 16 steps of 0 or 1', () => {
    for (const bp of BEAT_PATTERNS) {
      for (const row of bp.rows) {
        expect(row.name).toBeTruthy()
        expect(row.steps).toHaveLength(16)
        row.steps.forEach(s => expect([0, 1]).toContain(s))
      }
    }
  })

  it('every pattern has Kick, Snare, and Hi-Hat rows', () => {
    for (const bp of BEAT_PATTERNS) {
      const names = bp.rows.map(r => r.name)
      expect(names).toContain('Kick')
      expect(names).toContain('Snare')
      expect(names).toContain('Hi-Hat')
    }
  })
})

describe('BEAT_TIPS', () => {
  it('contains 4 tips', () => {
    expect(BEAT_TIPS).toHaveLength(4)
  })

  it('each tip has num and text', () => {
    for (const tip of BEAT_TIPS) {
      expect(tip.num).toBeTruthy()
      expect(tip.text).toBeTruthy()
    }
  })
})
