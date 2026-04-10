import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/pages/JamMode.vue', () => ({ default: { template: '<div class="jam-mode-stub"></div>' } }))
vi.mock('@/pages/ChordProgressions.vue', () => ({ default: { template: '<div class="chord-progressions-stub"></div>' } }))
vi.mock('@/pages/DrumComputer.vue', () => ({ default: { template: '<div class="drum-computer-stub"></div>' } }))

import StartPage from './StartPage.vue'

describe('StartPage', () => {
  it('renders without errors', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders 3 panels', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.findAll('.panel')).toHaveLength(3)
  })

  it('panel labels include Jam Mode, Chord Progressions, Drum Computer', () => {
    const wrapper = mount(StartPage)
    const labels = wrapper.findAll('.panel-label').map(el => el.text())
    expect(labels).toContain('Jam Mode')
    expect(labels).toContain('Chord Progressions')
    expect(labels).toContain('Drum Computer')
  })

  it('no panel is open by default', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.findAll('.panel.open')).toHaveLength(0)
  })

  it('opens jam panel when openPanel prop is "jam"', () => {
    const wrapper = mount(StartPage, { props: { openPanel: 'jam' } })
    expect(wrapper.findAll('.panel.open')).toHaveLength(1)
    expect(wrapper.find('.panel.open .panel-label').text()).toBe('Jam Mode')
  })

  it('emits navigate with panel id when panel header is clicked', async () => {
    const wrapper = mount(StartPage)
    await wrapper.findAll('.panel-header')[0].trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0][0]).toBe('jam')
  })

  it('shows hero text when no panel is open', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.find('.hero').exists()).toBe(true)
  })

  it('hides hero text when a panel is open', () => {
    const wrapper = mount(StartPage, { props: { openPanel: 'jam' } })
    expect(wrapper.find('.hero').exists()).toBe(false)
  })
})
