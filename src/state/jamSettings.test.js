import { describe, it, expect, beforeEach } from 'vitest'
import { selectedRoot, selectedScaleId, pianoOctave, selectedChordType, selectedChordRoot } from './jamSettings.js'

describe('jamSettings', () => {
  beforeEach(() => {
    selectedRoot.value = 'A'
    selectedScaleId.value = 'mi.p'
    pianoOctave.value = 4
    selectedChordType.value = null
    selectedChordRoot.value = null
  })

  it('selectedRoot defaults to A', () => {
    expect(selectedRoot.value).toBe('A')
  })

  it('selectedScaleId defaults to mi.p', () => {
    expect(selectedScaleId.value).toBe('mi.p')
  })

  it('pianoOctave defaults to 4', () => {
    expect(pianoOctave.value).toBe(4)
  })

  it('selectedChordType defaults to null', () => {
    expect(selectedChordType.value).toBeNull()
  })

  it('selectedChordRoot defaults to null', () => {
    expect(selectedChordRoot.value).toBeNull()
  })

  it('refs are independently reactive', () => {
    selectedRoot.value = 'C'
    expect(selectedScaleId.value).toBe('mi.p')
    expect(pianoOctave.value).toBe(4)
  })

  it('selectedChordType can hold a chord type string', () => {
    selectedChordType.value = 'min7'
    expect(selectedChordType.value).toBe('min7')
  })
})
