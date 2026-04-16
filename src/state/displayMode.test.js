import { describe, it, expect, beforeEach } from 'vitest'
import { displayMode } from './displayMode.js'

describe('displayMode', () => {
  beforeEach(() => { displayMode.value = 'pad' })

  it('defaults to pad', () => {
    expect(displayMode.value).toBe('pad')
  })

  it('can be set to guitar', () => {
    displayMode.value = 'guitar'
    expect(displayMode.value).toBe('guitar')
  })

  it('can be set to piano', () => {
    displayMode.value = 'piano'
    expect(displayMode.value).toBe('piano')
  })
})
