import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PianoOctave from './PianoOctave.vue'

describe('PianoOctave', () => {
  const defaultProps = {
    activeIndices: new Set([0, 2, 4]),
    rootIndex: 0,
    octave: 4,
  }

  it('renders white and black keys', () => {
    const w = mount(PianoOctave, { props: defaultProps })
    expect(w.findAll('.white-key').length).toBe(7)
    expect(w.findAll('.black-key').length).toBe(5)
  })

  it('highlights active keys', () => {
    const w = mount(PianoOctave, { props: defaultProps })
    const active = w.findAll('.white-key.active, .black-key.active')
    expect(active.length).toBeGreaterThan(0)
  })

  it('marks root key', () => {
    const w = mount(PianoOctave, { props: defaultProps })
    const root = w.findAll('.white-key.root, .black-key.root')
    expect(root.length).toBe(1)
  })

  it('shows octave selector by default', () => {
    const w = mount(PianoOctave, { props: defaultProps })
    expect(w.find('.octave-ctl').exists()).toBe(true)
  })

  it('hides octave selector when showOctaveSelector is false', () => {
    const w = mount(PianoOctave, { props: { ...defaultProps, showOctaveSelector: false } })
    expect(w.find('.octave-ctl').exists()).toBe(false)
  })

  it('emits notedown on pointerdown when clickable', async () => {
    const w = mount(PianoOctave, { props: { ...defaultProps, clickable: true } })
    await w.find('.white-key').trigger('pointerdown')
    expect(w.emitted('notedown')).toBeTruthy()
  })

  it('emits noteup on pointerup when clickable', async () => {
    const w = mount(PianoOctave, { props: { ...defaultProps, clickable: true } })
    await w.find('.white-key').trigger('pointerup')
    expect(w.emitted('noteup')).toBeTruthy()
  })

  it('does not emit notedown when not clickable', async () => {
    const w = mount(PianoOctave, { props: { ...defaultProps, clickable: false } })
    await w.find('.white-key').trigger('pointerdown')
    expect(w.emitted('notedown')).toBeFalsy()
  })
})
