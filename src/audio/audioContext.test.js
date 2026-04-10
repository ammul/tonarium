import { describe, it, expect, vi, beforeEach } from 'vitest'

let capturedCtx = null

const MockAudioContext = vi.fn(function () {
  capturedCtx = {
    state: 'running',
    resume: vi.fn(),
    destination: {},
    createDynamicsCompressor: vi.fn(() => ({
      threshold: { value: 0 },
      knee:      { value: 0 },
      ratio:     { value: 0 },
      attack:    { value: 0 },
      release:   { value: 0 },
      connect:   vi.fn(),
    })),
  }
  return capturedCtx
})

vi.stubGlobal('AudioContext', MockAudioContext)

const { getCtx, getCompressor } = await import('./audioContext.js')

describe('getCtx', () => {
  it('returns an AudioContext', () => {
    const ctx = getCtx()
    expect(ctx).toBeDefined()
    expect(MockAudioContext).toHaveBeenCalled()
  })

  it('returns the same context on repeated calls', () => {
    const ctx1 = getCtx()
    const ctx2 = getCtx()
    expect(ctx1).toBe(ctx2)
  })

  it('resumes suspended context', () => {
    capturedCtx.state = 'suspended'
    getCtx()
    expect(capturedCtx.resume).toHaveBeenCalled()
  })
})

describe('getCompressor', () => {
  it('returns a compressor node', () => {
    const comp = getCompressor()
    expect(comp).toBeDefined()
    expect(comp.connect).toBeDefined()
  })

  it('compressor is connected to destination', () => {
    const comp = getCompressor()
    expect(comp.connect).toHaveBeenCalledWith(capturedCtx.destination)
  })
})
