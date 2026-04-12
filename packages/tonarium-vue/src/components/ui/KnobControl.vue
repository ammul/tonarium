<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 1,
  step: 0.05,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// -135deg (min) to +135deg (max), 270deg total sweep
const angle = computed(() => {
  const pct = (props.modelValue - props.min) / (props.max - props.min)
  return -135 + pct * 270
})

const percent = computed(() =>
  Math.round(((props.modelValue - props.min) / (props.max - props.min)) * 100)
)

let _startY: number | null = null
let _startVal: number | null = null

function clamp(v: number): number {
  return Math.min(props.max, Math.max(props.min, v))
}

function onPointerDown(e: PointerEvent): void {
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  _startY = e.clientY
  _startVal = props.modelValue
}

function onPointerMove(e: PointerEvent): void {
  if (_startY === null || _startVal === null) return
  const dy = _startY - e.clientY
  const range = props.max - props.min
  const raw = clamp(_startVal + (dy / 120) * range)
  const val = parseFloat((Math.round(raw / props.step) * props.step).toFixed(4))
  emit('update:modelValue', clamp(val))
}

function onPointerUp(): void {
  _startY = _startVal = null
}
</script>

<template>
  <div class="tc-knob">
    <div
      class="tc-knob-dial"
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
      <div class="tc-knob-dot"></div>
    </div>
    <span class="tc-knob-label">{{ label }}</span>
    <span class="tc-knob-value">{{ percent }}%</span>
  </div>
</template>

<style scoped>
.tc-knob {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.tc-knob-dial {
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

.tc-knob-dial:hover { border-color: var(--accent-mid); }

.tc-knob-dot {
  position: absolute;
  bottom: 0.22rem;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 0.5rem;
  background: var(--accent);
  border-radius: 2px;
}

.tc-knob-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text4);
}

.tc-knob-value {
  font-size: 0.6rem;
  color: var(--text4);
}
</style>
