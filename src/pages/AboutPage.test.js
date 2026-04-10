import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutPage from './AboutPage.vue'

describe('AboutPage', () => {
  it('renders the about page', () => {
    const w = mount(AboutPage)
    expect(w.find('.about-page').exists()).toBe(true)
  })

  it('contains a GitHub link', () => {
    const w = mount(AboutPage)
    const link = w.find('a[href*="github.com"]')
    expect(link.exists()).toBe(true)
  })

  it('shows the byline', () => {
    const w = mount(AboutPage)
    expect(w.text()).toContain('ammul')
  })
})
