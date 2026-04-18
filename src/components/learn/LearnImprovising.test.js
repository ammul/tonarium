import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote:  vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

import LearnImprovising from './LearnImprovising.vue'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LearnImprovising', () => {
  it('renders 3 improv chord type items', () => {
    const wrapper = mount(LearnImprovising)
    expect(wrapper.findAll('.tc-learn-improv-item')).toHaveLength(3)
  })

  it('no chord demo is open by default', () => {
    const wrapper = mount(LearnImprovising)
    expect(wrapper.find('.tc-learn-improv-demo').exists()).toBe(false)
  })

  it('clicking a chord item opens its demo panel', async () => {
    const wrapper = mount(LearnImprovising)
    await wrapper.findAll('.tc-learn-improv-item')[0].trigger('click')
    expect(wrapper.find('.tc-learn-improv-demo').exists()).toBe(true)
  })

  it('clicking the same chord item again closes the demo panel', async () => {
    const wrapper = mount(LearnImprovising)
    await wrapper.findAll('.tc-learn-improv-item')[0].trigger('click')
    await wrapper.findAll('.tc-learn-improv-item')[0].trigger('click')
    expect(wrapper.find('.tc-learn-improv-demo').exists()).toBe(false)
  })

  it('renders good and bad note buttons when a card is open', async () => {
    const wrapper = mount(LearnImprovising)
    await wrapper.findAll('.tc-learn-improv-item')[0].trigger('click')
    expect(wrapper.findAll('.tc-learn-improv-ie-note-btn.good').length).toBeGreaterThan(0)
    expect(wrapper.findAll('.tc-learn-improv-ie-note-btn.bad').length).toBeGreaterThan(0)
  })

  it('opening a different card closes the previous one', async () => {
    const wrapper = mount(LearnImprovising)
    await wrapper.findAll('.tc-learn-improv-item')[0].trigger('click')
    await wrapper.findAll('.tc-learn-improv-item')[1].trigger('click')
    expect(wrapper.findAll('.tc-learn-improv-demo')).toHaveLength(1)
  })
})
