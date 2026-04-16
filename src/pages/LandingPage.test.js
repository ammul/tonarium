import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

// Stub heavy child pages
vi.mock('@/pages/StartPage.vue', () => ({ default: { template: '<div class="stub-start-page" />' } }))
vi.mock('@/pages/LearnMode.vue', () => ({ default: { template: '<div class="stub-learn-mode" />' } }))

// Stub audio deps that child pages bring in
vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(), stopNote: vi.fn(), playNote: vi.fn(), stopAllNotes: vi.fn(),
}))
vi.mock('@/audio/midiManager.js', async () => {
  const { ref } = await import('vue')
  return { midiStatus: ref('idle'), activeInputNotes: ref(new Set()) }
})
vi.mock('@/audio/transportClock.js', () => ({ startTransport: vi.fn(), stopTransport: vi.fn() }))
vi.mock('@/audio/drumEngine.js', async () => {
  const { ref } = await import('vue')
  return {
    pattern: ref([]), isPlaying: ref(false), currentStep: ref(0),
    clearPattern: vi.fn(), toggleCell: vi.fn(), INSTRUMENTS: [],
  }
})

import LandingPage from './LandingPage.vue'
import { requestedLandingView, activeLandingView } from '@/state/landingState.js'

beforeEach(() => {
  requestedLandingView.value = null
  activeLandingView.value = null
  // happy-dom may not fully implement these browser APIs
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.spyOn(history, 'pushState').mockImplementation(() => {})
  vi.spyOn(history, 'replaceState').mockImplementation(() => {})
})

describe('LandingPage', () => {
  it('renders without errors', () => {
    const wrapper = mount(LandingPage)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the hero slogan on initial load', () => {
    const wrapper = mount(LandingPage)
    expect(wrapper.find('.tc-landing-slogan').exists()).toBe(true)
  })

  it('renders Quick Jam and Learn CTA buttons on hero', () => {
    const wrapper = mount(LandingPage)
    expect(wrapper.find('.tc-landing-btn--jam').exists()).toBe(true)
    expect(wrapper.find('.tc-landing-btn--learn').exists()).toBe(true)
  })

  it('navigates to jam sub-view when Quick Jam is clicked', async () => {
    const wrapper = mount(LandingPage)
    await wrapper.find('.tc-landing-btn--jam').trigger('click')
    await nextTick()
    expect(wrapper.find('.stub-start-page').exists()).toBe(true)
    expect(wrapper.find('.tc-landing-slogan').exists()).toBe(false)
  })

  it('navigates to learn sub-view when Learn is clicked', async () => {
    const wrapper = mount(LandingPage)
    await wrapper.find('.tc-landing-btn--learn').trigger('click')
    await nextTick()
    expect(wrapper.find('.stub-learn-mode').exists()).toBe(true)
  })

  it('sets activeLandingView when navigating to jam', async () => {
    const wrapper = mount(LandingPage)
    await wrapper.find('.tc-landing-btn--jam').trigger('click')
    await nextTick()
    expect(activeLandingView.value).toBe('jam')
  })

  it('watcher clears requestedLandingView after processing', async () => {
    mount(LandingPage)
    requestedLandingView.value = 'jam'
    await flushPromises()
    await nextTick()
    // The watcher consumes the request and resets to null
    expect(requestedLandingView.value).toBeNull()
    // activeLandingView reflects the navigation
    expect(activeLandingView.value).toBe('jam')
  })
})
