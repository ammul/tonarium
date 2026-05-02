import { describe, it, expect, beforeEach } from 'vitest'
import { popoverTerm, popoverAnchor, openPopover, closePopover } from './popoverState.js'

beforeEach(() => closePopover())

describe('popoverState', () => {
  it('starts closed', () => {
    expect(popoverTerm.value).toBe(null)
    expect(popoverAnchor.value).toBe(null)
  })

  it('openPopover sets the term', () => {
    openPopover('chord', null)
    expect(popoverTerm.value).toBe('chord')
  })

  it('captures the anchor rect when an element is provided', () => {
    const rect = { top: 10, left: 20, bottom: 30, right: 40, width: 20, height: 20 }
    const el = { getBoundingClientRect: () => rect }
    openPopover('chord', el)
    expect(popoverAnchor.value).toEqual(rect)
  })

  it('handles a missing anchor gracefully', () => {
    openPopover('chord', null)
    expect(popoverAnchor.value).toBe(null)
  })

  it('closePopover clears term and anchor', () => {
    const el = { getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }) }
    openPopover('chord', el)
    closePopover()
    expect(popoverTerm.value).toBe(null)
    expect(popoverAnchor.value).toBe(null)
  })
})
