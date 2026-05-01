<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import JamInstrument from '@/components/jam/JamInstrument.vue'
import { NOTES, CHORD_SUFFIX, ALL_PROGRESSIONS, BEAT_PATTERNS, JAM_SCALES as SCALES } from '@tonarium/core'
import { pattern as drumPattern } from '@/audio/drumEngine.js'
import { buildPatternFromBeat } from '@/utils/beatUtils.js'
import {
  sessionProgression, sessionBpm, sessionBeatsPerChord,
  sessionPlaying, sessionCurrentChordIdx, sessionBeatIdx, sessionKey,
} from '@/state/sessionState.js'
import { startTransport, stopTransport, currentDrumStep } from '@/audio/transportClock.js'
import { selectedRoot, selectedScaleId, pianoOctave } from '@/state/jamSettings.js'
import { Play, Square } from 'lucide-vue-next'

// ── Presets (mirrors JamSessionBar) ──────────────────────────────────────────

const PRESETS = [
  { label: 'Pop',     key: 'C', scaleId: 'ma.p', progressionId: 'pop-1',    beatIdx: 0  },
  { label: 'Blues',   key: 'A', scaleId: 'mi.p', progressionId: 'blues-4',  beatIdx: 3  },
  { label: 'Funk',    key: 'A', scaleId: 'dor',  progressionId: 'soul-5',   beatIdx: 4  },
  { label: 'Hip-hop', key: 'A', scaleId: 'mi.p', progressionId: 'pop-6',    beatIdx: 5  },
  { label: 'Bossa',   key: 'C', scaleId: 'ma.p', progressionId: 'latin-1',  beatIdx: 7  },
  { label: 'Reggae',  key: 'G', scaleId: 'ma.p', progressionId: 'reggae-1', beatIdx: 6  },
  { label: 'Jazz',    key: 'F', scaleId: 'mix',  progressionId: 'jazz-2',   beatIdx: 14 },
  { label: 'Rock',    key: 'E', scaleId: 'mix',  progressionId: 'rock-4',   beatIdx: 0  },
]

const activePreset = ref(null)

function buildChords(prog, key) {
  const ri = NOTES.indexOf(key)
  return prog.chords.map(c => ({
    ...c,
    _rootIdx: (ri + c.degree) % 12,
    _octave: pianoOctave.value,
  }))
}

function applyBeat(idx) {
  sessionBeatIdx.value = idx
  drumPattern.value = buildPatternFromBeat(idx)
  sessionBpm.value = BEAT_PATTERNS[idx].bpm
}

function applyPreset(p) {
  if (sessionPlaying.value) stopTransport()
  activePreset.value = p
  selectedRoot.value = p.key
  applyBeat(p.beatIdx)
  selectedScaleId.value = p.scaleId
  const prog = ALL_PROGRESSIONS.find(x => x.id === p.progressionId)
  if (prog) {
    sessionProgression.value = { ...prog, chords: buildChords(prog, p.key) }
  }
}

function toggleTransport() {
  sessionPlaying.value ? stopTransport() : startTransport()
}

function onKeyChange() {
  if (sessionPlaying.value) stopTransport()
  if (!sessionProgression.value) return
  sessionProgression.value = {
    ...sessionProgression.value,
    chords: buildChords(sessionProgression.value, selectedRoot.value),
  }
}

function setBeatsPerChord(n) {
  if (sessionPlaying.value) stopTransport()
  sessionBeatsPerChord.value = n
}

// ── Chord helpers ─────────────────────────────────────────────────────────────

const canPlay  = computed(() => sessionProgression.value !== null || sessionBeatIdx.value !== null)
const chords   = computed(() => sessionProgression.value?.chords ?? [])

function chordLabel(chord) {
  return NOTES[chord._rootIdx] + (CHORD_SUFFIX[chord.type] ?? '')
}

const currentChordName = computed(() => {
  const c = chords.value[sessionCurrentChordIdx.value]
  return c ? chordLabel(c) : ''
})

// ── Wheel geometry ────────────────────────────────────────────────────────────

const WS = 300           // wheel SVG size (px)
const r  = WS / 2 - 30  // ring radius = 120
const cx = WS / 2
const cy = WS / 2

