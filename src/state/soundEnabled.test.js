import { describe, it, expect, beforeEach } from 'vitest'
import { soundEnabled } from './soundEnabled.js'

describe('soundEnabled', () => {
  beforeEach(() => { soundEnabled.value = true })

  it('defaults to true', () => {
    expect(soundEnabled.value).toBe(true)
  })

  it('can be set to false', () => {
    soundEnabled.value = false
    expect(soundEnabled.value).toBe(false)
  })

  it('can be toggled back to true', () => {
    soundEnabled.value = false
    soundEnabled.value = true
    expect(soundEnabled.value).toBe(true)
  })
})
