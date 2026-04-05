<script setup>
import { ref } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTE_TO_SEMI } from '@/constants/musicConstants.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'

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
    <p class="step-intro">Every piece of music orbits a home note — the <strong>root</strong>. When a melody lands on it, it sounds resolved. When it moves away, it creates tension. Everything else — scales, chords, keys — is named and measured relative to this anchor.</p>

    <div class="root-note-picker">
      <NoteStripPicker
        :from-index="rootNoteIdx"
        @note-down="pickRootNote"
      />
    </div>

    <div class="root-result">
      <template v-if="rootNoteIdx !== null">
        <div class="rr-name">{{ CHROMATIC[rootNoteIdx] }}</div>
        <div class="rr-label">your root note</div>
        <button class="rr-octave-btn" @click="playRootOctave">Hear it one octave up</button>
      </template>
      <template v-else>
        <div class="rr-hint">Tap any note to set your root</div>
      </template>
    </div>

    <div class="root-facts">
      <div class="rf-item">
        <span class="rf-heading">12 notes</span>
        <span class="rf-body">Western music uses 12 notes before the pattern repeats. The 7 natural notes (A B C D E F G) plus 5 sharps in between — the black keys on a piano.</span>
      </div>
      <div class="rf-item">
        <span class="rf-heading">Octaves</span>
        <span class="rf-body">Every note repeats at double the frequency — same name, higher pitch. C and the C above it sound related because the higher one vibrates exactly twice as fast.</span>
      </div>
      <div class="rf-item">
        <span class="rf-heading">Keys</span>
        <span class="rf-body">When someone says a song is in <em>C major</em>, C is the root. The root gives the key its name and is the note the music wants to return to.</span>
      </div>
    </div>

    <div class="step-bridge">
      Once you have a root, you can describe the <strong>distance</strong> to any other note. That distance is called an <strong>interval</strong>.
    </div>
  </div>
</template>

<style scoped>
.step-content {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.step-intro {
  font-size: 0.87rem;
  color: var(--text2);
  line-height: 1.6;
  margin: 0;
}

.step-intro strong {
  color: var(--accent);
  font-weight: 600;
}

.root-note-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.root-result {
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

.rr-name {
  font-size: clamp(1.8rem, 8vw, 2.8rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.04em;
}

.rr-label {
  font-size: 0.78rem;
  color: var(--accent-mid);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.rr-octave-btn {
  margin-top: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 5px;
  border: 1px solid var(--accent-mid);
  background: transparent;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.rr-octave-btn:hover { background: var(--accent-bg); border-color: var(--accent); }

.rr-hint {
  font-size: 1rem;
  color: var(--text3);
  font-weight: 600;
}

.root-facts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rf-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.75rem 0.9rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 8px;
}

.rf-heading {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.rf-body {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.55;
}

.rf-body em {
  color: var(--text2);
  font-style: normal;
  font-weight: 600;
}

.step-bridge {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
  font-size: 0.84rem;
  color: var(--text3);
  line-height: 1.6;
}

.step-bridge strong {
  color: var(--accent);
  font-weight: 600;
}
</style>
