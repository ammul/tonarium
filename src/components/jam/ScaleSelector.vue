<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  scales: { type: Array, required: true },
  showInfo: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'update:showInfo'])

const selectedScale = computed(() => props.scales.find(s => s.id === props.modelValue))

function onSelectChange(e) {
  emit('update:modelValue', e.target.value)
  emit('update:showInfo', false)
}

function toggleInfo() {
  emit('update:showInfo', !props.showInfo)
}
</script>

<script>
import { computed } from 'vue'
export default { name: 'ScaleSelector' }
</script>

<template>
  <div class="tc-scale-sel">
    <div class="tc-scale-sel-row">
      <select :value="modelValue" @change="onSelectChange" class="form-select">
        <option v-for="s in scales" :key="s.id" :value="s.id">{{ s.label }}</option>
      </select>
      <button class="btn btn-round btn-subtle tc-scale-sel-info-btn" :class="{ active: showInfo }" @click="toggleInfo" aria-label="Scale info">i</button>
    </div>
    <p v-if="showInfo && selectedScale" class="info-box tc-scale-sel-info">{{ selectedScale.description }}</p>
  </div>
</template>

<style scoped>
.tc-scale-sel-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* unique properties not covered by .btn + .btn-round + .btn-subtle */
.tc-scale-sel-info-btn {
  font-style: italic;
  font-weight: 700;
  flex-shrink: 0;
}

.tc-scale-sel-info {
  margin-top: 0.6rem;
  width: 100%;
}

.form-select {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  flex: 1;
  width: auto;
  min-width: 0;
}
</style>
