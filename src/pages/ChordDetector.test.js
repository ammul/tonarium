import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
}))

import ChordDetector from './ChordDetector.vue'
import { displayMode } from '@/state/displayMode.js'

beforeEach(() => {
  displayMode.value = 'pad'
})

describe('ChordDetector', () => {
  it('renders without errors', () => {
    const wrapper = mount(ChordDetector)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders pad grid in pad mode', () => {
    const wrapper = mount(ChordDetector)
    expect(wrapper.find('.tc-detector-pad-grid').exists()).toBe(true)
    expect(wrapper.findAll('.tc-detector-pad').length).toBeGreaterThan(0)
  })

  it('shows hint when no notes are selected', () => {
    const wrapper = mount(ChordDetector)
    expect(wrapper.find('.tc-detector-hint').exists()).toBe(true)
  })

  it('renders guitar neck in guitar mode', async () => {
    displayMode.value = 'guitar'
    const wrapper = mount(ChordDetector)
    await nextTick()
    expect(wrapper.find('.tc-detector-neck').exists()).toBe(true)
  })

  it('renders piano in piano mode', async () => {
    displayMode.value = 'piano'
    const wrapper = mount(ChordDetector)
    await nextTick()
    expect(wrapper.findComponent({ name: 'PianoOctave' }).exists()).toBe(true)
  })
})
