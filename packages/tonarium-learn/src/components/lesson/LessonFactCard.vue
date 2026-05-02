<script setup>
defineProps({ heading: { type: String, required: true } })
</script>

<template>
  <div class="lesson-fact-card card card-sm">
    <span class="lesson-fact-heading">{{ heading }}</span>
    <span class="lesson-fact-body">
      <slot />
    </span>
  </div>
</template>

<style scoped>
.lesson-fact-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.lesson-fact-heading {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.lesson-fact-body {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
}
</style>
