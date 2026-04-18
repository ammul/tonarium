<script setup>
import { ref } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'

const rootNoteIdx = ref(null)

function pickRootNote(i) {
  rootNoteIdx.value = i
  playNote(60 + NOTE_TO_SEMI[i])
}

function playRootOctave() {
  if (rootNoteIdx.value === null) return
  playNote(60 + NOTE_TO_SEMI[rootNoteIdx.value])
  setTimeout(() => playNote(72 + NOTE_TO_SEMI[rootNoteIdx.value], 0.8), 550)
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Pick a note — that's your root. Everything else in music is named from here.</p>

    <div class="tc-learn-roots-picker">
      <NoteStripPicker
        :from-index="rootNoteIdx"
        @note-down="pickRootNote"
      />
    </div>

    <div class="tc-learn-roots-result">
      <template v-if="rootNoteIdx !== null">
        <div class="tc-learn-roots-rr-main">
          <div>
            <div class="tc-learn-roots-rr-name">{{ NOTES[rootNoteIdx] }}</div>
            <div class="tc-learn-roots-rr-label">your root note</div>
          </div>
          <button class="btn btn-sm btn-accent tc-learn-roots-rr-octave-btn" @click="playRootOctave">Hear it one octave up</button>
        </div>
      </template>
      <template v-else>
        <div class="tc-learn-roots-rr-hint">Tap any note to set your root</div>
      </template>
    </div>

    <div class="tc-learn-roots-facts">
      <div class="card card-sm tc-learn-roots-rf-item">
        <span class="tc-learn-roots-rf-heading">12 notes</span>
        <span class="tc-learn-roots-rf-body">Western music uses 12 pitches before the pattern repeats — 7 naturals plus 5 sharps.</span>
      </div>
      <div class="card card-sm tc-learn-roots-rf-item">
        <span class="tc-learn-roots-rf-heading">Octaves</span>
        <span class="tc-learn-roots-rf-body">The same note at double the frequency — same name, higher pitch.</span>
      </div>
      <div class="card card-sm tc-learn-roots-rf-item">
        <span class="tc-learn-roots-rf-heading">Keys</span>
        <span class="tc-learn-roots-rf-body">When a song is in C major, C is the root — the note everything wants to return to.</span>
      </div>
    </div>

    <div class="step-bridge">
      Try picking the same note in different spots on the strip. Notice it sounds the same but sits higher or lower — that's an <strong>octave</strong>. Once you have a root, you can measure the <strong>distance</strong> to any other note. That distance is called an <strong>interval</strong>.
    </div>
  </div>
</template>

<style scoped>
/* step-content, step-intro, step-bridge — from learn.css */

.tc-learn-roots-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tc-learn-roots-result {
  min-height: 5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.3rem;
  padding: 1rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
}

.tc-learn-roots-rr-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
}

.tc-learn-roots-rr-name {
  font-size: clamp(1.8rem, 8vw, 2.8rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.04em;
}

.tc-learn-roots-rr-label {
  font-size: 0.78rem;
  color: var(--accent-mid);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.tc-learn-roots-rr-hint {
  font-size: 1rem;
  color: var(--text3);
  font-weight: 600;
}

.tc-learn-roots-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

/* unique properties not covered by .card + .card-sm */
.tc-learn-roots-rf-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tc-learn-roots-rf-heading {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.tc-learn-roots-rf-body {
  font-size: 0.78rem;
  color: var(--text3);
  line-height: 1.5;
}

@media (max-width: 480px) {
  .tc-learn-roots-facts { grid-template-columns: 1fr; }
}
</style>
