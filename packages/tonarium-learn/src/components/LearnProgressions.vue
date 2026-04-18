<script setup>
import { ref, computed } from 'vue'
import { playChord, stopAllNotes } from '@/audio/audioEngine.js'
import { NoteStripPicker } from '@tonarium/vue'
import { NOTES, ALL_PROGRESSIONS } from '@tonarium/core'
import { sessionProgression, sessionKey } from '@/state/sessionState.js'
import { LEARN_PROGS as PROGS } from '../constants/progressions.js'

const emit = defineEmits(['navigate'])

const CHROMATIC  = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const MAJOR_SCALE = [0,2,4,5,7,9,11]
const DIA_TYPES   = ['maj','min','min','maj','maj','min','dim']
const ROMAN       = ['I','ii','iii','IV','V','vi','vii°']
const CHORD_ITVS  = { maj:[0,4,7], min:[0,3,7], dim:[0,3,6] }

const progRoot           = ref(0)
const activeProg         = ref(null)
const progActiveChordIdx = ref(null)
let   _progTimers        = []

function pickProgRoot(i) {
  _progTimers.forEach(clearTimeout)
  _progTimers = []
  stopAllNotes()
  progRoot.value           = i
  activeProg.value         = null
  progActiveChordIdx.value = null
}

function chordLabel(rootC, di) {
  const semi = (rootC + MAJOR_SCALE[di]) % 12
  const suf  = DIA_TYPES[di] === 'maj' ? '' : DIA_TYPES[di] === 'min' ? 'm' : '°'
  return CHROMATIC[semi] + suf
}

function chordMidis(rootC, di) {
  const semi = (rootC + MAJOR_SCALE[di]) % 12
  return CHORD_ITVS[DIA_TYPES[di]].map(i => 60 + semi + i)
}

function tapDiatonic(di) {
  playChord(chordMidis(progRoot.value, di))
}

function tapProg(pi) {
  _progTimers.forEach(clearTimeout)
  _progTimers = []
  progActiveChordIdx.value = null
  activeProg.value = activeProg.value === pi ? null : pi
  if (activeProg.value === null) return
  PROGS[pi].degIdx.forEach((deg, i) => {
    _progTimers.push(
      setTimeout(() => {
        progActiveChordIdx.value = i
        playChord(chordMidis(progRoot.value, deg), 0.9)
      }, i * 900)
    )
  })
  _progTimers.push(
    setTimeout(() => { progActiveChordIdx.value = null }, PROGS[pi].degIdx.length * 900)
  )
}

const activeDegrees = computed(() =>
  activeProg.value === null ? new Set() : new Set(PROGS[activeProg.value].degIdx)
)

const progActiveDeg = computed(() =>
  activeProg.value !== null && progActiveChordIdx.value !== null
    ? PROGS[activeProg.value].degIdx[progActiveChordIdx.value]
    : null
)

function jamWithProg(pi) {
  const fullProg = ALL_PROGRESSIONS.find(p => p.id === PROGS[pi].progId)
  if (!fullProg) return
  const ri = NOTES.indexOf('C')
  sessionProgression.value = {
    ...fullProg,
    chords: fullProg.chords.map(c => ({
      ...c,
      _rootIdx: (ri + c.degree) % 12,
      _octave: 4,
    })),
  }
  sessionKey.value = 'C'
  emit('navigate', 'home')
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Tap any chord to hear it. Tap a progression to play the loop.</p>

    <div class="picker-row">
      <span class="picker-label">Key</span>
      <NoteStripPicker
        small
        :from-index="progRoot"
        @note-down="pickProgRoot"
      />
    </div>

    <div class="tc-learn-progs-section-label">Chords in key</div>

    <div class="tc-learn-progs-diatonic-row">
      <button
        v-for="(roman, di) in ROMAN"
        :key="di"
        class="tc-learn-progs-diatonic-chord"
        :class="{
          maj:       DIA_TYPES[di] === 'maj',
          min:       DIA_TYPES[di] === 'min',
          dim:       DIA_TYPES[di] === 'dim',
          highlight: activeDegrees.has(di),
          playing:   progActiveDeg === di,
        }"
        @pointerdown.prevent="tapDiatonic(di)"
      >
        <span class="tc-learn-progs-dc-roman">{{ roman }}</span>
        <span class="tc-learn-progs-dc-name">{{ chordLabel(progRoot, di) }}</span>
      </button>
    </div>

    <div class="tc-learn-progs-section-label">Common progressions</div>

    <div class="tc-learn-progs-list">
      <button
        v-for="(prog, pi) in PROGS"
        :key="pi"
        class="card card-sm card-interactive tc-learn-progs-item"
        :class="{ active: activeProg === pi }"
        @click="tapProg(pi)"
      >
        <div class="tc-learn-progs-top">
          <span class="tc-learn-progs-name">{{ prog.name }}</span>
          <span class="tc-learn-progs-feel">{{ prog.feel }}</span>
        </div>
        <div v-if="activeProg === pi" class="tc-learn-progs-bottom">
          <div class="tc-learn-progs-chords">
            <span
              v-for="(deg, ci) in prog.degIdx"
              :key="ci"
              class="tc-learn-progs-chord-pill"
              :class="[DIA_TYPES[deg], { playing: progActiveChordIdx === ci }]"
            >{{ chordLabel(progRoot, deg) }}</span>
          </div>
          <div class="tc-learn-progs-songs">{{ prog.songs }}</div>
          <button class="btn btn-sm btn-accent tc-learn-progs-jam-btn" @click.stop="jamWithProg(pi)">Jam with this &rarr;</button>
        </div>
      </button>
    </div>

    <div class="step-bridge">
      Switch the key to any minor root and notice how the Roman numerals shift mood — the same I–V–vi–IV pattern sounds darker. These relationships work in every key, forever.
    </div>
  </div>
