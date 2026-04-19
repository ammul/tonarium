<script setup>
import { ref, onUnmounted } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const KICK_STEPS  = new Set([0, 4, 8, 12])
const SNARE_STEPS = new Set([4, 12])
const HIHAT_STEPS = new Set([0, 2, 4, 6, 8, 10, 12, 14])

const bpm         = ref(90)
const playing     = ref(false)
const currentStep = ref(-1)
let   _interval   = null

function playKickSound()  { playNote(36, 1.0) }
function playSnareSound() { playNote(38, 0.8) }
function playHihatSound() { playNote(42, 0.4) }

function tick() {
  const next = (currentStep.value + 1) % 16
  currentStep.value = next
  if (KICK_STEPS.has(next))  playKickSound()
  if (SNARE_STEPS.has(next)) playSnareSound()
  if (HIHAT_STEPS.has(next)) playHihatSound()
}

function togglePlay() {
  if (playing.value) {
    clearInterval(_interval)
    playing.value     = false
    currentStep.value = -1
  } else {
    playing.value = true
    const ms = (60 / bpm.value / 4) * 1000
    _interval = setInterval(tick, ms)
  }
}

function onBpmChange() {
  if (!playing.value) return
  clearInterval(_interval)
  const ms = (60 / bpm.value / 4) * 1000
  _interval = setInterval(tick, ms)
}

onUnmounted(() => clearInterval(_interval))
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A beat is the steady pulse of music — what you tap your foot to. Rhythm is patterns built on top of that pulse. Drum patterns divide the beat into 16 steps per bar."
        :go-to-term="goToTerm"
        current-term="beat"
      />
    </p>

    <div class="kb-beat-header">
      <div class="kb-section-label">16-step beat pattern</div>
      <div class="kb-beat-controls">
        <label class="kb-beat-bpm-label">
          {{ bpm }} BPM
          <input v-model.number="bpm" type="range" min="60" max="160" step="5" class="kb-beat-slider" @input="onBpmChange" />
        </label>
        <button class="kb-beat-play-btn" :class="{ active: playing }" @click="togglePlay">
          {{ playing ? 'Stop' : 'Play' }}
        </button>
      </div>
    </div>

    <div class="kb-beat-grid">
      <div class="kb-beat-row-label">Kick</div>
      <div
        v-for="i in 16"
        :key="'k' + i"
        class="kb-beat-cell"
        :class="{
          filled: KICK_STEPS.has(i - 1),
          active: currentStep === i - 1,
          beat: (i - 1) % 4 === 0,
        }"
      />

      <div class="kb-beat-row-label">Snare</div>
      <div
        v-for="i in 16"
        :key="'s' + i"
        class="kb-beat-cell"
        :class="{
          filled: SNARE_STEPS.has(i - 1),
          active: currentStep === i - 1,
          snare: true,
          beat: (i - 1) % 4 === 0,
        }"
      />

      <div class="kb-beat-row-label">Hi-hat</div>
      <div
        v-for="i in 16"
        :key="'h' + i"
        class="kb-beat-cell"
        :class="{
          filled: HIHAT_STEPS.has(i - 1),
          active: currentStep === i - 1,
          hihat: true,
          beat: (i - 1) % 4 === 0,
        }"
      />
    </div>

    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">4</span>
        <KbText text="beats per bar in most music" :go-to-term="goToTerm" current-term="beat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">16</span>
        <KbText text="steps per bar — each beat divides into 4 sixteenth notes" :go-to-term="goToTerm" current-term="beat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">2&amp;4</span>
        <KbText text="the snare on beats 2 and 4 is the backbeat" :go-to-term="goToTerm" current-term="beat" />
      </div>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('bpm')">BPM</button>
      <button class="kb-rel-btn" @click="goToTerm('progression')">Chord Progression</button>
    </div>
  </div>
</template>

<style scoped>
.kb-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
}
.kb-beat-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
}
.kb-beat-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.kb-beat-bpm-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.kb-beat-slider {
  width: 80px;
  accent-color: var(--accent);
}
.kb-beat-play-btn {
  padding: 0.3rem 0.85rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.kb-beat-play-btn:hover { border-color: var(--accent); color: var(--accent); }
.kb-beat-play-btn.active { border-color: var(--accent); background: var(--accent-bg); color: var(--accent); }
.kb-beat-grid {
  display: grid;
  grid-template-columns: 3.5rem repeat(16, 1fr);
  gap: 3px;
  align-items: center;
}
.kb-beat-row-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.kb-beat-cell {
  height: 1.5rem;
  border-radius: 3px;
  border: 1px solid var(--border);
  background: var(--surface);
  transition: background 0.08s, border-color 0.08s;
}
.kb-beat-cell.beat { border-color: var(--border2); }
.kb-beat-cell.filled { background: var(--accent-mid); border-color: var(--accent); }
.kb-beat-cell.filled.snare { background: var(--rust); border-color: var(--rust-hi); }
.kb-beat-cell.filled.hihat { background: var(--text5); border-color: var(--text4); }
.kb-beat-cell.active { border-color: var(--accent) !important; box-shadow: 0 0 0 1px var(--accent); }
.kb-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.kb-fact {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  font-size: 0.82rem;
  color: var(--text3);
}
.kb-fact-num {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}
.kb-related {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}
.kb-related-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text5);
}
.kb-rel-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.kb-rel-btn:hover { border-color: var(--accent); background: var(--accent-bg); }
</style>
