<script setup>
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 7 },
})

const emit = defineEmits(['update:modelValue'])

function decrement() {
  if (props.modelValue > props.min) emit('update:modelValue', props.modelValue - 1)
}

function increment() {
  if (props.modelValue < props.max) emit('update:modelValue', props.modelValue + 1)
}
</script>

<script>
export default { name: 'OctaveControl' }
</script>

<template>
  <div class="octave-control">
    <button class="btn btn-round octave-btn" :disabled="modelValue <= min" @click="decrement" aria-label="Octave down">−</button>
    <span class="octave-value">{{ modelValue }}</span>
    <button class="btn btn-round octave-btn" :disabled="modelValue >= max" @click="increment" aria-label="Octave up">+</button>
  </div>
</template>

<style scoped>
.octave-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* unique properties not covered by .btn + .btn-round */
.octave-btn {
  background: var(--input);
  color: var(--text);
  font-size: 1rem;
  font-weight: 700;
}

.octave-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  min-width: 1.2rem;
  text-align: center;
}
</style>
