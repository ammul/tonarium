import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StartPage from './StartPage.vue'

describe('StartPage', () => {
  it('renders without errors', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the learn featured card', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.find('.learn-card').exists()).toBe(true)
    expect(wrapper.find('.learn-card h2').text()).toBe('Learn')
  })

  it('renders tool cards', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.findAll('.tool-card').length).toBeGreaterThan(0)
  })

  it('emits navigate with tool id when a tool card is clicked', async () => {
    const wrapper = mount(StartPage)
    await wrapper.find('.tool-card').trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(typeof wrapper.emitted('navigate')[0][0]).toBe('string')
  })

  it('emits navigate with "learn" when learn card is clicked', async () => {
    const wrapper = mount(StartPage)
    await wrapper.find('.learn-card').trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0][0]).toBe('learn')
  })

  it('does not mention Notes display mode', () => {
    const wrapper = mount(StartPage)
    expect(wrapper.text()).not.toContain('Notes')
  })
})
