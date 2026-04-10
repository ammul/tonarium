import { describe, it, expect, beforeEach } from 'vitest'
import {
  sessionKey, sessionProgression, sessionBeatIdx,
  sessionBpm, sessionBeatsPerChord, sessionPlaying,
  sessionCurrentChordIdx,
} from './sessionState.js'

describe('sessionState', () => {
  beforeEach(() => {
    sessionKey.value = 'C'
    sessionProgression.value = null
    sessionBeatIdx.value = null
    sessionBpm.value = 120
    sessionBeatsPerChord.value = 2
    sessionPlaying.value = false
    sessionCurrentChordIdx.value = 0
  })

  it('has correct default values', () => {
    expect(sessionKey.value).toBe('C')
    expect(sessionProgression.value).toBeNull()
    expect(sessionBeatIdx.value).toBeNull()
    expect(sessionBpm.value).toBe(120)
    expect(sessionBeatsPerChord.value).toBe(2)
    expect(sessionPlaying.value).toBe(false)
    expect(sessionCurrentChordIdx.value).toBe(0)
  })

  it('refs are independently reactive', () => {
    sessionBpm.value = 90
    expect(sessionBpm.value).toBe(90)
    expect(sessionBeatsPerChord.value).toBe(2)
  })

  it('sessionProgression can hold a progression object', () => {
    const prog = { id: 'test', chords: [{ degree: 0, type: 'maj' }] }
    sessionProgression.value = prog
    expect(sessionProgression.value).toEqual(prog)
  })

  it('sessionBeatIdx can hold a number', () => {
    sessionBeatIdx.value = 3
    expect(sessionBeatIdx.value).toBe(3)
  })
})
