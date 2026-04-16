import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useScaleIndices } from './useScaleIndices.js'

const majorScale = { id: 'maj', intervals: [0, 2, 4, 5, 7, 9, 11] }
const minorPentScale = { id: 'mi.p', intervals: [0, 3, 5, 7, 10] }

describe('useScaleIndices', () => {
  it('rootIndex is the correct NOTES index for C', () => {
    const { rootIndex } = useScaleIndices(ref('C'), ref(majorScale))
    // NOTES is A-based: C is at index 3
    expect(rootIndex.value).toBe(3)
  })

  it('rootIndex is the correct NOTES index for A', () => {
    const { rootIndex } = useScaleIndices(ref('A'), ref(majorScale))
    expect(rootIndex.value).toBe(0)
  })

  it('activeIndices contains correct note indices for C major', () => {
    const { activeIndices } = useScaleIndices(ref('C'), ref(majorScale))
    // C major: C D E F G A B -> indices (A-based) 3,5,7,8,10,0,2
    const expected = new Set([3, 5, 7, 8, 10, 0, 2])
    expect(activeIndices.value).toEqual(expected)
  })

  it('activeIndices contains 5 notes for minor pentatonic', () => {
    const { activeIndices } = useScaleIndices(ref('A'), ref(minorPentScale))
    expect(activeIndices.value.size).toBe(5)
  })

  it('rootIndex is always in activeIndices', () => {
    const root = ref('D')
    const { rootIndex, activeIndices } = useScaleIndices(root, ref(majorScale))
    expect(activeIndices.value.has(rootIndex.value)).toBe(true)
  })

  it('rootIndex updates reactively when root changes', () => {
    const root = ref('A')
    const { rootIndex } = useScaleIndices(root, ref(majorScale))
    const initialIdx = rootIndex.value
    root.value = 'C'
    expect(rootIndex.value).not.toBe(initialIdx)
    expect(rootIndex.value).toBe(3)
  })

  it('activeIndices updates reactively when scale changes', () => {
    const scale = ref(majorScale)
    const { activeIndices } = useScaleIndices(ref('A'), scale)
    const majorSize = activeIndices.value.size
    scale.value = minorPentScale
    expect(activeIndices.value.size).not.toBe(majorSize)
    expect(activeIndices.value.size).toBe(5)
  })
})