const nodePositions = computed(() => {
  const N = chords.value.length
  if (N === 0) return []
  const segDeg = 360 / N
  return chords.value.map((chord, i) => {
    const a   = -90 + segDeg * i
    const rad = (a * Math.PI) / 180
    return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r, chord, i }
  })
})

const beatTicks = computed(() =>
  Array.from({ length: 16 }, (_, i) => {
    const a   = -90 + (i / 16) * 360
    const rad = (a * Math.PI) / 180
    const major = i % 4 === 0
    return {
      x1: cx + Math.cos(rad) * (r + 2),
      y1: cy + Math.sin(rad) * (r + 2),
      x2: cx + Math.cos(rad) * (r + (major ? 13 : 7)),
      y2: cy + Math.sin(rad) * (r + (major ? 13 : 7)),
      major, i,
    }
  })
)

// ── Animation ─────────────────────────────────────────────────────────────────

const tSec       = ref(0)
const pulses     = ref([])
const poppingIdx = ref(-1)
let rafId = 0
let t0    = 0

watch(sessionPlaying, playing => {
  if (playing) {
    const countIn = 4 * (60 / sessionBpm.value)
    t0 = performance.now() + countIn * 1000
    tSec.value = 0
    pulses.value = []
    startRAF()
  } else {
    stopRAF()
    tSec.value = 0
  }
})

function startRAF() {
  const loop = (now) => {
    tSec.value = Math.max(0, (now - t0) / 1000)
    rafId = requestAnimationFrame(loop)
  }
  rafId = requestAnimationFrame(loop)
}

function stopRAF() { cancelAnimationFrame(rafId); rafId = 0 }
onUnmounted(stopRAF)

// Indicator sweeps around the ring, advancing one chord-segment per beatsPerChord beats
const indicatorAngle = computed(() => {
  const N = chords.value.length
  if (N === 0) return -90
  const segDeg = 360 / N
  const base   = -90 + sessionCurrentChordIdx.value * segDeg
  if (!sessionPlaying.value) return base
  const bar = (tSec.value * sessionBpm.value / 60) % sessionBeatsPerChord.value
  return base + (bar / sessionBeatsPerChord.value) * segDeg
})

const tipPos = computed(() => {
  const rad = (indicatorAngle.value * Math.PI) / 180
  return { x: cx + Math.cos(rad) * (r - 4), y: cy + Math.sin(rad) * (r - 4) }
})

// Emit a ripple on kick, snare, or downbeat when nothing is programmed
let lastPulseStep = -1
watch(currentDrumStep, step => {
  if (!sessionPlaying.value || step === lastPulseStep) return
  lastPulseStep = step
  const kick  = drumPattern.value[0]?.[step]
  const snare = drumPattern.value[1]?.[step]
  let kind = kick ? 'kick' : snare ? 'snare' : null
  if (!kind && step === 0) {
    const hasK = drumPattern.value[0]?.some(Boolean)
    const hasS = drumPattern.value[1]?.some(Boolean)
    if (!hasK && !hasS) kind = 'one'
  }
  if (!kind) return
  const id = performance.now() + Math.random()
  pulses.value.push({ id, kind })
  setTimeout(() => { pulses.value = pulses.value.filter(p => p.id !== id) }, 1200)
})

// Pop the node that just became active
watch(sessionCurrentChordIdx, idx => {
  poppingIdx.value = idx
  setTimeout(() => { poppingIdx.value = -1 }, 320)
})

// Keep selectedRoot in sync with sessionKey set externally
watch(sessionKey, key => {
  if (key && key !== selectedRoot.value) selectedRoot.value = key
})

onMounted(() => {
  if (sessionBeatIdx.value !== null) drumPattern.value = buildPatternFromBeat(sessionBeatIdx.value)
  if (sessionKey.value && sessionKey.value !== selectedRoot.value) selectedRoot.value = sessionKey.value
  if (!sessionProgression.value) {
    applyPreset(PRESETS[0])
  } else {
    activePreset.value = PRESETS.find(p => sessionProgression.value?.id === p.progressionId) ?? null
  }
})

// Beat strip rows (kick=0, snare=1)
const kickRow  = computed(() => drumPattern.value[0] ?? new Array(16).fill(false))
const snareRow = computed(() => drumPattern.value[1] ?? new Array(16).fill(false))
</script>

