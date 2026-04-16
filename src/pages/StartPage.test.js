import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/components/jam/JamSessionBar.vue', () => ({ default: { template: '<div class="jam-session-bar-stub"></div>' } }))
vi.mock('@/components/jam/JamInstrument.vue', () => ({ default: { template: '<div class="jam-instrument-stub"></div>' } }))
vi.mock('@/components/jam/ScaleSelector.vue', () => ({ default: { template: '<div class="scale-selector-stub"></div>', props: ['modelValue', 'scales'] } }))

import StartPage from './StartPage.vue'

describe('StartPage', () => {
  it('renders without errors', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders JamSessionBar', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.find('.jam-session-bar-stub').exists()).toBe(true)
  })

  it('renders JamInstrument', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.find('.jam-instrument-stub').exists()).toBe(true)
  })

  it('does not render panels', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.find('.tc-start-panel').exists()).toBe(false)
  })
})
