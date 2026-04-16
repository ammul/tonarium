import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/audio/audioContext.js', () => ({
  getJamDest:    vi.fn(() => null),
  getBeatDest:   vi.fn(() => null),
  getProgDest:   vi.fn(() => null),
  JAM_GAIN_BASE:  0.8,
  BEAT_GAIN_BASE: 1.0,
  PROG_GAIN_BASE: 0.3,
}))

import { jamVolume, beatVolume, progVolume, initMixer } from './mixerState.js'
import { getJamDest } from '@/audio/audioContext.js'

describe('mixerState', () => {
  beforeEach(() => {
    jamVolume.value  = 1
    beatVolume.value = 1
    progVolume.value = 0.3
    vi.mocked(getJamDest).mockReturnValue(null)
  })

  it('jamVolume defaults to 1', () => {
    expect(jamVolume.value).toBe(1)
  })

  it('beatVolume defaults to 1', () => {
    expect(beatVolume.value).toBe(1)
  })

  it('progVolume defaults to 0.3', () => {
    expect(progVolume.value).toBeCloseTo(0.3)
  })

  it('volume refs are independently mutable', () => {
    jamVolume.value = 0.5
    expect(beatVolume.value).toBe(1)
    expect(progVolume.value).toBeCloseTo(0.3)
  })

  it('initMixer runs without error when no dest nodes exist', () => {
    expect(() => initMixer()).not.toThrow()
  })

  it('initMixer applies gain to dest node when one is available', () => {
    const fakeNode = { gain: { value: 0 } }
    vi.mocked(getJamDest).mockReturnValue(fakeNode)
    jamVolume.value = 0.5
    initMixer()
    expect(fakeNode.gain.value).toBeCloseTo(0.5 * 0.8)
  })
})
