import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(),
  stopNote:  vi.fn(),
  playNote:  vi.fn(),
}))

vi.mock('@/audio/midiManager.js', async () => {
  const { ref } = await import('vue')
  return {
    midiStatus:       ref('idle'),
    activeInputNotes: ref(new Set()),
  }
})

import JamMode from './JamMode.vue'
import { displayMode } from '@/state/displayMode.js'

beforeEach(() => {
  displayMode.value = 'pad'
})

describe('JamMode', () => {
  it('renders without errors', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders key and scale pickers', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.findAllComponents({ name: 'PickerRow' }).length).toBeGreaterThan(0)
    expect(wrapper.findComponent({ name: 'ScaleSelector' }).exists()).toBe(true)
  })

  it('defaults to C root - scale notes strip contains C', () => {
    const wrapper = mount(JamMode)
    const noteLabels = wrapper.findAll('.scale-note').map(n => n.text())
    expect(noteLabels).toContain('C')
  })

  it('renders pad grid in pad mode', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.find('.pad-grid').exists()).toBe(true)
    expect(wrapper.findAll('.pad').length).toBeGreaterThan(0)
  })

  it('scale legend renders', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.find('.legend').exists()).toBe(true)
  })

  it('scale notes strip renders', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.find('.scale-notes').exists()).toBe(true)
    expect(wrapper.findAll('.scale-note').length).toBeGreaterThan(0)
  })

  it('shows octave control in pad mode', () => {
    const wrapper = mount(JamMode)
    expect(wrapper.findComponent({ name: 'OctaveControl' }).exists()).toBe(true)
  })

  it('hides octave control in guitar mode', async () => {
    displayMode.value = 'guitar'
    const wrapper = mount(JamMode)
    await nextTick()
    expect(wrapper.findComponent({ name: 'OctaveControl' }).exists()).toBe(false)
  })

  it('renders guitar neck in guitar mode', async () => {
    displayMode.value = 'guitar'
    const wrapper = mount(JamMode)
    await nextTick()
    expect(wrapper.find('.guitar-neck').exists()).toBe(true)
  })

  it('renders piano in piano mode', async () => {
    displayMode.value = 'piano'
    const wrapper = mount(JamMode)
    await nextTick()
    expect(wrapper.findComponent({ name: 'PianoOctave' }).exists()).toBe(true)
  })
})
