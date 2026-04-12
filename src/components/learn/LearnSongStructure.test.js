import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
  playNote: vi.fn(),
}))

vi.mock('@/audio/midiManager.js', () => ({
  midiStatus: { value: 'idle' },
  midiChannel: { value: 0 },
  chordOn: vi.fn(),
  chordOff: vi.fn(),
  activeInputNotes: { value: new Set() },
}))

import LearnSongStructure from './LearnSongStructure.vue'

describe('LearnSongStructure', () => {
  it('renders the step content', () => {
    const w = mount(LearnSongStructure)
    expect(w.find('.step-content').exists()).toBe(true)
  })

  it('renders 3 song templates', () => {
    const w = mount(LearnSongStructure)
    expect(w.findAll('.tc-learn-song-tmpl-card')).toHaveLength(3)
  })

  it('renders section buttons for each template', () => {
    const w = mount(LearnSongStructure)
    const sections = w.findAll('.tc-learn-song-section-btn')
    expect(sections.length).toBeGreaterThanOrEqual(9)
  })

  it('renders Progression Builder CTA', () => {
    const w = mount(LearnSongStructure)
    const btns = w.findAll('.btn-accent')
    const builderBtn = btns.find(b => b.text().includes('Progression Builder'))
    expect(builderBtn).toBeTruthy()
  })

  it('renders Jam Mode CTA', () => {
    const w = mount(LearnSongStructure)
    const btns = w.findAll('.btn-accent')
    const jamBtn = btns.find(b => b.text().includes('Jam Mode'))
    expect(jamBtn).toBeTruthy()
  })

  it('emits navigate on Jam Mode CTA click', async () => {
    const w = mount(LearnSongStructure)
    const btns = w.findAll('.btn-accent')
    const jamBtn = btns.find(b => b.text().includes('Jam Mode'))
    await jamBtn.trigger('click')
    expect(w.emitted('navigate')).toBeTruthy()
    expect(w.emitted('navigate')[0]).toEqual(['jam'])
  })
})
