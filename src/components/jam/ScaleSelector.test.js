import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScaleSelector from './ScaleSelector.vue'

const scales = [
  { id: 'mi.p', label: 'mi.p - Minor Pentatonic', description: 'Great for improv.' },
  { id: 'maj',  label: 'maj - Major',              description: 'Bright and resolved.' },
  { id: 'dor',  label: 'dor - Dorian',             description: 'Soulful and funky.' },
]

describe('ScaleSelector', () => {
  it('renders a select with one option per scale', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales },
    })
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(scales.length)
    expect(options[0].text()).toBe('mi.p - Minor Pentatonic')
  })

  it('select value reflects modelValue prop', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'maj', scales },
    })
    const select = wrapper.find('select')
    expect(select.element.value).toBe('maj')
  })

  it('emits update:modelValue with new scale id on change', async () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales },
    })
    const select = wrapper.find('select')
    await select.setValue('maj')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual(['maj'])
  })

  it('does not render info button', () => {
    const wrapper = mount(ScaleSelector, {
      props: { modelValue: 'mi.p', scales },
    })
    expect(wrapper.find('.tc-scale-sel-info-btn').exists()).toBe(false)
  })
})
