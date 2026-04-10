import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { displayMode } from '@/state/displayMode.js'
import ModeLayout from './ModeLayout.vue'

describe('ModeLayout', () => {
  const slots = {
    pad: '<div class="pad-slot">PAD</div>',
    piano: '<div class="piano-slot">PIANO</div>',
    guitar: '<div class="guitar-slot">GUITAR</div>',
  }

  it('renders pad slot when mode is pad', () => {
    displayMode.value = 'pad'
    const w = mount(ModeLayout, { slots })
    expect(w.find('.pad-slot').exists()).toBe(true)
    expect(w.find('.piano-slot').exists()).toBe(false)
    expect(w.find('.guitar-slot').exists()).toBe(false)
  })

  it('renders piano slot when mode is piano', () => {
    displayMode.value = 'piano'
    const w = mount(ModeLayout, { slots })
    expect(w.find('.piano-slot').exists()).toBe(true)
    expect(w.find('.pad-slot').exists()).toBe(false)
  })

  it('renders guitar slot when mode is guitar', () => {
    displayMode.value = 'guitar'
    const w = mount(ModeLayout, { slots })
    expect(w.find('.guitar-slot').exists()).toBe(true)
    expect(w.find('.pad-slot').exists()).toBe(false)
  })
})
