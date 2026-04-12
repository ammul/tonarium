<script setup>
import { ref, computed } from 'vue'
import ProgressionCard from './ProgressionCard.vue'

const props = defineProps({
  title: { type: String, required: true },
  progressions: { type: Array, required: true },
  rootNote: { type: String, required: true },
  expandedId: { type: String, default: null },
  playingId: { type: String, default: null },
})

defineEmits(['toggle-expand', 'play', 'stop', 'jam'])

const INITIAL_COUNT = 5
const showAll = ref(false)

const visibleProgressions = computed(() =>
  showAll.value ? props.progressions : props.progressions.slice(0, INITIAL_COUNT)
)

const hiddenCount = computed(() => props.progressions.length - INITIAL_COUNT)
</script>

<template>
  <section v-if="progressions.length" class="tc-prog-section">
    <h3 class="tc-prog-section-title">{{ title }}</h3>
    <div class="tc-prog-section-list">
      <ProgressionCard
        v-for="p in visibleProgressions"
        :key="p.id"
        :progression="p"
        :rootNote="rootNote"
        :isExpanded="expandedId === p.id"
        :isPlaying="playingId === p.id"
        @toggle-expand="$emit('toggle-expand', p.id)"
        @play="$emit('play', p.id)"
        @stop="$emit('stop', p.id)"
        @jam="$emit('jam', p.id)"
      />
    </div>
    <button v-if="!showAll && hiddenCount > 0" class="btn btn-xs btn-subtle tc-prog-section-show-more" @click="showAll = true">
      Show {{ hiddenCount }} more
    </button>
    <button v-else-if="showAll && progressions.length > INITIAL_COUNT" class="btn btn-xs btn-subtle tc-prog-section-show-more" @click="showAll = false">
      Show less
    </button>
  </section>
</template>

<style scoped>
.tc-prog-section {
  margin-bottom: 1.25rem;
}

.tc-prog-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text3);
  margin-bottom: 0.5rem;
  padding: 0 0.1rem;
}

.tc-prog-section-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tc-prog-section-show-more {
  margin-top: 0.4rem;
  color: var(--text3);
}
</style>
