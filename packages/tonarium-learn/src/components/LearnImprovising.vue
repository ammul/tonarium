<script setup>
import { ref } from 'vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { IMPROV_CHORD_TYPES as CHORD_TYPES, IMPROV_EXAMPLES } from '../constants/chordTypes.js'

const emit = defineEmits(['navigate'])

const openChordIdx = ref(null)

function toggleChord(i) {
  openChordIdx.value = openChordIdx.value === i ? null : i
}

function playImprovExample(chordSemis, noteSemi) {
  const root = 60
  playChord(chordSemis.map(s => root + s), 2.5)
  setTimeout(() => playNote(root + noteSemi, 2.0), 500)
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Improvising is about choosing notes that sound <strong>intentional</strong> — match your scale to the chord underneath you.</p>

    <div class="tc-learn-improv-cheat-box">
      <span class="tc-learn-improv-cheat-label">Cheat code</span>
      <p class="tc-learn-improv-cheat-text"><strong>Minor pentatonic works over almost everything.</strong> It's only 5 notes and none of them clash. Start here, always.</p>
    </div>

    <div class="tc-learn-improv-list">
      <div
        v-for="(ct, i) in CHORD_TYPES"
        :key="ct.chord"
        class="card tc-learn-improv-item"
        :class="{ open: openChordIdx === i }"
        @click="toggleChord(i)"
      >
        <div class="tc-learn-improv-item-header">
          <span class="tc-learn-improv-chord-name">{{ ct.chord }}</span>
          <div class="tc-learn-improv-scales">
            <span v-for="sc in ct.scales" :key="sc.name" class="tc-learn-improv-scale-pill">
              <span class="tc-learn-improv-isp-name">{{ sc.name }}</span>
              <span class="tc-learn-improv-isp-desc">{{ sc.desc }}</span>
            </span>
          </div>
          <span class="tc-learn-improv-toggle">{{ openChordIdx === i ? '▲' : '▼' }}</span>
        </div>

        <div v-if="openChordIdx === i" class="tc-learn-improv-demo" @click.stop>
          <div class="tc-learn-improv-demo-hint">Chord plays first, then the note (all in C)</div>
          <div class="tc-learn-improv-ie-columns">
            <div class="tc-learn-improv-ie-col">
              <div class="tc-learn-improv-ie-col-label good">Works well</div>
              <button
                v-for="n in IMPROV_EXAMPLES[i].goodNotes"
                :key="n.semi"
                class="tc-learn-improv-ie-note-btn good"
                @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[i].chordSemi, n.semi)"
              >
                <span class="tc-learn-improv-ie-note-name">{{ n.name }}</span>
                <span class="tc-learn-improv-ie-note-why">{{ n.why }}</span>
              </button>
            </div>
            <div class="tc-learn-improv-ie-col">
              <div class="tc-learn-improv-ie-col-label bad">Clashes</div>
              <button
                v-for="n in IMPROV_EXAMPLES[i].badNotes"
                :key="n.semi"
                class="tc-learn-improv-ie-note-btn bad"
                @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[i].chordSemi, n.semi)"
              >
                <span class="tc-learn-improv-ie-note-name">{{ n.name }}</span>
                <span class="tc-learn-improv-ie-note-why">{{ n.why }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="step-bridge">
      Try it live: Jam Mode highlights safe notes on the pads as each chord plays.
    </div>

    <button class="btn btn-accent btn-block" @click="emit('navigate', 'home')">Open Jam Mode &rarr;</button>
  </div>
</template>

<style scoped>
/* step-content, step-intro, step-bridge — from learn.css */

.tc-learn-improv-cheat-box {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--surface2));
}

.tc-learn-improv-cheat-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.tc-learn-improv-cheat-text {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text2);
  line-height: 1.55;
}

.tc-learn-improv-cheat-text strong { color: var(--accent); }

.tc-learn-improv-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tc-learn-improv-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: border-color 0.15s;
}

.tc-learn-improv-item.open {
  border-color: var(--accent-mid);
}

.tc-learn-improv-item-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tc-learn-improv-chord-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.tc-learn-improv-scales {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  flex: 1;
}

.tc-learn-improv-scale-pill {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
}

.tc-learn-improv-isp-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text2);
}

.tc-learn-improv-isp-desc {
  font-size: 0.68rem;
  color: var(--text4);
}

.tc-learn-improv-toggle {
  font-size: 0.65rem;
  color: var(--text4);
  flex-shrink: 0;
  padding-top: 0.15rem;
}

.tc-learn-improv-demo {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding-top: 0.4rem;
  border-top: 1px solid var(--border);
}

.tc-learn-improv-demo-hint {
  font-size: 0.75rem;
  color: var(--text4);
}

.tc-learn-improv-ie-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.tc-learn-improv-ie-col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tc-learn-improv-ie-col-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding-bottom: 0.25rem;
}

.tc-learn-improv-ie-col-label.good { color: var(--good); }
.tc-learn-improv-ie-col-label.bad  { color: var(--bad); }

.tc-learn-improv-ie-note-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  padding: 0.45rem 0.65rem;
  border-radius: 7px;
  border: 1px solid var(--border2);
  background: var(--input);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s;
}

.tc-learn-improv-ie-note-btn:hover { background: var(--surface); }

.tc-learn-improv-ie-note-btn.good { border-left: 3px solid var(--good-dim); }
.tc-learn-improv-ie-note-btn.bad  { border-left: 3px solid var(--bad-dim); }

.tc-learn-improv-ie-note-btn.good:hover { border-color: var(--good); border-left-color: var(--good); }
.tc-learn-improv-ie-note-btn.bad:hover  { border-color: var(--bad);  border-left-color: var(--bad); }

.tc-learn-improv-ie-note-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.tc-learn-improv-ie-note-why {
  font-size: 0.74rem;
  color: var(--text4);
  line-height: 1.3;
}
</style>
