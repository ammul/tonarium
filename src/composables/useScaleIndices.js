import { computed } from 'vue'
import { NOTES } from '@tonarium/core'

/**
 * Derives rootIndex and activeIndices from reactive root/scale refs.
 * @param {import('vue').Ref<string>} selectedRoot - e.g. ref('C')
 * @param {import('vue').Ref<{intervals: number[]}>} selectedScale - scale object with intervals array
 */
export function useScaleIndices(selectedRoot, selectedScale) {
  const rootIndex = computed(() => NOTES.indexOf(selectedRoot.value))

  const activeIndices = computed(() => {
    const root = rootIndex.value
    return new Set(selectedScale.value.intervals.map(i => (root + i) % 12))
  })

  return { rootIndex, activeIndices }
}
