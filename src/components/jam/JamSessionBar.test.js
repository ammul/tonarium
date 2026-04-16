import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  startNote: vi.fn(), stopNote: vi.fn(), playNote: vi.fn(),
}))

vi.mock('@/audio/midiManager.js', async () => {
  const { ref } = await import('vue')
  return { midiStatus: ref('idle'), activeInputNotes: ref(new Set()) }
})

vi.mock('@/audio/transportClock.js', () => ({
  startTransport: vi.fn(),
  stopTransport:  vi.fn(),
}))

vi.mock('@/audio/drumEngine.js', async () => {
  const { ref } = await import('vue')
  return {
    pattern:      ref(Array.from({ length: 9 }, () => Array(16).fill(false))),
    isPlaying:    ref(false),
    currentStep:  ref(0),
    clearPattern: vi.fn(),
    toggleCell:   vi.fn(),
    INSTRUMENTS:  ['Kick', 'Snare', 'Hi-hat'],
  }
})

import JamSessionBar from './JamSessionBar.vue'
import { sessionBpm, sessionPlaying, sessionProgression, sessionBeatIdx } from '@/state/sessionState.js'

beforeEach(() => {
  sessionBpm.value       = 120
  sessionPlaying.value   = false
  sessionProgression.value = null
  sessionBeatIdx.value   = null
})

describe('JamSessionBar', () => {
  it('renders without errors', () => {
    const wrapper = mount(JamSessionBar)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the Quick Jam title', () => {
    const wrapper = mount(JamSessionBar)
    expect(wrapper.find('.tc-jam-bar-title').text()).toBe('Quick Jam')
  })

  it('renders vibe preset buttons', () => {
    const wrapper = mount(JamSessionBar)
    const btns = wrapper.findAll('.tc-jam-bar-preset-btn')
    expect(btns.length).toBeGreaterThan(0)
  })

  it('renders Notes and Rhythm panel toggles', () => {
    const wrapper = mount(JamSessionBar)
    const toggles = wrapper.findAll('.tc-jam-bar-panel-toggle')
    const labels = toggles.map(t => t.find('.tc-jam-bar-panel-name').text())
    expect(labels).toContain('Notes')
    expect(labels).toContain('Rhythm')
  })

  it('clicking a preset activates it', async () => {
    const wrapper = mount(JamSessionBar)
    const firstPreset = wrapper.find('.tc-jam-bar-preset-btn')
    await firstPreset.trigger('click')
    expect(firstPreset.classes()).toContain('active')
  })

  it('BPM input reflects sessionBpm', async () => {
    const wrapper = mount(JamSessionBar)
    const rhythmToggle = wrapper.findAll('.tc-jam-bar-panel-toggle')[1]
    await rhythmToggle.trigger('click')
    await nextTick()
    const bpmInput = wrapper.find('.tc-jam-bar-bpm-input')
    expect(bpmInput.exists()).toBe(true)
    expect(Number(bpmInput.element.value)).toBe(120)
  })

  it('changing BPM input updates sessionBpm', async () => {
    const wrapper = mount(JamSessionBar)
    const rhythmToggle = wrapper.findAll('.tc-jam-bar-panel-toggle')[1]
    await rhythmToggle.trigger('click')
    await nextTick()
    const bpmInput = wrapper.find('.tc-jam-bar-bpm-input')
    await bpmInput.setValue(140)
    expect(sessionBpm.value).toBe(140)
  })
})
