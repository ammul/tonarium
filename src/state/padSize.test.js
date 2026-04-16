import { describe, it, expect, beforeEach } from 'vitest'
import { padSize } from './padSize.js'

describe('padSize', () => {
  beforeEach(() => { padSize.value = '4x3' })

  it('defaults to 4x3', () => {
    expect(padSize.value).toBe('4x3')
  })

  it('can be set to 4x4', () => {
    padSize.value = '4x4'
    expect(padSize.value).toBe('4x4')
  })

  it('can be set back to 4x3', () => {
    padSize.value = '4x4'
    padSize.value = '4x3'
    expect(padSize.value).toBe('4x3')
  })
})
