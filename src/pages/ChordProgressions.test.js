import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote:    vi.fn(),
  stopNote:     vi.fn(),
  stopAllNotes: vi.fn(),
  playNote:     vi.fn(),
}))

vi.mock('@/audio/midiManager.js', async () => {
  const { ref } = await import('vue')
  return {
    midiStatus:  ref('idle'),
    midiChannel: ref(0),
    chordOn:     vi.fn(),
    chordOff:    vi.fn(),
  }
})

import ChordProgressions from './ChordProgressions.vue'
import { displayMode } from '@/state/displayMode.js'

beforeEach(() => {
  displayMode.value = 'pad'
})

describe('ChordProgressions', () => {
  it('renders without errors', () => {
    const wrapper = mount(ChordProgressions)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders chord cards for the default expanded progression', () => {
    const wrapper = mount(ChordProgressions)
    expect(wrapper.findAll('.tc-progressions-chord-card').length).toBeGreaterThan(0)
  })

  it('defaults to C root - chord names are C-based', () => {
    const wrapper = mount(ChordProgressions)
    const names = wrapper.findAll('.tc-progressions-chord-name').map(n => n.text())
    // C major default: first chord should be C major (root)
    expect(names[0]).toBe('C')
  })

  it('renders key picker select', () => {
    const wrapper = mount(ChordProgressions)
    const selects = wrapper.findAll('.tc-progressions-controls select')
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('renders genre filter select', () => {
    const wrapper = mount(ChordProgressions)
    const selects = wrapper.findAll('.tc-progressions-controls select')
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('renders major and minor progression sections', () => {
    const wrapper = mount(ChordProgressions)
    expect(wrapper.findAll('.tc-prog-section').length).toBeGreaterThanOrEqual(2)
  })

  it('chord display appears before the key picker in the DOM', () => {
    const wrapper = mount(ChordProgressions)
    const html = wrapper.html()
    const chordRowPos  = html.indexOf('tc-progressions-chord-row')
    const controlsPos  = html.indexOf('tc-progressions-controls')
    expect(chordRowPos).toBeLessThan(controlsPos)
  })

  it('progression lists appear after the controls', () => {
    const wrapper = mount(ChordProgressions)
    const html = wrapper.html()
    const controlsPos = html.indexOf('tc-progressions-controls')
    const sectionPos  = html.indexOf('tc-prog-section')
    expect(controlsPos).toBeLessThan(sectionPos)
  })
})