</template>

<style scoped>
/* step-content, step-intro — from learn.css */

.tc-learn-progs-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: -0.25rem;
}

.tc-learn-progs-diatonic-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tc-learn-progs-diatonic-chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.55rem 0.5rem;
  min-width: 3.2rem;
  border-radius: 7px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  font-family: inherit;
  user-select: none;
  touch-action: none;
  transition: background 0.12s, border-color 0.12s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.tc-learn-progs-diatonic-chord:hover { background: var(--border); }
.tc-learn-progs-diatonic-chord:active { transform: scale(0.94); }

.tc-learn-progs-diatonic-chord.highlight {
  background: var(--selected);
  border-color: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.tc-learn-progs-diatonic-chord.playing {
  background: var(--accent-bg);
  border-color: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
}

.tc-learn-progs-diatonic-chord.min { border-color: var(--border); }
.tc-learn-progs-diatonic-chord.dim { opacity: 0.7; }

.tc-learn-progs-dc-roman {
  font-size: 0.68rem;
  color: var(--text4);
  font-weight: 700;
  letter-spacing: 0.03em;
}

.tc-learn-progs-dc-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.tc-learn-progs-diatonic-chord.min .tc-learn-progs-dc-name { color: var(--accent-lo); }
.tc-learn-progs-diatonic-chord.dim .tc-learn-progs-dc-name { color: var(--text3); }
.tc-learn-progs-diatonic-chord.highlight .tc-learn-progs-dc-roman { color: var(--accent-mid); }
.tc-learn-progs-diatonic-chord.highlight .tc-learn-progs-dc-name { color: var(--accent-hi); }

.tc-learn-progs-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

/* unique properties not covered by .card + .card-sm + .card-interactive */
.tc-learn-progs-item {
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.tc-learn-progs-top {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tc-learn-progs-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.tc-learn-progs-feel {
  font-size: 0.78rem;
  color: var(--text4);
}

.tc-learn-progs-bottom {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tc-learn-progs-chords {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.tc-learn-progs-chord-pill {
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  background: var(--input);
  color: var(--accent);
  border: 1px solid var(--border2);
}

.tc-learn-progs-chord-pill.min { color: var(--accent-lo); }
.tc-learn-progs-chord-pill.dim { color: var(--text3); }

.tc-learn-progs-chord-pill.playing {
  background: var(--selected);
  border-color: var(--accent);
  color: var(--accent-hi);
  box-shadow: 0 0 6px var(--accent-glow);
}

.tc-learn-progs-songs {
  font-size: 0.76rem;
  color: var(--text4);
  letter-spacing: 0.02em;
}

.tc-learn-progs-jam-btn {
  align-self: flex-start;
  margin-top: 0.25rem;
}

@media (max-width: 600px) {
  .tc-learn-progs-diatonic-row { gap: 0.3rem; }
  .tc-learn-progs-diatonic-chord { min-width: 2.6rem; padding: 0.45rem 0.35rem; }
}
</style>
