import { describe, it, expect, beforeEach, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioContext.js', () => ({
  getCtx: vi.fn(() => ({
    state: 'running', currentTime: 0, resume: vi.fn(), sampleRate: 44100,
    createOscillator: vi.fn(() => ({
      type: '', frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), value: 0 },
      connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() },
      connect: vi.fn(),
    })),
    createBuffer: vi.fn(() => ({ getChannelData: vi.fn(() => new Float32Array(1)) })),
    createBufferSource: vi.fn(() => ({ buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() })),
    createBiquadFilter: vi.fn(() => ({ type: '', frequency: { value: 0 }, Q: { value: 0 }, connect: vi.fn() })),
    createDynamicsCompressor: vi.fn(() => ({
      threshold: { value: 0 }, knee: { value: 0 }, ratio: { value: 0 },
      attack: { value: 0 }, release: { value: 0 }, connect: vi.fn(),
    })),
    destination: {},
  })),
  getCompressor: vi.fn(() => ({ connect: vi.fn() })),
  getJamDest:  vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn() })),
  getBeatDest: vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn() })),
  getProgDest: vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn() })),
}))

vi.mock('@/audio/midiManager.js', async () => {
  const { ref } = await import('vue')
  return {
    midiStatus: ref('unavailable'),
    midiOutputs: ref([]),
    selectedOutputId: ref(null),
    initMidi: vi.fn(),
    disconnectMidi: vi.fn(),
    chordOn: vi.fn(),
    chordOff: vi.fn(),
    activeInputNotes: ref(new Set()),
  }
})

import App from './App.vue'
import { isPlaying as drumIsPlaying } from '@/audio/drumEngine.js'

beforeEach(() => {
  drumIsPlaying.value = false
})

// ── Navigation ───────────────────────────────────────────────────────────────

describe('navigation', () => {
  it('renders burger button', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.find('.burger-btn').exists()).toBe(true)
  })

  it('no desktop tab bar', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.find('.desktop-tabs').exists()).toBe(false)
  })

  it('burger opens side menu', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.burger-btn').trigger('click')
    expect(wrapper.find('.side-menu').classes()).toContain('open')
  })

  it('closing side menu after tab select', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.burger-btn').trigger('click')
    const menuItems = wrapper.findAll('.side-menu button').filter(b => b.text())
    await menuItems[0].trigger('click')
    expect(wrapper.find('.side-menu').classes()).not.toContain('open')
  })
})

// ── Drum widget ──────────────────────────────────────────────────────────────

describe('drum widget', () => {
  it('is hidden before drums have ever played', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.find('.drum-widget').exists()).toBe(false)
  })

  it('appears after drumIsPlaying becomes true', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    expect(wrapper.find('.drum-widget').exists()).toBe(true)
    drumIsPlaying.value = false
    await nextTick()
    expect(wrapper.find('.drum-widget').exists()).toBe(true)
  })

  it('has playing class when drums are playing', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    expect(wrapper.find('.drum-widget').classes()).toContain('playing')
  })

  it('loses playing class when drums stop', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    drumIsPlaying.value = false
    await nextTick()
    expect(wrapper.find('.drum-widget').classes()).not.toContain('playing')
  })

  it('dw-btn aria-label is Play drums when stopped', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    drumIsPlaying.value = false
    await nextTick()
    expect(wrapper.find('.dw-btn').attributes('aria-label')).toBe('Play drums')
  })

  it('dw-btn aria-label is Pause drums when playing', async () => {
    const wrapper = shallowMount(App)
    drumIsPlaying.value = true
    await nextTick()
    expect(wrapper.find('.dw-btn').attributes('aria-label')).toBe('Pause drums')
  })
})

// ── Tab switching & settings ─────────────────────────────────────────────────

describe('tab switching', () => {
  it('opening settings via gear and closing returns to previous page', async () => {
    const wrapper = shallowMount(App)
    // Navigate to Drum Computer via burger menu
    await wrapper.find('.burger-btn').trigger('click')
    const drumsBtn = wrapper.findAll('.side-menu button').find(b => b.text() === 'Drum Computer')
    await drumsBtn.trigger('click')
    // Open settings via icon button
    await wrapper.find('.icon-btn').trigger('click')
    expect(wrapper.vm.activeTab).toBe('settings')
    // Close settings
    await wrapper.find('.icon-btn').trigger('click')
    expect(wrapper.vm.activeTab).toBe('drums')
  })
})

// ── SPA history ──────────────────────────────────────────────────────────────

describe('SPA history (handlePopState)', () => {
  it('navigates to drums tab from popstate event', async () => {
    const wrapper = shallowMount(App)
    const event = new PopStateEvent('popstate', { state: { tab: 'drums' } })
    window.dispatchEvent(event)
    await nextTick()
    expect(wrapper.vm.activeTab).toBe('drums')
  })

  it('navigates to chords tab from popstate event', async () => {
    const wrapper = shallowMount(App)
    const event = new PopStateEvent('popstate', { state: { tab: 'chords' } })
    window.dispatchEvent(event)
    await nextTick()
    expect(wrapper.vm.activeTab).toBe('chords')
  })

  it('ignores popstate for unknown tab ids', async () => {
    const wrapper = shallowMount(App)
    const event = new PopStateEvent('popstate', { state: { tab: 'nonexistent' } })
    window.dispatchEvent(event)
    await nextTick()
    expect(wrapper.vm.activeTab).toBe('home')
  })

  it('ignores popstate with no state', async () => {
    const wrapper = shallowMount(App)
    const event = new PopStateEvent('popstate', { state: null })
    window.dispatchEvent(event)
    await nextTick()
    expect(wrapper.vm.activeTab).toBe('home')
  })
})
