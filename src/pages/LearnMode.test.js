import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

vi.mock('@/audio/audioEngine.js', () => ({
  playNote: vi.fn(),
  playChord: vi.fn(),
  stopAllNotes: vi.fn(),
}))

vi.mock('@/audio/drumEngine.js', async () => {
  const { ref } = await import('vue')
  return {
    isPlaying:   ref(false),
    pattern:     ref(Array.from({ length: 8 }, () => new Array(16).fill(false))),
    currentStep: ref(0),
    play:        vi.fn(),
    pause:       vi.fn(),
  }
})

import LearnMode from './LearnMode.vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { isPlaying as drumIsPlaying, pattern as drumPattern, play as drumPlay, pause as drumPause } from '@/audio/drumEngine.js'

beforeEach(async () => {
  vi.clearAllMocks()
  drumIsPlaying.value = false
  drumPattern.value = Array.from({ length: 8 }, () => new Array(16).fill(false))
})

// ── Step navigation ─────────────────────────────────────────────────────────

describe('step navigation', () => {
  it('renders 7 step buttons', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findAll('.step-btn')).toHaveLength(7)
  })

  it('step labels match the expected order', () => {
    const wrapper = mount(LearnMode)
    const labels = wrapper.findAll('.step-label').map(el => el.text())
    expect(labels).toEqual(['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats'])
  })

  it('first step is active by default', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.findAll('.step-btn')[0].classes()).toContain('active')
  })

  it('clicking a step marks it active and prior steps as done', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.findAll('.step-btn')[2].trigger('click')
    expect(wrapper.findAll('.step-btn')[2].classes()).toContain('active')
    expect(wrapper.findAll('.step-btn')[0].classes()).toContain('done')
    expect(wrapper.findAll('.step-btn')[1].classes()).toContain('done')
  })

  it('Next button advances the step', async () => {
    const wrapper = mount(LearnMode)
    await wrapper.find('.nav-btn:last-child').trigger('click')
    expect(wrapper.findAll('.step-btn')[1].classes()).toContain('active')
  })

  it('Back button is disabled on the first step', () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.find('.nav-btn').attributes('disabled')).toBeDefined()
  })

  it('step counter reflects current position', async () => {
    const wrapper = mount(LearnMode)
    expect(wrapper.find('.step-counter').text()).toBe('1 / 7')
    await wrapper.findAll('.step-btn')[3].trigger('click')
    expect(wrapper.find('.step-counter').text()).toBe('4 / 7')
  })
})

// ── Step 7: Beats ────────────────────────────────────────────────────────────

describe('Step 7: Beats', () => {
  async function goToBeats(wrapper) {
    await wrapper.findAll('.step-btn')[6].trigger('click')
  }

  it('renders 3 beat pattern cards', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    expect(wrapper.findAll('.beat-pattern')).toHaveLength(3)
  })

  it('each beat pattern has Play and Edit buttons', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    const cards = wrapper.findAll('.beat-pattern')
    for (const card of cards) {
      expect(card.find('.bp-play-btn').exists()).toBe(true)
      expect(card.find('.bp-edit-btn').exists()).toBe(true)
    }
  })

  it('loadBeat sets the drum pattern correctly for basic rock beat', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    // Basic rock: kick on 1,9 (0-indexed: 0,8); snare on 5,13 (4,12); hi-hat every other
    expect(drumPattern.value[0][0]).toBe(true)   // kick beat 1
    expect(drumPattern.value[0][8]).toBe(true)   // kick beat 3
    expect(drumPattern.value[0][4]).toBe(false)  // no kick on beat 2
    expect(drumPattern.value[1][4]).toBe(true)   // snare beat 2
    expect(drumPattern.value[1][12]).toBe(true)  // snare beat 4
    expect(drumPattern.value[3][0]).toBe(true)   // hi-hat on
    expect(drumPattern.value[3][1]).toBe(false)  // hi-hat off
    expect(drumPattern.value[3][2]).toBe(true)   // hi-hat on
  })

  it('rows 4–8 are all silent in built drum pattern', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    for (let r = 4; r < 9; r++) {
      expect(drumPattern.value[r].every(s => s === false)).toBe(true)
    }
  })

  it('loadBeat starts drum playback', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    expect(drumPlay).toHaveBeenCalled()
  })

  it('loading the same pattern twice unloads it without calling play again', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    await wrapper.findAll('.bp-play-btn')[0].trigger('click')
    expect(drumPlay).toHaveBeenCalledTimes(1)
  })

  it('navigating away from beats step pauses drums if playing', async () => {
    drumIsPlaying.value = true
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.step-btn')[0].trigger('click')
    expect(drumPause).toHaveBeenCalled()
  })

  it('editBeat emits navigate event with drums', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-edit-btn')[0].trigger('click')
    expect(wrapper.emitted('navigate')).toBeTruthy()
    expect(wrapper.emitted('navigate')[0]).toEqual(['drums'])
  })

  it('four-on-the-floor pattern has kick on all 4 beats', async () => {
    const wrapper = mount(LearnMode)
    await goToBeats(wrapper)
    await wrapper.findAll('.bp-play-btn')[1].trigger('click')
    // Four-on-the-floor: kick on steps 0, 4, 8, 12
    expect(drumPattern.value[0][0]).toBe(true)
    expect(drumPattern.value[0][4]).toBe(true)
    expect(drumPattern.value[0][8]).toBe(true)
    expect(drumPattern.value[0][12]).toBe(true)
  })
})
