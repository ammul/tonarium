<script setup>
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
  <div class="scale-selector">
    <div class="scale-select-row">
      <select :value="modelValue" @change="onSelectChange" class="form-select">
        <option v-for="s in scales" :key="s.id" :value="s.id">{{ s.label }}</option>
      </select>
      <button class="btn btn-round btn-subtle info-btn" :class="{ active: showInfo }" @click="toggleInfo" aria-label="Scale info">i</button>
    </div>
    <p v-if="showInfo && selectedScale" class="scale-info">{{ selectedScale.description }}</p>
  </div>
</template>

<style scoped>
.scale-select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* unique properties not covered by .btn + .btn-round + .btn-subtle */
.info-btn {
  font-style: italic;
  font-weight: 700;
  flex-shrink: 0;
}

.scale-info {
  margin-top: 0.6rem;
  padding: 0.65rem 0.85rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--text2);
  line-height: 1.55;
  width: 100%;
}

.form-select {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}
</style>
