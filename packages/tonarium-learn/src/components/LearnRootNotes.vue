<script setup>
import { ref } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'

const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

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
    <p class="step-intro">Every piece of music orbits a home note called the <strong>root</strong>. When a melody lands on it, it sounds resolved. When it moves away, it creates tension. Everything else (scales, chords, keys) is named and measured relative to this anchor.</p>

    <div class="tc-learn-roots-picker">
      <NoteStripPicker
        :from-index="rootNoteIdx"
        @note-down="pickRootNote"
      />
    </div>

    <div class="tc-learn-roots-result">
      <template v-if="rootNoteIdx !== null">
        <div class="tc-learn-roots-rr-name">{{ CHROMATIC[rootNoteIdx] }}</div>
        <div class="tc-learn-roots-rr-label">your root note</div>
      </template>
      <template v-else>
        <div class="tc-learn-roots-rr-hint">Tap any note to set your root</div>
      </template>
    </div>

    <div class="tc-learn-roots-facts">
      <div class="card card-sm tc-learn-roots-rf-item">
        <span class="tc-learn-roots-rf-heading">12 notes</span>
        <span class="tc-learn-roots-rf-body">Western music uses 12 notes before the pattern repeats. The 7 natural notes (A B C D E F G) plus 5 sharps in between (the black keys on a piano).</span>
      </div>
      <div class="card card-sm tc-learn-roots-rf-item">
        <span class="tc-learn-roots-rf-heading">Octaves</span>
        <span class="tc-learn-roots-rf-body">Every note repeats at double the frequency: same name, higher pitch. C and the C above it sound related because the higher one vibrates exactly twice as fast.</span>
        <button v-if="rootNoteIdx !== null" class="btn btn-sm btn-accent tc-learn-roots-rr-octave-btn" @click="playRootOctave">Hear it one octave up</button>
      </div>
      <div class="card card-sm tc-learn-roots-rf-item">
        <span class="tc-learn-roots-rf-heading">Keys</span>
        <span class="tc-learn-roots-rf-body">When someone says a song is in <em>C major</em>, C is the root. The root gives the key its name and is the note the music wants to return to.</span>
      </div>
    </div>

    <div class="step-bridge">
      Once you have a root, you can describe the <strong>distance</strong> to any other note. That distance is called an <strong>interval</strong>.
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
  min-height: 6rem;
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
  display: flex;
  flex-direction: column;
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
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.55;
}

.tc-learn-roots-rf-body em {
  color: var(--text2);
  font-style: normal;
  font-weight: 600;
}

/* step-bridge, step-bridge strong — from learn.css */
</style>
