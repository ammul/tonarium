import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RootNotePicker from './RootNotePicker.vue'

describe('RootNotePicker', () => {
  it('renders 12 note buttons', () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'C' } })
    expect(wrapper.findAll('button')).toHaveLength(12)
  })

  it('highlights the active note', () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'D' } })
    const active = wrapper.findAll('button').filter(b => b.classes().includes('active'))
    expect(active).toHaveLength(1)
    expect(active[0].text()).toBe('D')
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'C' } })
    await wrapper.findAll('button')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('marks sharp notes with .sharp class', () => {
    const wrapper = mount(RootNotePicker, { props: { modelValue: 'C' } })
    const sharps = wrapper.findAll('button').filter(b => b.classes().includes('sharp'))
    expect(sharps.length).toBe(5)
  })
})
