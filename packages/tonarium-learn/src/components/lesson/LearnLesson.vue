<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { LEARN_LESSON_IDS, markLessonComplete } from '../../state/learnProgress.js'

const props = defineProps({
  id: { type: String, required: true },
})

if (!LEARN_LESSON_IDS.includes(props.id)) {
  console.warn(`[LearnLesson] unknown lesson id: ${props.id}`)
}

const sentinel = ref(null)
let observer = null

onMounted(() => {
  if (!sentinel.value || typeof IntersectionObserver === 'undefined') {
    markLessonComplete(props.id)
    return
  }
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        markLessonComplete(props.id)
        observer?.disconnect()
        observer = null
        break
      }
    }
  }, { threshold: 0.1 })
  observer.observe(sentinel.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div class="learn-lesson step-content">
    <slot />
    <div ref="sentinel" class="learn-lesson-sentinel" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.learn-lesson-sentinel {
  height: 1px;
  width: 100%;
  pointer-events: none;
}
</style>
