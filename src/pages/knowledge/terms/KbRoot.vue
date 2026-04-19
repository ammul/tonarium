<script setup>
import { ref, computed } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const rootIdx = ref(0)

function pickRoot(i) {
  rootIdx.value = i
  playNote(60 + NOTE_TO_SEMI[i])
}

const NOTE_ROLES = [
  { semis: [0],      role: 'Root',        color: 'root',   desc: '1st — home base' },
  { semis: [2],      role: 'Major 2nd',   color: 'dim',    desc: '2 semitones up' },
  { semis: [3],      role: 'Minor 3rd',   color: 'dim',    desc: '3 semitones up' },
  { semis: [4],      role: 'Major 3rd',   color: 'dim',    desc: '4 semitones up' },
  { semis: [5],      role: 'Perfect 4th', color: 'anchor', desc: '5 semitones up' },
  { semis: [7],      role: 'Perfect 5th', color: 'anchor', desc: '7 semitones up — very stable' },
  { semis: [9],      role: 'Major 6th',   color: 'dim',    desc: '9 semitones up' },
]

const highlightSet = computed(() => {
  const result = new Set()
  NOTE_ROLES.forEach(r => r.semis.forEach(s => result.add((rootIdx.value + NOTE_TO_SEMI[rootIdx.value] + s) % 12)))
  return result
})

const noteRows = computed(() =>
  NOTE_ROLES.map(r => ({
    ...r,
    noteIdx: (rootIdx.value + r.semis[0]) % 12,
    name: NOTES[(rootIdx.value + r.semis[0]) % 12],
  }))
)
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="The root note is the tonal center — the note that a chord, scale, or key is built from. It's the 'home base' that every other note relates back to."
        :go-to-term="goToTerm"
        current-term="root"
      />
    </p>

    <div class="kb-section-label">Pick a root note</div>
    <NoteStripPicker :model-value="rootIdx" @note-down="pickRoot" />

    <div class="kb-root-name">
      {{ NOTES[rootIdx] }} <span class="kb-root-sub">is the root</span>
    </div>

    <div class="kb-root-table">
      <div
        v-for="row in noteRows"
        :key="row.role"
        class="kb-root-row"
        :class="'kb-root-row--' + row.color"
      >
        <span class="kb-root-note">{{ row.name }}</span>
        <span class="kb-root-role">{{ row.role }}</span>
        <span class="kb-root-desc">{{ row.desc }}</span>
      </div>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('note')">Note</button>
      <button class="kb-rel-btn" @click="goToTerm('scale')">Scale</button>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
      <button class="kb-rel-btn" @click="goToTerm('key')">Key</button>
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
.kb-root-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent);
  padding: 0.5rem 0;
}
.kb-root-sub {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text3);
}
.kb-root-table {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.kb-root-row {
  display: grid;
  grid-template-columns: 2.5rem 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}
.kb-root-row--root   { background: var(--rust-bg); border: 1px solid var(--rust); }
.kb-root-row--anchor { background: var(--accent-bg); border: 1px solid var(--accent-mid); }
.kb-root-row--dim    { background: var(--raised); border: 1px solid var(--border); }
.kb-root-note { font-size: 0.95rem; font-weight: 700; color: var(--text); }
.kb-root-row--root .kb-root-note   { color: var(--rust-hi); }
.kb-root-row--anchor .kb-root-note { color: var(--accent); }
.kb-root-role { font-size: 0.82rem; font-weight: 600; color: var(--text2); }
.kb-root-desc { font-size: 0.78rem; color: var(--text4); }
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
