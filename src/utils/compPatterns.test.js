import { describe, it, expect } from 'vitest'
import { getCompHit } from './compPatterns.js'

const all4 = [0, 1, 2, 3]

function trigger(pattern, beatsPerChord, noteCount = 4) {
  const total = beatsPerChord * 4
  const out = []
  for (let s = 0; s < total; s++) {
    if (getCompHit(pattern, s, beatsPerChord, noteCount).length > 0) out.push(s)
  }
  return out
}

describe('getCompHit', () => {
  it('returns empty for zero-note chords', () => {
    expect(getCompHit('block', 0, 4, 0)).toEqual([])
    expect(getCompHit('arp', 0, 4, 0)).toEqual([])
  })

  it('block triggers all notes only at step 0', () => {
    expect(getCompHit('block', 0, 4, 4)).toEqual(all4)
    expect(trigger('block', 4)).toEqual([0])
    expect(trigger('block', 2)).toEqual([0])
  })

  it('offbeat triggers all notes on beats 2 and 4 (steps 4, 12) at beatsPerChord=4', () => {
    expect(trigger('offbeat', 4)).toEqual([4, 12])
    expect(getCompHit('offbeat', 4, 4, 4)).toEqual(all4)
  })

  it('offbeat at beatsPerChord=2 triggers on step 4 only', () => {
    expect(trigger('offbeat', 2)).toEqual([4])
  })

  it('offbeat at beatsPerChord=1 collapses to step 0', () => {
    expect(trigger('offbeat', 1)).toEqual([0])
  })

  it('arp triggers one staggered note per beat', () => {
    expect(trigger('arp', 4)).toEqual([0, 4, 8, 12])
    expect(getCompHit('arp', 0, 4, 4)).toEqual([0])
    expect(getCompHit('arp', 4, 4, 4)).toEqual([1])
    expect(getCompHit('arp', 8, 4, 4)).toEqual([2])
    expect(getCompHit('arp', 12, 4, 4)).toEqual([3])
  })

  it('arp wraps around chord notes when more beats than notes', () => {
    expect(getCompHit('arp', 12, 4, 3)).toEqual([0])
  })

  it('waltz plays root at step 0 then upper notes on subsequent beats', () => {
    expect(getCompHit('waltz', 0, 4, 4)).toEqual([0])
    expect(getCompHit('waltz', 4, 4, 4)).toEqual([1, 2, 3])
    expect(getCompHit('waltz', 8, 4, 4)).toEqual([1, 2, 3])
    expect(getCompHit('waltz', 12, 4, 4)).toEqual([1, 2, 3])
    expect(trigger('waltz', 4)).toEqual([0, 4, 8, 12])
  })

  it('waltz with single-note chord falls back to all', () => {
    expect(getCompHit('waltz', 4, 4, 1)).toEqual([0])
  })

  it('waltz at beatsPerChord<2 collapses to step 0', () => {
    expect(trigger('waltz', 1)).toEqual([0])
  })
})
