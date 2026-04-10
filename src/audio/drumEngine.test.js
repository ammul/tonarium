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

vi.mock('@/audio/audioContext.js', () => ({
  getCtx: () => mockCtx,
  getCompressor: () => mockCompressor,
}))

import { pattern, bpm, isPlaying, currentStep, play, pause, clearPattern, toggleCell, INSTRUMENTS, triggerDrumHit } from './drumEngine.js'

beforeEach(() => {
  clearPattern()
  if (isPlaying.value) pause()
  bpm.value = 120
})

describe('INSTRUMENTS', () => {
  it('has 9 instruments', () => {
    expect(INSTRUMENTS).toHaveLength(9)
  })
})

describe('pattern', () => {
  it('default is 9x16 all false', () => {
    expect(pattern.value).toHaveLength(9)
    for (const row of pattern.value) {
      expect(row).toHaveLength(16)
      expect(row.every(v => v === false)).toBe(true)
    }
  })
})

describe('toggleCell', () => {
  it('toggles a cell on', () => {
    toggleCell(0, 0)
    expect(pattern.value[0][0]).toBe(true)
  })

  it('toggles a cell off', () => {
    toggleCell(0, 0)
    toggleCell(0, 0)
    expect(pattern.value[0][0]).toBe(false)
  })

  it('does not affect other cells', () => {
    toggleCell(2, 5)
    expect(pattern.value[0][0]).toBe(false)
    expect(pattern.value[2][5]).toBe(true)
  })
})

describe('clearPattern', () => {
  it('resets all cells to false', () => {
    toggleCell(0, 0)
    toggleCell(3, 7)
    clearPattern()
    for (const row of pattern.value) {
      expect(row.every(v => v === false)).toBe(true)
    }
  })
})

describe('play / pause', () => {
  it('play sets isPlaying to true', () => {
    play()
    expect(isPlaying.value).toBe(true)
    pause()
  })

  it('pause sets isPlaying to false and resets step', () => {
    play()
    pause()
    expect(isPlaying.value).toBe(false)
    expect(currentStep.value).toBe(0)
  })
})

describe('triggerDrumHit', () => {
  it('triggers audio for a valid instrument index', () => {
    triggerDrumHit(0, 0.1)
    expect(mockCtx.createOscillator).toHaveBeenCalled()
  })

  it('does not throw for invalid index', () => {
    expect(() => triggerDrumHit(99, 0.1)).not.toThrow()
  })
})

describe('bpm', () => {
  it('defaults to 120', () => {
    expect(bpm.value).toBe(120)
  })

  it('is settable', () => {
    bpm.value = 90
    expect(bpm.value).toBe(90)
  })
})
