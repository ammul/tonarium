<script setup>
import { ref } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const DEMO_NOTES = [
  { label: 'C3', midi: 48, octave: 3 },
  { label: 'C4', midi: 60, octave: 4 },
  { label: 'C5', midi: 72, octave: 5 },
]

const activeOct = ref(null)

function playOctave(midi, oct) {
  activeOct.value = oct
  playNote(midi, 1.2)
  setTimeout(() => { if (activeOct.value === oct) activeOct.value = null }, 500)
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="An octave is a span of 12 semitones — the same note name at exactly double the frequency. Move up an octave: brighter. Move down: warmer and deeper."
        :go-to-term="goToTerm"
        current-term="octave"
      />
    </p>

    <div class="kb-section-label">Same note, three octaves — tap to compare</div>
    <div class="kb-oct-row">
      <button
        v-for="n in DEMO_NOTES"
        :key="n.octave"
        class="kb-oct-btn"
        :class="{ active: activeOct === n.octave }"
        @click="playOctave(n.midi, n.octave)"
      >
        <span class="kb-oct-label">{{ n.label }}</span>
        <span class="kb-oct-sub">Octave {{ n.octave }}</span>
      </button>
    </div>

    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">12</span>
        <KbText text="semitones per octave" :go-to-term="goToTerm" current-term="octave" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">×2</span>
        <KbText text="frequency doubles each octave" :go-to-term="goToTerm" current-term="octave" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">C4</span>
        <KbText text="middle C — the common reference point" :go-to-term="goToTerm" current-term="octave" />
      </div>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('note')">Note</button>
      <button class="kb-rel-btn" @click="goToTerm('interval')">Interval</button>
      <button class="kb-rel-btn" @click="goToTerm('scale')">Scale</button>
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
.kb-oct-row {
  display: flex;
  gap: 0.75rem;
}
.kb-oct-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.85rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--border2);
  background: var(--surface);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s, transform 0.1s;
}
.kb-oct-btn:hover { border-color: var(--accent); background: var(--raised); }
.kb-oct-btn.active { border-color: var(--accent); background: var(--accent-bg); transform: scale(0.96); }
.kb-oct-label { font-size: 1.6rem; font-weight: 700; color: var(--accent); line-height: 1; }
.kb-oct-sub { font-size: 0.72rem; color: var(--text4); letter-spacing: 0.06em; text-transform: uppercase; }
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
