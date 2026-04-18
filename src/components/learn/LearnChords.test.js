import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote:  vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

import LearnChords from './LearnChords.vue'
import { playChord, playNote } from '@/audio/audioEngine.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LearnChords', () => {
  it('renders 3 chord type cards', () => {
    const wrapper = mount(LearnChords)
    expect(wrapper.findAll('.tc-learn-chords-card')).toHaveLength(3)
  })

  it('no chord is active by default', () => {
    const wrapper = mount(LearnChords)
    expect(wrapper.find('.tc-learn-chords-card.active').exists()).toBe(false)
    expect(wrapper.find('.tc-learn-chords-display').exists()).toBe(false)
  })

  it('displays note-name interval pills for each chord', () => {
    const wrapper = mount(LearnChords)
    const pills = wrapper.findAll('.tc-learn-chords-interval-pill')
    // major (3) + minor (3) + dom7 (4) = 10 pills
    expect(pills.length).toBe(10)
  })

  it('renders root note picker', () => {
    const wrapper = mount(LearnChords)
    expect(wrapper.find('.picker-row').exists()).toBe(true)
  })

  it('clicking a chord card sets it active and plays the chord', async () => {
    const wrapper = mount(LearnChords)
    await wrapper.findAll('.tc-learn-chords-card')[0].trigger('pointerdown')
    expect(wrapper.findAll('.tc-learn-chords-card')[0].classes()).toContain('active')
    expect(playChord).toHaveBeenCalled()
  })

  it('clicking an active card deactivates it', async () => {
    const wrapper = mount(LearnChords)
    await wrapper.findAll('.tc-learn-chords-card')[0].trigger('pointerdown')
    await wrapper.findAll('.tc-learn-chords-card')[0].trigger('pointerdown')
    expect(wrapper.find('.tc-learn-chords-card.active').exists()).toBe(false)
  })

  it('shows chord display area when a card is active', async () => {
    const wrapper = mount(LearnChords)
    await wrapper.findAll('.tc-learn-chords-card')[0].trigger('pointerdown')
    expect(wrapper.find('.tc-learn-chords-display').exists()).toBe(true)
  })

  it('clicking an interval pill plays a single note', async () => {
    const wrapper = mount(LearnChords)
    await wrapper.findAll('.tc-learn-chords-interval-pill')[0].trigger('pointerdown')
    expect(playNote).toHaveBeenCalled()
  })
})
