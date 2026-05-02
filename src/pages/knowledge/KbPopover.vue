<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { TERM_MAP } from './termMap.js'
import { popoverTerm, popoverAnchor, closePopover } from './popoverState.js'
import { requestedKbTerm } from '@/state/landingState.js'

const emit = defineEmits(['navigate'])

const entry = computed(() => popoverTerm.value ? TERM_MAP.get(popoverTerm.value) ?? null : null)

const dialogRef = ref(null)

const POPOVER_WIDTH = 280
const POPOVER_GAP = 8

const positionStyle = computed(() => {
  const anchor = popoverAnchor.value
  if (!anchor || typeof window === 'undefined') {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  if (window.innerWidth <= 600) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  let left = anchor.left
  if (left + POPOVER_WIDTH > window.innerWidth - POPOVER_GAP) {
    left = window.innerWidth - POPOVER_WIDTH - POPOVER_GAP
  }
  if (left < POPOVER_GAP) left = POPOVER_GAP

  let top = anchor.bottom + POPOVER_GAP
  if (top + 200 > window.innerHeight - POPOVER_GAP) {
    top = anchor.top - 200 - POPOVER_GAP
    if (top < POPOVER_GAP) top = POPOVER_GAP
  }
  return { top: `${top}px`, left: `${left}px` }
})

function handleEsc(e) {
  if (e.key === 'Escape' && popoverTerm.value) closePopover()
}

function handleOutsideClick(e) {
  if (!popoverTerm.value || !dialogRef.value) return
  if (!dialogRef.value.contains(e.target)) closePopover()
}

function handleBackdropClick() { closePopover() }

function readMore() {
  if (!popoverTerm.value) return
  requestedKbTerm.value = popoverTerm.value
  closePopover()
  emit('navigate', 'kb')
}

watch(popoverTerm, (term) => {
  if (term) {
    setTimeout(() => document.addEventListener('pointerdown', handleOutsideClick), 0)
  } else {
    document.removeEventListener('pointerdown', handleOutsideClick)
  }
})

onMounted(() => window.addEventListener('keydown', handleEsc))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEsc)
  document.removeEventListener('pointerdown', handleOutsideClick)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="popoverTerm && entry" class="kb-popover-root">
      <div class="kb-popover-backdrop" @click="handleBackdropClick" />
      <div
        ref="dialogRef"
        class="kb-popover"
        role="dialog"
        :aria-label="entry.label"
        :style="positionStyle"
      >
        <button class="kb-popover-close" type="button" aria-label="Close" @click="closePopover">×</button>
        <h3 class="kb-popover-label">{{ entry.label }}</h3>
        <p class="kb-popover-summary">{{ entry.summary }}</p>
        <button class="kb-popover-read-more" type="button" @click="readMore">
          Read more <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.kb-popover-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
  pointer-events: none;
}

.kb-popover-backdrop {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: auto;
}

.kb-popover {
  position: fixed;
  width: 280px;
  max-width: calc(100vw - 24px);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem 1rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border2);
  background: var(--surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  pointer-events: auto;
}

.kb-popover-close {
  position: absolute;
  top: 0.3rem;
  right: 0.5rem;
  width: 1.6rem;
  height: 1.6rem;
  border: none;
  background: none;
  color: var(--text4);
  font-size: 1.2rem;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px;
  line-height: 1;
}

.kb-popover-close:hover { color: var(--text2); background: var(--raised); }

.kb-popover-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
  margin: 0;
  padding-right: 1.4rem;
}

.kb-popover-summary {
  font-size: 0.85rem;
  color: var(--text2);
  line-height: 1.45;
  margin: 0;
}

.kb-popover-read-more {
  align-self: flex-start;
  padding: 0.32rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.kb-popover-read-more:hover {
  background: var(--accent);
  color: var(--on-accent);
}

@media (max-width: 600px) {
  .kb-popover-backdrop {
    background: rgba(0, 0, 0, 0.45);
  }
}
</style>
