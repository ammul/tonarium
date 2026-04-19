<script setup>
import { ref } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const selectedNote = ref(null)

function pickNote(i) {
  selectedNote.value = i
  playNote(60 + NOTE_TO_SEMI[i])
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A note is a single musical pitch — the fundamental building block of all music. Western music uses 12 distinct notes, repeating across octaves."
        :go-to-term="goToTerm"
        current-term="note"
      />
    </p>

    <div class="kb-section-label">Tap any note to hear it</div>
    <NoteStripPicker :model-value="selectedNote" @note-down="pickNote" />
    <div v-if="selectedNote !== null" class="kb-note-result">
      <span class="kb-note-name">{{ NOTES[selectedNote] }}</span>
      <span class="kb-note-desc">
        <KbText
          :text="`Note ${selectedNote + 1} of 12. ${NOTES[selectedNote].includes('#') ? 'A sharp — sits between two natural notes.' : 'A natural note.'}`"
          :go-to-term="goToTerm"
          current-term="note"
        />
      </span>
    </div>

    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">12</span>
        <KbText text="unique notes in Western music" :go-to-term="goToTerm" current-term="note" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">A–G</span>
        <KbText text="7 natural notes, 5 sharps/flats" :go-to-term="goToTerm" current-term="note" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">Hz</span>
        <KbText text="every note is a specific frequency" :go-to-term="goToTerm" current-term="note" />
      </div>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('octave')">Octave</button>
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
  margin-bottom: -0.25rem;
}
.kb-note-result {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border2);
  border-radius: 8px;
  background: var(--raised);
}
.kb-note-name {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  min-width: 2.5rem;
}
.kb-note-desc { font-size: 0.85rem; color: var(--text2); }
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
