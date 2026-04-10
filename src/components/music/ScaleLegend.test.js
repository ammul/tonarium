import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScaleLegend from './ScaleLegend.vue'

describe('ScaleLegend', () => {
  it('renders root legend item', () => {
    const w = mount(ScaleLegend)
    expect(w.find('.legend-item.root').exists()).toBe(true)
  })

  it('renders anchor legend item by default', () => {
    const w = mount(ScaleLegend)
    expect(w.find('.legend-item.anchor').exists()).toBe(true)
  })

  it('hides anchor when showAnchor is false', () => {
    const w = mount(ScaleLegend, { props: { showAnchor: false } })
    expect(w.find('.legend-item.anchor').exists()).toBe(false)
  })

  it('uses custom activeLabel', () => {
    const w = mount(ScaleLegend, { props: { activeLabel: 'in scale' } })
    expect(w.find('.legend-item.safe').text()).toBe('in scale')
  })
})
