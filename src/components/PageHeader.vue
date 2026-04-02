<script setup>
defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="header">
    <div class="header-text">
      <h2>{{ title }}</h2>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.header-text { flex: 1; }

h2 {
  font-size: 1.4rem;
  color: var(--accent);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: var(--text3);
}

@media (orientation: landscape) and (max-height: 500px) {
  h2 { font-size: 1.1rem; }
  .subtitle { display: none; }
}
</style>
