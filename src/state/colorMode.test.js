import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { colorMode } from './colorMode.js'

describe('colorMode', () => {
  beforeEach(() => { colorMode.value = 'dark' })

  it('defaults to dark', () => {
    expect(colorMode.value).toBe('dark')
  })

  it('can be set to light', () => {
    colorMode.value = 'light'
    expect(colorMode.value).toBe('light')
  })

  it('can be set back to dark', () => {
    colorMode.value = 'light'
    colorMode.value = 'dark'
    expect(colorMode.value).toBe('dark')
  })

  it('adds light class to html element when set to light', async () => {
    colorMode.value = 'light'
    await nextTick()
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })

  it('removes light class from html element when set back to dark', async () => {
    colorMode.value = 'light'
    await nextTick()
    colorMode.value = 'dark'
    await nextTick()
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })
})
