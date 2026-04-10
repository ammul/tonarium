<script setup>
import { ref } from 'vue'
import { playChord } from '@/audio/audioEngine.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'
import { CHORD_TYPES } from '@/constants/chordTypes.js'

const chordsRoot = ref(0)
</script>

<template>
  <div class="step-content">
    <p class="step-intro">A <strong>chord</strong> is three or more notes played at once. Just three chord types are behind most of the music you know. They differ only by one note.</p>

    <div class="picker-row">
      <span class="picker-label">Root</span>
      <NoteStripPicker
        small
        :from-index="chordsRoot"
        @note-down="chordsRoot = $event"
      />
    </div>

    <div class="chord-type-list">
      <div
        v-for="ct in CHORD_TYPES"
        :key="ct.chord"
        class="card chord-type-card"
      >
        <div class="ctc-main">
          <div class="ctc-text">
            <span class="ctc-name">{{ ct.chord }}</span>
            <span class="ctc-def">{{ ct.def }}</span>
          </div>
          <button
            class="btn btn-sm btn-accent flex-shrink-0 ctc-play"
            @pointerdown.prevent="playChord(ct.itvs.map(s => 60 + chordsRoot + s))"
          >Hear it</button>
        </div>
        <div class="ctc-intervals">
          <span
            v-for="s in ct.itvs"
            :key="s"
            class="ctc-interval-pill"
          >+{{ s }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* step-content, step-intro — from learn.css */

.picker-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.picker-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding-top: 0.5rem;
  flex-shrink: 0;
  min-width: 2.5rem;
}

.chord-type-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* unique properties not covered by .card */
.chord-type-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.ctc-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.ctc-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.ctc-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.ctc-def {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
}

.ctc-intervals {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.ctc-interval-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--accent-mid);
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.15rem 0.45rem;
  letter-spacing: 0.03em;
}
</style>
