<script setup>
import { ref, computed } from 'vue'
import { CHORD_DETECT_TYPES, NOTES } from '@tonarium/core'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { buildRows } from '@/utils/musicUtils.js'
import ChordCardBody from '@/components/music/ChordCardBody.vue'
import { startNote, stopNote } from '@/audio/audioEngine.js'
import { chordOn, chordOff } from '@/audio/midiManager.js'

const GUITAR_TYPE_MAP = {
  'Major': 'maj', 'Minor': 'min', 'Diminished': 'dim',
  'Augmented': 'aug', 'Dominant 7th': 'dom7',
  'Major 7th': 'maj7', 'Minor 7th': 'min7', 'Sus4': 'sus4',
}

const SHARP_TO_FLAT = { 'G#': 'Ab', 'A#': 'Bb', 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb' }
function flatName(name) {
  for (const [s, f] of Object.entries(SHARP_TO_FLAT))
    if (name.startsWith(s)) return f + name.slice(s.length)
  return name
}

// C-based display order mapped to A-based NOTES indices
const ROOT_ORDER = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]

const CATEGORY_TYPES = {
  triads:    ['Major', 'Minor', 'Diminished', 'Augmented', 'Power chord'],
  sixths:    ['Major 6th', 'Minor 6th'],
  sevenths:  ['Dominant 7th', 'Major 7th', 'Minor 7th', 'Half-diminished 7th', 'Diminished 7th'],
  ninths:    ['Dominant 9th', 'Major 9th', 'Minor 9th'],
  suspended: ['Sus2', 'Sus4'],
}

const allChords = []
CHORD_DETECT_TYPES.forEach(({ intervals, suffix, name: typeName }) => {
  const chordType = GUITAR_TYPE_MAP[typeName] ?? null
  for (let root = 0; root < 12; root++) {
    const noteSet = new Set(intervals.map(i => (root + i) % 12))
    const sorted = [...noteSet].sort((a, b) => a - b)
    allChords.push({
      id: `${root}-${typeName}`,
      root,
      typeName,
      suffix,
      chordType,
      intervals,
      name: NOTES[root] + suffix,
      fullName: NOTES[root] + ' ' + typeName,
      noteSet,
      noteNames: sorted.map(i => NOTES[i]),
      pressLabels: sorted.map(i => NOTES[i]),
    })
  }
})

const OCTAVE = 4
let _currentMidis = []

function chordMidis(chord) {
  const aMidi = 12 * (OCTAVE + 1) + 9
  const root = aMidi + chord.root
  return chord.intervals.map(i => root + i)
}

function previewChord(chord) {
  chordOff(_currentMidis)
  _currentMidis.forEach(m => stopNote(m))
  _currentMidis = chordMidis(chord)
  chordOn(_currentMidis)
  _currentMidis.forEach(m => startNote(m))
}

function stopPreview(chord) {
  chordOff(chordMidis(chord))
  chordMidis(chord).forEach(m => stopNote(m))
}

const query          = ref('')
const rootFilter     = ref(null)   // null | 0–11 (A-based root index)
const categoryFilter = ref('all')  // 'all' | 'triads' | 'sixths' | 'sevenths' | 'ninths' | 'suspended'

const hasFilter = computed(() =>
  !!query.value.trim() || rootFilter.value !== null || categoryFilter.value !== 'all'
)

const filteredChords = computed(() => {
  if (!hasFilter.value) return []
  const q = query.value.trim().toLowerCase()
  const cols = padSize.value === '4x4' ? 4 : 3
  return allChords
    .filter(c => {
      if (rootFilter.value !== null && c.root !== rootFilter.value) return false
      if (categoryFilter.value !== 'all' && !CATEGORY_TYPES[categoryFilter.value].includes(c.typeName)) return false
      if (q) {
        const nameLower = c.name.toLowerCase()
        const flatLower = flatName(c.name).toLowerCase()
        const typeSearch = c.typeName.replace(/\s*chord$/i, '').toLowerCase()
        return nameLower.startsWith(q) || flatLower.startsWith(q) || typeSearch.includes(q)
      }
      return true
    })
    .map(c => ({ ...c, rows: buildRows(c.noteSet, c.root, cols) }))
})

function clearFilters() {
  query.value = ''
  rootFilter.value = null
  categoryFilter.value = 'all'
}
</script>

