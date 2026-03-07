<script setup>
import { ref, onUnmounted } from 'vue'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function freqToNote(freq) {
  const exactMidi = 12 * Math.log2(freq / 440) + 69
  const midi = Math.round(exactMidi)
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]
  const cents = Math.round((exactMidi - midi) * 100)
  return { name, octave, cents }
}

function detectPitch(buf, sampleRate) {
  const SIZE = buf.length
  const HALF = Math.floor(SIZE / 2)

  // RMS gate — ignore silence
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  if (Math.sqrt(rms / SIZE) < 0.01) return -1

  // AMDF-style autocorrelation, normalized to [0, 1]
  let bestOffset = -1
  let bestCorr = 0
  let lastCorr = 1
  let foundGood = false
  const corrs = new Float32Array(HALF)

  for (let offset = 0; offset < HALF; offset++) {
    let diff = 0
    for (let i = 0; i < HALF; i++) diff += Math.abs(buf[i] - buf[i + offset])
    const corr = 1 - diff / HALF
    corrs[offset] = corr
    if (corr > 0.9 && corr > lastCorr) {
      foundGood = true
      if (corr > bestCorr) { bestCorr = corr; bestOffset = offset }
    } else if (foundGood) {
      break
    }
    lastCorr = corr
  }

  if (bestOffset === -1) return -1

  // Parabolic interpolation for sub-sample accuracy
  let shift = 0
  if (bestOffset > 0 && bestOffset < HALF - 1) {
    const x1 = corrs[bestOffset - 1]
    const x2 = corrs[bestOffset]
    const x3 = corrs[bestOffset + 1]
    shift = (x3 - x1) / (2 * (2 * x2 - x1 - x3))
  }

  return sampleRate / (bestOffset + shift)
}

const isListening = ref(false)
const errorMsg    = ref('')
const isSilent    = ref(true)
const noteName    = ref('—')
const noteFreq    = ref(null)
const noteCents   = ref(0)

let audioCtx  = null
let analyser  = null
let stream    = null
let rafId     = null

function tick() {
  const buf = new Float32Array(analyser.fftSize)
  analyser.getFloatTimeDomainData(buf)
  const freq = detectPitch(buf, audioCtx.sampleRate)

  if (freq > 50 && freq < 6000) {
    const note = freqToNote(freq)
    noteName.value  = note.name + note.octave
    noteFreq.value  = freq.toFixed(1)
    noteCents.value = note.cents
    isSilent.value  = false
  } else {
    isSilent.value = true
  }

  rafId = requestAnimationFrame(tick)
}

async function start() {
  errorMsg.value = ''
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    audioCtx.createMediaStreamSource(stream).connect(analyser)
    isListening.value = true
    tick()
  } catch {
    errorMsg.value = 'Microphone access denied or unavailable.'
  }
}

function stop() {
  if (rafId) cancelAnimationFrame(rafId)
  stream?.getTracks().forEach(t => t.stop())
  audioCtx?.close()
  isListening.value = false
  isSilent.value    = true
  noteName.value    = '—'
  noteFreq.value    = null
  noteCents.value   = 0
}

onUnmounted(stop)

// cents bar: map [-50, +50] → [0%, 100%]
const centsBarPos = () => `${((noteCents.value + 50) / 100) * 100}%`
</script>

<template>
  <div class="pitch-detector">

    <div class="controls">
      <button v-if="!isListening" class="btn-start" @click="start">
        Enable Microphone
      </button>
      <button v-else class="btn-stop" @click="stop">
        Stop
      </button>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>

    <div class="display" :class="{ silent: isSilent || !isListening }">
      <div class="note-name">{{ isListening ? noteName : '—' }}</div>

      <div class="freq" v-if="isListening && !isSilent">
        {{ noteFreq }} Hz
      </div>
      <div class="freq muted" v-else-if="isListening">
        listening…
      </div>

      <div class="cents-wrap" v-if="isListening && !isSilent">
        <div class="cents-bar">
          <div class="cents-track">
            <div class="cents-center-mark"></div>
            <div class="cents-dot" :style="{ left: centsBarPos() }"></div>
          </div>
        </div>
        <div class="cents-labels">
          <span>flat</span>
          <span class="cents-value">{{ noteCents > 0 ? '+' : '' }}{{ noteCents }}¢</span>
          <span>sharp</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.pitch-detector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 1rem 0;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

button {
  padding: 0.55rem 1.6rem;
  border-radius: 8px;
  border: 1px solid #4a4030;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.btn-start {
  background: #2e2820;
  color: #c8a96e;
}
.btn-start:hover {
  background: #3e3828;
  border-color: #c8a96e;
}

.btn-stop {
  background: #3a1a1a;
  color: #e87070;
  border-color: #6a3030;
}
.btn-stop:hover {
  background: #4a2020;
}

.error {
  color: #e87070;
  font-size: 0.85rem;
}

/* ── Main display ── */
.display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 220px;
  justify-content: center;
  transition: opacity 0.2s;
}

.display.silent {
  opacity: 0.35;
}

.note-name {
  font-size: clamp(4rem, 20vw, 8rem);
  font-weight: 700;
  color: #c8a96e;
  letter-spacing: 0.04em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
  text-align: center;
}

.freq {
  font-size: 1.2rem;
  color: #a89070;
  letter-spacing: 0.08em;
}
.freq.muted {
  color: #5a5040;
  font-size: 0.9rem;
}

/* ── Cents bar ── */
.cents-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  width: 260px;
}

.cents-bar {
  width: 100%;
}

.cents-track {
  position: relative;
  height: 6px;
  background: #2a2418;
  border-radius: 3px;
  border: 1px solid #3a3228;
}

.cents-center-mark {
  position: absolute;
  left: 50%;
  top: -3px;
  width: 2px;
  height: 12px;
  background: #4a4030;
  transform: translateX(-50%);
  border-radius: 1px;
}

.cents-dot {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: #c8a96e;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.08s ease-out;
  box-shadow: 0 0 6px rgba(200, 169, 110, 0.5);
}

.cents-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.7rem;
  color: #5a5040;
  letter-spacing: 0.06em;
}

.cents-value {
  color: #8a7860;
  font-variant-numeric: tabular-nums;
}
</style>
