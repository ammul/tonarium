import { describe, it, expect, beforeEach } from 'vitest'
import { octave } from './octave.js'

describe('octave', () => {
  beforeEach(() => { octave.value = 4 })

  it('defaults to 4', () => {
    expect(octave.value).toBe(4)
  })

  it('can be incremented', () => {
    octave.value = 5
    expect(octave.value).toBe(5)
  })

  it('can be decremented', () => {
    octave.value = 3
    expect(octave.value).toBe(3)
  })

  it('accepts boundary values', () => {
    octave.value = 0
    expect(octave.value).toBe(0)
    octave.value = 9
    expect(octave.value).toBe(9)
  })
})
