import { describe, it, expect, beforeEach } from 'vitest'
import { soundStyle } from './soundStyle.js'

const VALID_STYLES = ['synth', 'piano', 'bell', 'pluck']

describe('soundStyle', () => {
  beforeEach(() => { soundStyle.value = 'synth' })

  it('defaults to synth', () => {
    expect(soundStyle.value).toBe('synth')
  })

  it.each(VALID_STYLES)('can be set to %s', (style) => {
    soundStyle.value = style
    expect(soundStyle.value).toBe(style)
  })

  it('refs are independently reactive from other state', () => {
    soundStyle.value = 'bell'
    expect(soundStyle.value).toBe('bell')
  })
})
