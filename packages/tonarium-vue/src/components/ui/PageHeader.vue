<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
})
</script>

<template>
  <div class="tc-page-header">
    <div class="tc-page-header-content">
      <h2 class="tc-page-header-title">{{ title }}</h2>
      <p v-if="subtitle" class="tc-page-header-subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="tc-page-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>