<template>
  <div class="chord-library">
    <div class="cl-root-row">
      <button
        v-for="r in ROOT_ORDER"
        :key="r"
        class="cl-root-btn"
        :class="{ active: rootFilter === r }"
        @click="rootFilter = rootFilter === r ? null : r"
      >{{ NOTES[r] }}</button>
    </div>

    <div class="cl-cat-row">
      <button
        v-for="cat in ['all','triads','sixths','sevenths','ninths','suspended']"
        :key="cat"
        class="cl-cat-btn"
        :class="{ active: categoryFilter === cat }"
        @click="categoryFilter = cat"
      >{{ cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1) }}</button>
    </div>

    <div class="cl-search-bar">
      <input
        v-model="query"
        class="cl-search-input"
        placeholder="Search: C, Dm, Bb7, major, minor 7th..."
        autocomplete="off"
        spellcheck="false"
      />
      <span v-if="hasFilter && filteredChords.length" class="cl-result-count">
        {{ filteredChords.length }} chord{{ filteredChords.length === 1 ? '' : 's' }}
      </span>
      <button v-if="hasFilter" class="cl-clear-btn" @click="clearFilters">Clear</button>
    </div>

    <div v-if="!hasFilter" class="cl-empty-state">
      <p class="cl-hint">Select a root note, a category, or search to browse.</p>
      <div class="cl-examples">
        <span class="cl-example-chip" @click="query = 'C'">C</span>
        <span class="cl-example-chip" @click="query = 'Dm'">Dm</span>
        <span class="cl-example-chip" @click="query = 'Bb7'">Bb7</span>
        <span class="cl-example-chip" @click="query = 'major'">major</span>
        <span class="cl-example-chip" @click="query = 'minor 7th'">minor 7th</span>
        <span class="cl-example-chip" @click="query = 'maj7'">maj7</span>
        <span class="cl-example-chip" @click="query = 'dim'">dim</span>
        <span class="cl-example-chip" @click="query = '9'">9th</span>
      </div>
    </div>

    <div v-else-if="filteredChords.length === 0" class="cl-no-results">
      No chords found.
    </div>

    <div v-else class="cl-grid">
      <div
        v-for="chord in filteredChords"
        :key="chord.id"
        class="cl-card"
        @pointerdown.prevent="previewChord(chord)"
        @pointerup="stopPreview(chord)"
        @pointerleave="stopPreview(chord)"
        @pointercancel="stopPreview(chord)"
      >
        <div class="cl-card-header">
          <span class="cl-chord-name">{{ chord.name }}</span>
          <span class="cl-chord-type">{{ chord.typeName }}</span>
        </div>

        <template v-if="displayMode === 'guitar' && !chord.chordType">
          <div class="cl-note-badges">
            <span
              v-for="n in chord.noteNames"
              :key="n"
              class="cl-note-badge"
              :class="{ root: n === NOTES[chord.root] }"
            >{{ n }}</span>
          </div>
        </template>

        <ChordCardBody
          v-else
          :rows="chord.rows"
          :pressLabels="chord.pressLabels"
          :noteNames="chord.noteNames"
          :chordRootIdx="chord.root"
          :chordType="chord.chordType ?? 'maj'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.chord-library {
  padding: 1rem;
  max-width: 1100px;
  margin: 0 auto;
}

.cl-root-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.6rem;
}

.cl-root-btn {
  padding: 0.22rem 0.55rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--text2);
  font-size: 0.8rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
  min-width: 2rem;
  text-align: center;
}

.cl-root-btn:hover {
  border-color: var(--accent-mid);
  color: var(--text);
}

.cl-root-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

.cl-cat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
}

.cl-cat-btn {
  padding: 0.22rem 0.65rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--text3);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}

.cl-cat-btn:hover {
  border-color: var(--accent-mid);
  color: var(--text);
}

.cl-cat-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
}

.cl-search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.cl-search-input {
  flex: 1;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
  color: var(--text1);
  outline: none;
  transition: border-color 0.15s;
}

.cl-search-input::placeholder { color: var(--text5); }
.cl-search-input:focus { border-color: var(--accent-mid); }

.cl-result-count {
  font-size: 0.8rem;
  color: var(--text4);
  white-space: nowrap;
}

.cl-clear-btn {
  padding: 0.22rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text4);
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.12s, border-color 0.12s;
}

.cl-clear-btn:hover {
  color: var(--text);
  border-color: var(--accent-mid);
}

.cl-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 2.5rem;
  color: var(--text4);
}

.cl-hint { font-size: 0.9rem; margin: 0; }

.cl-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}

.cl-example-chip {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 4px;
  padding: 0.25rem 0.6rem;
  font-size: 0.82rem;
  color: var(--accent);
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
}

.cl-example-chip:hover { border-color: var(--accent); color: var(--accent-hi, var(--accent)); }

.cl-no-results {
  text-align: center;
  margin-top: 2.5rem;
  font-size: 0.9rem;
  color: var(--text4);
}

.cl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
}

.cl-card {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 0.6rem 0.7rem 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.cl-card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  width: 100%;
  text-align: center;
}

.cl-chord-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.2;
}

.cl-chord-type {
  font-size: 0.68rem;
  color: var(--text4);
  line-height: 1;
}

.cl-note-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin: 0.25rem 0;
}

.cl-note-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  background: var(--bg);
  border: 1px solid var(--border2);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--accent);
}

.cl-note-badge.root {
  background: var(--rust-bg);
  border-color: var(--rust);
  color: var(--rust-hi);
}

@media (max-width: 600px) {
  .cl-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; }
  .chord-library { padding: 0.75rem; }
}
</style>
