import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCompressor = {
  threshold: { value: 0 }, knee: { value: 0 }, ratio: { value: 0 },
  attack: { value: 0 }, release: { value: 0 }, connect: vi.fn(),
}

const mockCtx = {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  resume: vi.fn(),
  destination: {},
  createOscillator: vi.fn(() => ({
    type: '', frequency: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() },
    connect: vi.fn(),
  })),
  createBufferSource: vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() })),
  createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(44100)) })),
  createBiquadFilter: vi.fn(() => ({ type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn() })),
  createDynamicsCompressor: vi.fn(() => mockCompressor),
}

const mockGainDest = { gain: { value: 1 }, connect: vi.fn() }

vi.mock('@/audio/audioContext.js', () => ({
  getCtx: () => mockCtx,
  getCompressor: () => mockCompressor,
  getJamDest:  () => mockGainDest,
  getBeatDest: () => mockGainDest,
  getProgDest: () => mockGainDest,
  JAM_GAIN_BASE:  1.0,
  BEAT_GAIN_BASE: 0.55,
  PROG_GAIN_BASE: 0.35,
}))

vi.stubGlobal('setTimeout', vi.fn())
vi.stubGlobal('clearTimeout', vi.fn())

vi.mock('@/audio/midiManager.js', () => ({
  midiStatus:  { value: 'idle' },
  midiChannel: { value: 0 },
  chordOn:     vi.fn(),
  chordOff:    vi.fn(),
  activeInputNotes: { value: new Set() },
}))

vi.mock('@/audio/audioEngine.js', () => ({
  startNote:    vi.fn(),
  stopNote:     vi.fn(),
  stopAllNotes: vi.fn(),
  playNote:     vi.fn(),
  playChord:    vi.fn(),
}))

import { startTransport, stopTransport } from './transportClock.js'
import { sessionPlaying, sessionBpm, sessionProgression, sessionCurrentChordIdx } from '@/state/sessionState.js'
import { isPlaying as drumIsPlaying } from '@/audio/drumEngine.js'

beforeEach(() => {
  stopTransport()
  sessionBpm.value = 120
  sessionProgression.value = null
  sessionCurrentChordIdx.value = 0
})

describe('startTransport', () => {
  it('sets sessionPlaying and drumIsPlaying to true', () => {
    startTransport()
    expect(sessionPlaying.value).toBe(true)
    expect(drumIsPlaying.value).toBe(true)
    stopTransport()
  })

  it('does not double-start', () => {
    startTransport()
    const callCount = setTimeout.mock.calls.length
    startTransport()
    expect(setTimeout.mock.calls.length).toBe(callCount)
    stopTransport()
  })
})

describe('stopTransport', () => {
  it('sets sessionPlaying and drumIsPlaying to false', () => {
    startTransport()
    stopTransport()
    expect(sessionPlaying.value).toBe(false)
    expect(drumIsPlaying.value).toBe(false)
  })

  it('resets chord index to 0', () => {
    sessionCurrentChordIdx.value = 3
    startTransport()
    stopTransport()
    expect(sessionCurrentChordIdx.value).toBe(0)
  })
})
