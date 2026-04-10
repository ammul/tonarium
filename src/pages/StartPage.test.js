import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StartPage from './StartPage.vue'

describe('StartPage', () => {
  it('renders without errors', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders 3 feature buttons', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.findAll('.feature-btn')).toHaveLength(3)
  })

  it('feature buttons have labels for Jam, Progressions, and Drums', () => {
    const wrapper = mount(StartPage)
    const labels = wrapper.findAll('.feature-label').map(el => el.text())
    expect(labels).toContain('Jam Mode')
    expect(labels).toContain('Chord Progressions')
    expect(labels).toContain('Drum Computer')
  })

  it('emits navigate with correct id when a feature button is clicked', async () => {
    const wrapper = mount(StartPage)
    await wrapper.findAll('.feature-btn')[0].trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0][0]).toBe('jam')
  })

  it('emits navigate with "chords" when progressions button is clicked', async () => {
    const wrapper = mount(StartPage)
    const chordsBtn = wrapper.findAll('.feature-btn')[1]
    await chordsBtn.trigger('click')
    expect(wrapper.emitted('navigate')[0][0]).toBe('chords')
  })

  it('emits navigate with "drums" when drum computer button is clicked', async () => {
    const wrapper = mount(StartPage)
    const drumsBtn = wrapper.findAll('.feature-btn')[2]
    await drumsBtn.trigger('click')
    expect(wrapper.emitted('navigate')[0][0]).toBe('drums')
  })
})
