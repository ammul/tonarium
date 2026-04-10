import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(),
  stopNote: vi.fn(),
  stopAllNotes: vi.fn(),
  playNote: vi.fn(),
  playChord: vi.fn(),
}))

vi.mock('@/audio/midiManager.js', () => ({
  midiStatus: { value: 'idle' },
  midiChannel: { value: 0 },
  chordOn: vi.fn(),
  chordOff: vi.fn(),
  activeInputNotes: { value: new Set() },
}))

import ProgressionBuilder from './ProgressionBuilder.vue'

describe('ProgressionBuilder', () => {
  function wrapper(input = 'C Am F G') {
    const w = mount(ProgressionBuilder)
    w.find('input').setValue(input)
    return w
  }

  it('renders the text input', () => {
    const w = mount(ProgressionBuilder)
    expect(w.find('input.chord-input').exists()).toBe(true)
  })

  it('parses valid major chord', async () => {
    const w = wrapper('C')
    await w.vm.$nextTick()
    expect(w.findAll('.chord-card').length).toBe(1)
    expect(w.find('.chord-name').text()).toBe('C')
  })

  it('parses minor chord', async () => {
    const w = wrapper('Am')
    await w.vm.$nextTick()
    expect(w.find('.chord-name').text()).toBe('Am')
  })

  it('parses dominant 7th', async () => {
    const w = wrapper('G7')
    await w.vm.$nextTick()
    expect(w.find('.chord-name').text()).toBe('G7')
  })

  it('parses sharp notes', async () => {
    const w = wrapper('F#m')
    await w.vm.$nextTick()
    expect(w.find('.chord-name').text()).toBe('F#m')
  })

  it('converts flats to sharps', async () => {
    const w = wrapper('Bb')
    await w.vm.$nextTick()
    expect(w.find('.chord-name').text()).toBe('A#')
  })

  it('shows error badge for invalid tokens', async () => {
    const w = wrapper('C xyz G')
    await w.vm.$nextTick()
    expect(w.find('.error-token').exists()).toBe(true)
    expect(w.find('.error-token').text()).toBe('xyz')
  })

  it('parses multiple valid chords', async () => {
    const w = wrapper('D f#m E D')
    await w.vm.$nextTick()
    expect(w.findAll('.chord-card').length).toBe(4)
  })
})