<template>
  <div class="qj2">

    <!-- Header row: title + presets + transport -->
    <div class="qj2-header">
      <span class="qj2-title">Carousel Jam</span>
      <div class="qj2-presets">
        <button
          v-for="p in PRESETS"
          :key="p.label"
          class="qj2-preset-btn"
          :class="{ active: activePreset?.label === p.label }"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <button
        class="qj2-play-btn"
        :class="{ playing: sessionPlaying }"
        :disabled="!canPlay"
        @click="toggleTransport"
        :aria-label="sessionPlaying ? 'Stop' : 'Play'"
      >
        <Square v-if="sessionPlaying" :size="12" />
        <Play   v-else               :size="12" />
        {{ sessionPlaying ? 'Stop' : 'Play' }}
      </button>
    </div>

    <!-- Three-column carousel layout -->
    <div class="qj2-layout">

      <!-- Left: Key + Chord list + Beats/chord -->
      <div class="qj2-col qj2-col--left">
        <div class="qj2-panel">
          <div class="qj2-panel-label">Key</div>
          <select v-model="selectedRoot" class="form-select qj2-key-select" @change="onKeyChange">
            <option v-for="n in NOTES" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="qj2-panel qj2-panel--chords">
          <div class="qj2-panel-label">Progression</div>
          <div class="qj2-chord-list">
            <div
              v-for="(chord, i) in chords"
              :key="i"
              class="qj2-chord-row"
              :class="{ active: sessionPlaying && sessionCurrentChordIdx === i }"
            >
              <span class="qj2-chord-numeral">{{ chord.numeral }}</span>
              <span class="qj2-chord-name">{{ chordLabel(chord) }}</span>
            </div>
            <div v-if="!chords.length" class="qj2-chord-empty">Pick a vibe above</div>
          </div>
        </div>

        <div class="qj2-panel">
          <div class="qj2-panel-label">Beats / chord</div>
          <div class="qj2-btn-group">
            <button
              v-for="n in [2, 4, 8]"
              :key="n"
              class="qj2-option-btn"
              :class="{ active: sessionBeatsPerChord === n }"
              @click="setBeatsPerChord(n)"
            >{{ n }}</button>
          </div>
        </div>
      </div>

      <!-- Center: animated wheel -->
      <div class="qj2-col qj2-col--center">
        <div
          class="qj2-wheel-wrap"
          :style="{ width: WS + 'px', height: WS + 'px' }"
        >
          <!-- Ripple pulses (behind the SVG ring) -->
          <div
            v-for="pulse in pulses"
            :key="pulse.id"
            class="qj2-pulse"
            :class="'qj2-pulse--' + pulse.kind"
            :style="{
              width:  WS * 0.6 + 'px',
              height: WS * 0.6 + 'px',
              '--qj2-pulse-end': WS * 1.6 / (WS * 0.6),
            }"
          ></div>

          <!-- Ring, ticks, indicator -->
          <svg :width="WS" :height="WS" class="qj2-svg" aria-hidden="true">
            <!-- Outer reference ring -->
            <circle
              :cx="cx" :cy="cy" :r="r + 20"
              fill="none"
              stroke="var(--border)"
              stroke-width="1"
              stroke-dasharray="3 6"
            />
            <!-- Main ring fill -->
            <circle
              :cx="cx" :cy="cy" :r="r"
              fill="var(--surface)"
              stroke="var(--border2)"
              stroke-width="2"
            />
            <!-- 16 beat tick marks -->
            <line
              v-for="tick in beatTicks"
              :key="tick.i"
              :x1="tick.x1" :y1="tick.y1"
              :x2="tick.x2" :y2="tick.y2"
              :stroke="sessionPlaying && currentDrumStep === tick.i ? 'var(--accent)' : 'var(--border2)'"
              :stroke-width="tick.major ? 2 : 1"
              stroke-linecap="round"
            />
            <!-- Indicator arm -->
            <line
              :x1="cx" :y1="cy"
              :x2="tipPos.x" :y2="tipPos.y"
              stroke="var(--accent)"
              stroke-width="2.5"
              stroke-linecap="round"
            />
            <!-- Indicator dot -->
            <circle
              :cx="tipPos.x" :cy="tipPos.y"
              r="7"
              fill="var(--accent)"
              stroke="var(--surface)"
              stroke-width="2"
            />
          </svg>

          <!-- Chord nodes positioned on the ring -->
          <div
            v-for="node in nodePositions"
            :key="node.i"
            class="qj2-node"
            :class="{
              'qj2-node--active':   sessionCurrentChordIdx === node.i,
              'qj2-node--popping':  poppingIdx === node.i,
            }"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
          >
            <span class="qj2-node-numeral">{{ node.chord.numeral }}</span>
            <span class="qj2-node-name">{{ chordLabel(node.chord) }}</span>
          </div>

          <!-- Center hub -->
          <div
            class="qj2-hub"
            :style="{ width: r * 1.25 + 'px', height: r * 1.25 + 'px' }"
          >
            <div class="qj2-hub-chord" :class="{ dim: !sessionPlaying }">
              {{ currentChordName || (chords[0] ? chordLabel(chords[0]) : '') }}
            </div>
            <div class="qj2-hub-label">{{ sessionPlaying ? 'now playing' : 'carousel' }}</div>
          </div>
        </div>
      </div>

      <!-- Right: BPM + Beat strip -->
      <div class="qj2-col qj2-col--right">
        <div class="qj2-panel">
          <div class="qj2-panel-label">BPM</div>
          <div class="qj2-bpm-row">
            <button class="qj2-bpm-btn" @click="sessionBpm = Math.max(40, sessionBpm - 4)">−</button>
            <span class="qj2-bpm-val">{{ sessionBpm }}</span>
            <button class="qj2-bpm-btn" @click="sessionBpm = Math.min(200, sessionBpm + 4)">+</button>
          </div>
        </div>

        <div class="qj2-panel qj2-panel--beat">
          <div class="qj2-panel-label">Beat pattern</div>
          <div class="qj2-beat-strip">
            <div class="qj2-beat-row-wrap">
              <span class="qj2-beat-inst">K</span>
              <div class="qj2-beat-row">
                <div
                  v-for="(v, i) in kickRow"
                  :key="'k' + i"
                  class="qj2-beat-cell"
                  :class="{
                    lit:    v,
                    active: sessionPlaying && currentDrumStep === i && v,
                    beat:   i % 4 === 0,
                  }"
                ></div>
              </div>
            </div>
            <div class="qj2-beat-row-wrap">
              <span class="qj2-beat-inst">S</span>
              <div class="qj2-beat-row">
                <div
                  v-for="(v, i) in snareRow"
                  :key="'s' + i"
                  class="qj2-beat-cell qj2-beat-cell--snare"
                  :class="{
                    lit:    v,
                    active: sessionPlaying && currentDrumStep === i && v,
                    beat:   i % 4 === 0,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instrument surface -->
    <div class="qj2-instrument">
      <JamInstrument />
    </div>
  </div>
