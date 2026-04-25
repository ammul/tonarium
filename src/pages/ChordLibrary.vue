<script setup>
import { ref, computed } from 'vue'
import { CHORD_DETECT_TYPES, NOTES } from '@tonarium/core'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { buildRows } from '@/utils/musicUtils.js'
import ChordCardBody from '@/components/music/ChordCardBody.vue'

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
      name: NOTES[root] + suffix,
      fullName: NOTES[root] + ' ' + typeName,
      noteSet,
      noteNames: sorted.map(i => NOTES[i]),
      pressLabels: sorted.map(i => NOTES[i]),
    })
  }
})

const query = ref('')

const filteredChords = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  const cols = padSize.value === '4x4' ? 4 : 3
  return allChords
    .filter(c => {
      const nameLower = c.name.toLowerCase()
      const flatLower = flatName(c.name).toLowerCase()
      const typeSearch = c.typeName.replace(/\s*chord$/i, '').toLowerCase()
      return (
        nameLower.startsWith(q) ||
        flatLower.startsWith(q) ||
        typeSearch.includes(q)
      )
    })
    .map(c => ({ ...c, rows: buildRows(c.noteSet, c.root, cols) }))
})
</script>

<template>
  <div class="chord-library">
    <div class="cl-search-bar">
      <input
        v-model="query"
        class="cl-search-input"
        placeholder="Search: C, Dm, Bb7, major, minor 7th..."
        autocomplete="off"
        spellcheck="false"
      />
      <span v-if="query && filteredChords.length" class="cl-result-count">
        {{ filteredChords.length }} chord{{ filteredChords.length === 1 ? '' : 's' }}
      </span>
    </div>

    <div v-if="!query" class="cl-empty-state">
      <p class="cl-hint">Type a chord name to browse the library.</p>
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
      No chords found for &ldquo;{{ query }}&rdquo;
    </div>

    <div v-else class="cl-grid">
      <div v-for="chord in filteredChords" :key="chord.id" class="cl-card">
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
