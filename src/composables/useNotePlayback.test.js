import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(),
  stopNote: vi.fn(),
}))

// Must use a helper to call composables outside setup
import { useNotePlayback } from './useNotePlayback.js'
import { startNote, stopNote } from '@/audio/audioEngine.js'

let playback

beforeEach(() => {
  vi.clearAllMocks()
  // useNotePlayback uses onUnmounted, but in test context it's fine (won't throw outside setup in vitest)
  try {
    playback = useNotePlayback()
  } catch {
    // onUnmounted may warn outside setup - ignore
  }
})

describe('useNotePlayback', () => {
  it('pressDown calls startNote and adds to pressedMidi', () => {
    playback.pressDown(60)
    expect(startNote).toHaveBeenCalledWith(60, null, null)
    expect(playback.pressedMidi.value.has(60)).toBe(true)
  })

  it('pressUp calls stopNote and removes from pressedMidi', () => {
    playback.pressDown(60)
    playback.pressUp(60)
    expect(stopNote).toHaveBeenCalledWith(60)
    expect(playback.pressedMidi.value.has(60)).toBe(false)
  })

  it('pressToggle toggles on then off', () => {
    playback.pressToggle(72)
    expect(startNote).toHaveBeenCalledWith(72, null, null)
    expect(playback.pressedMidi.value.has(72)).toBe(true)

    playback.pressToggle(72)
    expect(stopNote).toHaveBeenCalledWith(72)
    expect(playback.pressedMidi.value.has(72)).toBe(false)
  })

  it('releaseAll stops all pressed notes', () => {
    playback.pressDown(60)
    playback.pressDown(64)
    playback.releaseAll()
    expect(stopNote).toHaveBeenCalledWith(60)
    expect(stopNote).toHaveBeenCalledWith(64)
    expect(playback.pressedMidi.value.size).toBe(0)
  })
})
