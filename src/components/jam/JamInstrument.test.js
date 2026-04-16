import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(), stopNote: vi.fn(), playNote: vi.fn(),
}))

vi.mock('@/audio/midiManager.js', async () => {
  const { ref } = await import('vue')
  return {
    midiStatus:       ref('idle'),
    activeInputNotes: ref(new Set()),
  }
})

import JamInstrument from './JamInstrument.vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { selectedRoot, selectedScaleId } from '@/state/jamSettings.js'

beforeEach(() => {
  displayMode.value   = 'pad'
  padSize.value       = '4x3'
  selectedRoot.value  = 'A'
  selectedScaleId.value = 'mi.p'
})

describe('JamInstrument', () => {
  it('renders without errors', () => {
    const wrapper = mount(JamInstrument)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders scale legend', () => {
    const wrapper = mount(JamInstrument)
    expect(wrapper.find('.tc-scale-legend').exists()).toBe(true)
  })

  it('renders scale notes strip', () => {
    const wrapper = mount(JamInstrument)
    expect(wrapper.find('.tc-instrument-scale-notes').exists()).toBe(true)
    expect(wrapper.findAll('.tc-instrument-scale-note').length).toBeGreaterThan(0)
  })

  it('renders pad grid in pad mode', () => {
    const wrapper = mount(JamInstrument)
    const pads = wrapper.findAll('.tc-instrument-pad')
    // 4x3 = 12 pads
    expect(pads.length).toBe(12)
  })

  it('renders 16 pads in 4x4 mode', async () => {
    padSize.value = '4x4'
    const wrapper = mount(JamInstrument)
    await nextTick()
    expect(wrapper.findAll('.tc-instrument-pad').length).toBe(16)
  })

  it('root pad has root class', () => {
    const wrapper = mount(JamInstrument)
    const rootPads = wrapper.findAll('.tc-instrument-pad.root')
    expect(rootPads.length).toBeGreaterThan(0)
  })

  it('anchor pads are present for minor pentatonic', () => {
    const wrapper = mount(JamInstrument)
    const anchors = wrapper.findAll('.tc-instrument-pad.anchor')
    expect(anchors.length).toBeGreaterThan(0)
  })

  it('renders guitar neck in guitar mode', async () => {
    displayMode.value = 'guitar'
    const wrapper = mount(JamInstrument)
    await nextTick()
    expect(wrapper.find('.tc-instrument-guitar-neck').exists()).toBe(true)
  })

  it('renders piano in piano mode', async () => {
    displayMode.value = 'piano'
    const wrapper = mount(JamInstrument)
    await nextTick()
    expect(wrapper.findComponent({ name: 'PianoOctave' }).exists()).toBe(true)
  })

  it('scale notes strip shows correct note names for A minor pentatonic', () => {
    const wrapper = mount(JamInstrument)
    const notes = wrapper.findAll('.tc-instrument-scale-note').map(n => n.text())
    // A minor pentatonic: A C D E G
    expect(notes).toContain('A')
    expect(notes).toContain('C')
    expect(notes).toContain('E')
  })
})
