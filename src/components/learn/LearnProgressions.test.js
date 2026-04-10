import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
  playNote: vi.fn(),
}))

import LearnProgressions from './LearnProgressions.vue'
import { playChord } from '@/audio/audioEngine.js'

describe('LearnProgressions', () => {
  it('renders the step content', () => {
    const w = mount(LearnProgressions)
    expect(w.find('.step-content').exists()).toBe(true)
  })

  it('renders 7 diatonic chords', () => {
    const w = mount(LearnProgressions)
    const chords = w.findAll('.diatonic-chord')
    expect(chords.length).toBe(7)
  })

  it('plays chord on diatonic chord pointerdown', async () => {
    const w = mount(LearnProgressions)
    await w.findAll('.diatonic-chord')[0].trigger('pointerdown')
    expect(playChord).toHaveBeenCalled()
  })

  it('shows Roman numeral labels', () => {
    const w = mount(LearnProgressions)
    const romans = w.findAll('.dc-roman')
    expect(romans[0].text()).toBe('I')
    expect(romans[1].text()).toBe('ii')
  })
})
