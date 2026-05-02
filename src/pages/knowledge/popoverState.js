import { ref } from 'vue'

export const popoverTerm   = ref(null)
export const popoverAnchor = ref(null)

export function openPopover(termId, anchorEl) {
  popoverTerm.value = termId
  popoverAnchor.value = anchorEl?.getBoundingClientRect?.() ?? null
}

export function closePopover() {
  popoverTerm.value = null
  popoverAnchor.value = null
}