</template>

<style scoped>
/* ── Page shell ──────────────────────────────────────────────────────────── */
.qj2 {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem 0.75rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.qj2-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.qj2-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text4);
  white-space: nowrap;
  margin-right: 0.25rem;
}

.qj2-presets {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  flex: 1;
}

.qj2-preset-btn {
  padding: 0.28rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}

.qj2-preset-btn:hover { border-color: var(--accent); color: var(--text); }
.qj2-preset-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

.qj2-play-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}

.qj2-play-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }
.qj2-play-btn.playing { border-color: var(--rust); background: var(--rust-bg); color: var(--rust-hi); }
.qj2-play-btn:disabled { opacity: 0.38; cursor: not-allowed; }

/* ── Three-column layout ─────────────────────────────────────────────────── */
.qj2-layout {
  display: grid;
  grid-template-columns: 180px 1fr 180px;
  gap: 1rem;
  align-items: start;
}

@media (max-width: 640px) {
  .qj2-layout {
    grid-template-columns: 1fr;
  }
  .qj2-col--center { order: -1; }
}

/* ── Shared panel ────────────────────────────────────────────────────────── */
.qj2-panel {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--raised);
}

.qj2-panel-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text4);
}

.qj2-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.qj2-key-select { width: 100%; }

/* ── Chord list ──────────────────────────────────────────────────────────── */
.qj2-chord-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.qj2-chord-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.4rem;
  border-radius: 5px;
  border: 1px solid transparent;
  transition: background 0.12s, border-color 0.12s;
}

