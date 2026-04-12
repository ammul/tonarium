<script setup lang="ts">
interface Props {
  label: string
}

defineProps<Props>()
</script>

<template>
  <div class="tc-picker-row">
    <span class="tc-picker-row-label">{{ label }}</span>
    <div class="tc-picker-row-control">
      <slot />
    </div>
  </div>
</template>
