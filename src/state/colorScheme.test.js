import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { colorScheme } from './colorScheme.js'

const SCHEMES = ['none', 'medieval', 'ko2', 'riddim']

describe('colorScheme', () => {
  beforeEach(() => { colorScheme.value = 'none' })

  it('defaults to none', () => {
    expect(colorScheme.value).toBe('none')
  })

  it.each(SCHEMES.filter(s => s !== 'none'))('can be set to %s', (scheme) => {
    colorScheme.value = scheme
    expect(colorScheme.value).toBe(scheme)
  })

  it('adds scheme class to html element when set', async () => {
    colorScheme.value = 'medieval'
    await nextTick()
    expect(document.documentElement.classList.contains('medieval')).toBe(true)
  })

  it('removes previous scheme class when switching', async () => {
    colorScheme.value = 'medieval'
    await nextTick()
    colorScheme.value = 'ko2'
    await nextTick()
    expect(document.documentElement.classList.contains('medieval')).toBe(false)
    expect(document.documentElement.classList.contains('ko2')).toBe(true)
  })

  it('removes all scheme classes when set to none', async () => {
    colorScheme.value = 'riddim'
    await nextTick()
    colorScheme.value = 'none'
    await nextTick()
    expect(document.documentElement.classList.contains('riddim')).toBe(false)
  })
})
