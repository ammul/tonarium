<script setup>
defineProps({ title: { type: String, default: '' } })
</script>

<template>
  <header class="lesson-intro">
    <h2 v-if="title" class="lesson-intro-title">{{ title }}</h2>
    <p class="step-intro">
      <slot />
    </p>
  </header>
</template>

<style scoped>
.lesson-intro {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lesson-intro-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  letter-spacing: 0.01em;
}
</style>
