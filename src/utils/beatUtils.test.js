import { describe, it, expect, vi } from 'vitest'

vi.mock('@/audio/drumEngine.js', () => ({
  INSTRUMENTS: Array(9).fill(''),
}))

vi.mock('@/constants/beatPatterns.js', () => ({
  BEAT_PATTERNS: [
    {
      name: 'Test Beat',
      bpm: 120,
      rows: [
        { name: 'Kick',    steps: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
        { name: 'Snare',   steps: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0] },
        { name: 'Hi-Hat',  steps: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0] },
      ],
    },
  ],
}))

import { GROOVE_INST_MAP, createEmptyPattern, buildPatternFromBeat } from './beatUtils.js'

describe('GROOVE_INST_MAP', () => {
  it('maps Kick to row 0', () => expect(GROOVE_INST_MAP['Kick']).toBe(0))
  it('maps Snare to row 1', () => expect(GROOVE_INST_MAP['Snare']).toBe(1))
  it('maps Hi-Hat to row 3', () => expect(GROOVE_INST_MAP['Hi-Hat']).toBe(3))
})

describe('createEmptyPattern', () => {
  it('returns a 9x16 all-false grid', () => {
    const p = createEmptyPattern()
    expect(p).toHaveLength(9)
    for (const row of p) {
      expect(row).toHaveLength(16)
      expect(row.every(v => v === false)).toBe(true)
    }
  })

  it('returns a new array each call', () => {
    expect(createEmptyPattern()).not.toBe(createEmptyPattern())
  })
})

describe('buildPatternFromBeat', () => {
  it('returns empty pattern for invalid index', () => {
    const p = buildPatternFromBeat(99)
    expect(p.every(row => row.every(v => v === false))).toBe(true)
  })

  it('fills kick row correctly', () => {
    const p = buildPatternFromBeat(0)
    expect(p[0]).toEqual([true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false])
  })

  it('fills snare row correctly', () => {
    const p = buildPatternFromBeat(0)
    expect(p[1]).toEqual([false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false])
  })

  it('fills hi-hat row at index 3', () => {
    const p = buildPatternFromBeat(0)
    expect(p[3]).toEqual([true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false])
  })

  it('leaves unspecified rows empty', () => {
    const p = buildPatternFromBeat(0)
    // rows 2, 4-8 are not in the test beat
    expect(p[2].every(v => v === false)).toBe(true)
    expect(p[4].every(v => v === false)).toBe(true)
  })
})
