<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  small?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  small: false,
})
</script>

<template>
  <div class="card" :class="{ 'card-sm': small }">
    <div v-if="$slots.header || title" class="tc-card-header">
      <slot name="header">
        <div>
          <div v-if="title" class="tc-card-title">{{ title }}</div>
          <div v-if="subtitle" class="tc-card-subtitle">{{ subtitle }}</div>
        </div>
      </slot>
    </div>
    <div class="tc-card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="tc-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.tc-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.tc-card-title {
  font-size: var(--text-md);
  font-weight: var(--font-bold);
  color: var(--accent);
}

.tc-card-subtitle {
  font-size: var(--text-sm);
  color: var(--text3);
}

.tc-card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.tc-card-footer {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}
</style>
