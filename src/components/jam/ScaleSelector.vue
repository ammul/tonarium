<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  scales: { type: Array, required: true },
})

const emit = defineEmits(['update:modelValue'])

const selectedScale = computed(() => props.scales.find(s => s.id === props.modelValue))

function onSelectChange(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<script>
import { computed } from 'vue'
export default { name: 'ScaleSelector' }
</script>

<template>
  <div class="tc-scale-sel">
    <select :value="modelValue" @change="onSelectChange" class="form-select">
      <option v-for="s in scales" :key="s.id" :value="s.id">{{ s.label }}</option>
    </select>
  </div>
</template>

<style scoped>
.form-select {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  flex: 1;
  width: auto;
  min-width: 0;
}
</style>