.qj2-chord-row.active {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}

.qj2-chord-numeral {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text4);
  min-width: 1.8rem;
  font-variant-numeric: tabular-nums;
}

.qj2-chord-row.active .qj2-chord-numeral { color: var(--accent-lo); }

.qj2-chord-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text2);
}

.qj2-chord-row.active .qj2-chord-name { color: var(--accent); }
.qj2-chord-empty { font-size: 0.8rem; color: var(--text5); }

/* ── Beats/chord toggle ──────────────────────────────────────────────────── */
.qj2-btn-group {
  display: flex;
  gap: 0.3rem;
}

.qj2-option-btn {
  flex: 1;
  padding: 0.3rem 0;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.82rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}

.qj2-option-btn:hover { border-color: var(--accent); color: var(--text); }
.qj2-option-btn.active { border-color: var(--accent); background: var(--accent-bg); color: var(--accent); }

/* ── Animated wheel ──────────────────────────────────────────────────────── */
.qj2-col--center {
  align-items: center;
}

.qj2-wheel-wrap {
  position: relative;
  flex-shrink: 0;
}

.qj2-svg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Chord nodes on the ring */
.qj2-node {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid var(--border2);
  background: var(--surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

.qj2-node--active {
  border-color: var(--accent);
  background: var(--accent-bg);
  box-shadow: 0 0 0 3px var(--accent-mid);
}

.qj2-node--popping {
  animation: qj2-node-pop 320ms ease-out;
}

.qj2-node-numeral {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--text4);
  line-height: 1;
}

.qj2-node--active .qj2-node-numeral { color: var(--accent-lo); }

.qj2-node-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text2);
  line-height: 1;
}

.qj2-node--active .qj2-node-name { color: var(--accent); }

/* Center hub */
.qj2-hub {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--border2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  pointer-events: none;
}

.qj2-hub-chord {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  transition: color 0.2s;
}

.qj2-hub-chord.dim { color: var(--text3); }

.qj2-hub-label {
  font-size: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text5);
}

/* Beat ripple pulses */
.qj2-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0.3);
  pointer-events: none;
  animation: qj2-pulse-out var(--qj2-dur, 1100ms) ease-out forwards;
}

.qj2-pulse--kick  { border: 3px solid var(--accent); --qj2-dur: 1100ms; }
.qj2-pulse--snare { border: 2px solid var(--rust);   --qj2-dur:  900ms; }
.qj2-pulse--one   { border: 1px solid var(--border2); --qj2-dur:  900ms; }

/* ── BPM control ─────────────────────────────────────────────────────────── */
.qj2-bpm-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qj2-bpm-val {
  flex: 1;
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
}

.qj2-bpm-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  transition: border-color 0.12s, color 0.12s;
}

.qj2-bpm-btn:hover { border-color: var(--accent); color: var(--accent); }

/* ── Beat strip ──────────────────────────────────────────────────────────── */
.qj2-beat-strip {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.qj2-beat-row-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.qj2-beat-inst {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--text5);
  width: 0.8rem;
  flex-shrink: 0;
}

.qj2-beat-row {
  display: flex;
  gap: 2px;
  flex: 1;
}

.qj2-beat-cell {
  flex: 1;
  aspect-ratio: 1;
  border-radius: 2px;
  border: 1px solid var(--border);
  background: var(--bg);
  transition: background 0.08s, box-shadow 0.08s;
}

.qj2-beat-cell.beat { border-color: var(--border2); }
.qj2-beat-cell.lit  { background: var(--raised); border-color: var(--border2); }

.qj2-beat-cell.active {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-mid);
}

.qj2-beat-cell--snare.active {
  background: var(--rust);
  border-color: var(--rust);
  box-shadow: 0 0 0 2px var(--rust-bg);
}

/* ── Instrument section ──────────────────────────────────────────────────── */
.qj2-instrument {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

/* ── Keyframe animations ─────────────────────────────────────────────────── */
@keyframes qj2-pulse-out {
  0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 0.85; }
  60%  { opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(var(--qj2-pulse-end, 2.4)); opacity: 0; }
}

@keyframes qj2-node-pop {
  0%   { transform: translate(-50%, -50%) scale(1); }
  35%  { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}
</style>
