<script setup>
defineProps({ title: { type: String, default: '' } })
</script>

<template>
  <section class="lesson-section">
    <h3 v-if="title" class="lesson-section-title">{{ title }}</h3>
    <div class="lesson-section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.lesson-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.lesson-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
  margin: 0;
}

.lesson-section-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
