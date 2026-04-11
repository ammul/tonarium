<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min:        { type: Number, default: 0 },
  max:        { type: Number, default: 1 },
  step:       { type: Number, default: 0.05 },
  label:      { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

// -135deg (min) to +135deg (max), 270deg total sweep
const angle = computed(() => {
  const pct = (props.modelValue - props.min) / (props.max - props.min)
  return -135 + pct * 270
})

const percent = computed(() =>
  Math.round(((props.modelValue - props.min) / (props.max - props.min)) * 100)
)

let _startY   = null
let _startVal = null

function clamp(v) {
  return Math.min(props.max, Math.max(props.min, v))
}

function onPointerDown(e) {
  e.currentTarget.setPointerCapture(e.pointerId)
  _startY   = e.clientY
  _startVal = props.modelValue
}

function onPointerMove(e) {
  if (_startY === null) return
  const dy    = _startY - e.clientY          // drag up = increase
  const range = props.max - props.min
  const raw   = clamp(_startVal + (dy / 120) * range)
  const val   = parseFloat((Math.round(raw / props.step) * props.step).toFixed(4))
  emit('update:modelValue', clamp(val))
}

function onPointerUp() {
  _startY = _startVal = null
}
</script>

<template>
  <div class="knob-wrap">
    <div
      class="knob"
      :style="{ '--angle': angle + 'deg' }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      role="slider"
      :aria-valuenow="modelValue"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-label="label"
    >
      <div class="knob-dot"></div>
    </div>
    <span class="knob-label">{{ label }}</span>
    <span class="knob-value">{{ percent }}%</span>
  </div>
</template>

<style scoped>
.knob-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.knob {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background: var(--input);
  border: 1.5px solid var(--border2);
  position: relative;
  transform: rotate(var(--angle));
  transition: border-color 0.15s;
  touch-action: none;
  user-select: none;
  cursor: ns-resize;
}

.knob:hover { border-color: var(--accent-mid); }

.knob-dot {
  position: absolute;
  bottom: 0.22rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 0.5rem;
  background: var(--accent);
  border-radius: 2px;
}

.knob-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text4);
}

.knob-value {
  font-size: 0.6rem;
  color: var(--text4);
}
</style>
