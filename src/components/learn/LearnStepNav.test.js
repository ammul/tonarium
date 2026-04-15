import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LearnStepNav from './LearnStepNav.vue'

const STEPS = ['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats']

describe('LearnStepNav', () => {
  it('renders the correct number of step buttons', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 0 } })
    expect(wrapper.findAll('.tc-step-nav-btn')).toHaveLength(7)
  })

  it('renders step labels in correct order', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 0 } })
    const labels = wrapper.findAll('.tc-step-nav-label').map(el => el.text())
    expect(labels).toEqual(STEPS)
  })

  it('marks the active step with the active class', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 2 } })
    expect(wrapper.findAll('.tc-step-nav-btn')[2].classes()).toContain('active')
    expect(wrapper.findAll('.tc-step-nav-btn')[0].classes()).not.toContain('active')
  })

  it('marks visited steps (excluding current) with the done class', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 3, visitedSteps: [0, 1, 2, 3] } })
    expect(wrapper.findAll('.tc-step-nav-btn')[0].classes()).toContain('done')
    expect(wrapper.findAll('.tc-step-nav-btn')[1].classes()).toContain('done')
    expect(wrapper.findAll('.tc-step-nav-btn')[2].classes()).toContain('done')
    expect(wrapper.findAll('.tc-step-nav-btn')[3].classes()).not.toContain('done') // active, not done
  })

  it('only marks actually visited steps as done, not skipped steps', () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 3, visitedSteps: [0, 3] } })
    expect(wrapper.findAll('.tc-step-nav-btn')[0].classes()).toContain('done')
    expect(wrapper.findAll('.tc-step-nav-btn')[1].classes()).not.toContain('done')
    expect(wrapper.findAll('.tc-step-nav-btn')[2].classes()).not.toContain('done')
  })

  it('emits update:modelValue with the clicked step index', async () => {
    const wrapper = mount(LearnStepNav, { props: { steps: STEPS, modelValue: 0 } })
    await wrapper.findAll('.tc-step-nav-btn')[4].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0]).toEqual([4])
  })
})
