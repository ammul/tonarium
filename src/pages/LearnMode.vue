<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { pattern as drumPattern, play as drumPlay, pause as drumPause, isPlaying as drumIsPlaying, currentStep as drumCurrentStep } from '@/audio/drumEngine.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'
import LearnStepNav from '@/components/learn/LearnStepNav.vue'
import LearnRootNotes from '@/components/learn/LearnRootNotes.vue'
import LearnIntervals from '@/components/learn/LearnIntervals.vue'
import LearnScales from '@/components/learn/LearnScales.vue'
import LearnProgressions from '@/components/learn/LearnProgressions.vue'

const emit = defineEmits(['navigate'])

const CHORD_TYPES = [
  {
    chord: 'Major chord',
    def:   'Bright, resolved. Root + major 3rd (4 semitones) + 5th (7 semitones).',
    itvs:  [0, 4, 7],
    scales: [
      { name:'Major pentatonic', desc:'always safe' },
      { name:'Major scale',      desc:'full palette' },
      { name:'Mixolydian',       desc:'bluesy edge' },
    ],
  },
  {
    chord: 'Minor chord',
    def:   'Dark, emotional. Like major but the 3rd is flattened by one semitone (3 semitones).',
    itvs:  [0, 3, 7],
    scales: [
      { name:'Minor pentatonic', desc:'easy, no clashes' },
      { name:'Natural minor',    desc:'dark and expressive' },
      { name:'Dorian',           desc:'soulful minor' },
    ],
  },
  {
    chord: 'Dominant 7th',
    def:   'Tense, bluesy. A major chord with a flattened 7th (10 semitones) added — wants to resolve.',
    itvs:  [0, 4, 7, 10],
    scales: [
      { name:'Mixolydian',   desc:'natural match' },
      { name:'Blues scale',  desc:'gritty tension' },
    ],
  },
]

const BEAT_PATTERNS = [
  {
    name: 'Basic rock beat',
    desc: 'Kick on beats 1 and 3, snare on 2 and 4, hi-hat on every 8th note. The foundation of rock, pop, and almost everything else.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    ],
  },
  {
    name: 'Four-on-the-floor',
    desc: 'Kick on every beat, open hi-hat on the offbeats. The backbone of house, techno, and dance music.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
    ],
  },
  {
    name: 'Syncopated kick',
    desc: 'Kick displaced off the beat adds forward motion and groove. Snare still holds down 2 and 4 as the anchor.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    ],
  },
]

const BEAT_TIPS = [
  { num: '1', text: 'The <strong>backbeat</strong> is everything. Snare on beats 2 and 4 is what makes music groove rather than march. Lock that in first.' },
  { num: '2', text: '<strong>Beats 1, 5, 9, 13</strong> in the drum computer are the four quarter-note beats of one bar. Kick and snare live here.' },
  { num: '3', text: '<strong>Hi-hats subdivide time.</strong> 8th notes (every other step) feel steady. 16th notes (every step) feel urgent. Offbeat 8ths feel bouncy.' },
  { num: '4', text: '<strong>Leave space.</strong> A kick on every 16th step is noise, not a beat. What you don\'t play shapes the groove as much as what you do.' },
]

const STEPS = ['Root Notes', 'Intervals', 'Scales', 'Progressions', 'Chords', 'Improvising', 'Beats']
const step  = ref(0)

// ── Step 4: Chords ───────────────────────────────────────────────────────────
const chordsRoot = ref(0)

// ── Step 5: Improvising ──────────────────────────────────────────────────────
const improvChordIdx = ref(0)

const IMPROV_EXAMPLES = [
  {
    chordSemi: [0, 4, 7],
    goodNotes: [
      { semi: 2,  name: 'D',  why: 'Major 2nd — stepwise, bright' },
      { semi: 9,  name: 'A',  why: 'Major 6th — warm, uplifting' },
    ],
    badNotes: [
      { semi: 1,  name: 'C#', why: 'Minor 2nd — clashes immediately' },
      { semi: 3,  name: 'Eb', why: 'Minor 3rd — fights the major sound' },
    ],
  },
  {
    chordSemi: [0, 3, 7],
    goodNotes: [
      { semi: 3,  name: 'Eb', why: 'Minor 3rd — chord tone, dark' },
      { semi: 10, name: 'Bb', why: 'Minor 7th — Dorian/natural minor' },
    ],
    badNotes: [
      { semi: 4,  name: 'E',  why: 'Major 3rd — fights the minor 3rd' },
      { semi: 11, name: 'B',  why: 'Major 7th — ugly clash with Bb' },
    ],
  },
  {
    chordSemi: [0, 4, 7, 10],
    goodNotes: [
      { semi: 10, name: 'Bb', why: 'Minor 7th — the defining note' },
      { semi: 5,  name: 'F',  why: 'Perfect 4th — Mixolydian home' },
    ],
    badNotes: [
      { semi: 11, name: 'B',  why: 'Major 7th — contradicts the ♭7' },
      { semi: 6,  name: 'F#', why: 'Tritone — maximum tension' },
    ],
  },
]

function playImprovExample(chordSemis, noteSemi) {
  const root = 60
  playChord(chordSemis.map(s => root + s), 2.5)
  setTimeout(() => playNote(root + noteSemi, 2.0), 500)
}

// ── Step 5: Beats ────────────────────────────────────────────────────────────
const loadedPattern = ref(null)
const BEAT_INST_MAP = { 'Kick': 0, 'Snare': 1, 'Hi-Hat': 3 }

function buildDrumPattern(pi) {
  const newPattern = Array.from({ length: 9 }, () => new Array(16).fill(false))
  for (const row of BEAT_PATTERNS[pi].rows) {
    const instIdx = BEAT_INST_MAP[row.name]
    if (instIdx !== undefined) newPattern[instIdx] = row.steps.map(s => s === 1)
  }
  return newPattern
}

function loadBeat(pi) {
  if (drumIsPlaying.value) drumPause()
  if (loadedPattern.value === pi) {
    loadedPattern.value = null
    return
  }
  drumPattern.value = buildDrumPattern(pi)
  loadedPattern.value = pi
  drumPlay()
}

function editBeat(pi) {
  if (drumIsPlaying.value) drumPause()
  drumPattern.value = buildDrumPattern(pi)
  loadedPattern.value = pi
  emit('navigate', 'drums')
}

watch(step, (newStep, oldStep) => {
  if (oldStep === 6 && drumIsPlaying.value) drumPause()
})

onUnmounted(() => {
  if (drumIsPlaying.value) drumPause()
})
</script>

<template>
  <div class="learn-mode">

    <!-- Step navigation -->
    <LearnStepNav :steps="STEPS" :model-value="step" @update:model-value="step = $event" />

    <!-- ── Step 1: Root Notes ────────────────────────────────────────────── -->
    <LearnRootNotes v-if="step === 0" />

    <!-- ── Step 2: Intervals ─────────────────────────────────────────────── -->
    <LearnIntervals v-if="step === 1" />

    <!-- ── Step 3: Scales ───────────────────────────────────────────────── -->
    <LearnScales v-if="step === 2" />

    <!-- ── Step 4: Progressions ─────────────────────────────────────────── -->
    <LearnProgressions v-if="step === 3" />

    <!-- ── Step 4: Chords ───────────────────────────────────────────────── -->
    <div v-if="step === 4" class="step-content">
      <p class="step-intro">A <strong>chord</strong> is three or more notes played at once. Just three chord types are behind most of the music you know — they differ only by one note.</p>

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
          class="chord-type-card"
        >
          <div class="ctc-main">
            <div class="ctc-text">
              <span class="ctc-name">{{ ct.chord }}</span>
              <span class="ctc-def">{{ ct.def }}</span>
            </div>
            <button
              class="ctc-play"
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

    <!-- ── Step 5: Improvising ───────────────────────────────────────────── -->
    <div v-if="step === 5" class="step-content">
      <p class="step-intro">Improvising is about choosing notes that sound <strong>intentional</strong>. The key: match your scale to the chord type you're playing over.</p>

      <div class="improv-list">
        <div v-for="ct in CHORD_TYPES" :key="ct.chord" class="improv-item">
          <span class="improv-chord-name">{{ ct.chord }}</span>
          <div class="improv-scales">
            <span v-for="sc in ct.scales" :key="sc.name" class="improv-scale-pill">
              <span class="isp-name">{{ sc.name }}</span>
              <span class="isp-desc">{{ sc.desc }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="tips">
        <div class="tip">
          <span class="tip-num">1</span>
          <span>Start with <strong>minor pentatonic</strong> — 5 notes, no clashes, works over almost anything minor.</span>
        </div>
        <div class="tip">
          <span class="tip-num">2</span>
          <span>Land on <strong>chord tones</strong> (root, 3rd, 5th) — they resolve. Other notes work best as passing notes.</span>
        </div>
        <div class="tip">
          <span class="tip-num">3</span>
          <span><strong>Rhythm beats note choice.</strong> One confident two-note groove sounds better than a hundred random pitches.</span>
        </div>
      </div>

      <div class="improv-examples">
        <div class="ie-header">
          <span class="ie-title">Hear the difference</span>
          <span class="ie-subtitle">Chord plays first, then the note — all in C</span>
        </div>
        <div class="ie-chord-picker">
          <button
            v-for="(ct, i) in CHORD_TYPES"
            :key="ct.chord"
            class="ie-chord-btn"
            :class="{ active: improvChordIdx === i }"
            @click="improvChordIdx = i"
          >{{ ct.chord }}</button>
        </div>
        <div class="ie-columns">
          <div class="ie-col">
            <div class="ie-col-label good">Works well</div>
            <button
              v-for="n in IMPROV_EXAMPLES[improvChordIdx].goodNotes"
              :key="n.semi"
              class="ie-note-btn good"
              @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[improvChordIdx].chordSemi, n.semi)"
            >
              <span class="ie-note-name">{{ n.name }}</span>
              <span class="ie-note-why">{{ n.why }}</span>
            </button>
          </div>
          <div class="ie-col">
            <div class="ie-col-label bad">Clashes</div>
            <button
              v-for="n in IMPROV_EXAMPLES[improvChordIdx].badNotes"
              :key="n.semi"
              class="ie-note-btn bad"
              @pointerdown.prevent="playImprovExample(IMPROV_EXAMPLES[improvChordIdx].chordSemi, n.semi)"
            >
              <span class="ie-note-name">{{ n.name }}</span>
              <span class="ie-note-why">{{ n.why }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="improv-cta">
        Try it in <strong>Jam Mode</strong> — pick a key and scale to see safe pads highlighted.
      </div>
    </div>

    <!-- ── Step 6: Beats ─────────────────────────────────────────────────── -->
    <div v-if="step === 6" class="step-content">
      <p class="step-intro">A good beat is built from three layers: <strong>kick</strong>, <strong>snare</strong>, and <strong>hi-hat</strong>. Each has a job. Together they create rhythm that makes people move.</p>

      <div class="beat-recipe">
        <div class="beat-recipe-title">The simplest beat that works</div>
        <div class="beat-recipe-steps">
          <div class="br-step">
            <span class="br-num">1</span>
            <div><strong>Snare on beats 2 and 4.</strong> This is the backbeat — the most important rule in drumming. Get this right first, everything else is decoration.</div>
          </div>
          <div class="br-step">
            <span class="br-num">2</span>
            <div><strong>Kick on beat 1.</strong> Add beat 3 for a rock feel, or only beat 1 for something more sparse. Experiment from there.</div>
          </div>
          <div class="br-step">
            <span class="br-num">3</span>
            <div><strong>Hi-hat on every 8th note</strong> (every other step) for a steady groove. Move to every step for urgency, or just the offbeats for a bouncy feel.</div>
          </div>
        </div>
      </div>

      <div class="beat-patterns">
        <div v-for="(pattern, pi) in BEAT_PATTERNS" :key="pattern.name" class="beat-pattern">
          <div class="bp-header">
            <div class="bp-header-top">
              <span class="bp-name">{{ pattern.name }}</span>
              <div class="bp-btn-group">
                <button
                  class="bp-play-btn"
                  :class="{ active: loadedPattern === pi && drumIsPlaying }"
                  @click="loadBeat(pi)"
                >{{ loadedPattern === pi && drumIsPlaying ? 'Stop' : 'Play' }}</button>
                <button class="bp-edit-btn" @click="editBeat(pi)">Edit &rarr;</button>
              </div>
            </div>
            <span class="bp-desc">{{ pattern.desc }}</span>
          </div>
          <div class="bp-grid">
            <div class="bp-beat-nums">
              <div class="bp-inst-spacer"></div>
              <div v-for="b in 4" :key="b" class="bp-beat-num">{{ b }}</div>
            </div>
            <div v-for="row in pattern.rows" :key="row.name" class="bp-row">
              <div class="bp-inst">{{ row.name }}</div>
              <div
                v-for="(on, si) in row.steps"
                :key="si"
                class="bp-cell"
                :class="{
                  on:      on === 1,
                  'beat-1': si % 4 === 0,
                  current: drumIsPlaying && loadedPattern === pi && si === drumCurrentStep,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="beat-tips">
        <div v-for="tip in BEAT_TIPS" :key="tip.num" class="tip">
          <span class="tip-num">{{ tip.num }}</span>
          <span v-html="tip.text"></span>
        </div>
      </div>

      <button class="beat-cta" @click="emit('navigate', 'drums')">
        Build your own beat in the Drum Computer &rarr;
      </button>
    </div>

    <!-- Step footer -->
    <div class="step-footer">
      <button class="nav-btn" @click="step--" :disabled="step === 0">← Back</button>
      <span class="step-counter">{{ step + 1 }} / {{ STEPS.length }}</span>
      <button class="nav-btn" @click="step++" :disabled="step === STEPS.length - 1">Next →</button>
    </div>

  </div>
</template>

<style scoped>
.learn-mode {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Step navigation ──────────────────────────────────────────────────────── */
.step-nav {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.step-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  letter-spacing: 0.03em;
}

.step-btn:hover {
  border-color: var(--accent-mid);
  color: var(--text2);
}

.step-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

.step-btn.done {
  color: var(--accent-mid);
  border-color: var(--border2);
}

.step-num {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: var(--border2);
  color: var(--text3);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-btn.active .step-num {
  background: var(--accent);
  color: var(--bg);
}

.step-btn.done .step-num {
  background: var(--accent-mid);
  color: var(--bg);
}

/* ── Step content ─────────────────────────────────────────────────────────── */
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

/* ── Root Notes ───────────────────────────────────────────────────────────── */
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

/* ── Interval result ──────────────────────────────────────────────────────── */
.interval-result {
  min-height: 7rem;
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

.iv-name {
  font-size: clamp(1.5rem, 6vw, 2.2rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.02em;
}

.iv-semi {
  font-size: 0.82rem;
  color: var(--accent-mid);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.iv-feel {
  font-size: 0.88rem;
  color: var(--text2);
}

.iv-path {
  font-size: 0.78rem;
  color: var(--text4);
  margin-top: 0.2rem;
  letter-spacing: 0.05em;
}

.iv-hint {
  font-size: 1rem;
  color: var(--text3);
  font-weight: 600;
}

.iv-hint-sub {
  font-size: 0.82rem;
  color: var(--accent-mid);
}

/* ── Interval reference ───────────────────────────────────────────────────── */
.iv-reference {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ref-label {
  font-size: 0.72rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
}

.ref-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ref-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--input);
  font-size: 0.75rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.ref-item:hover {
  background: var(--raised);
  border-color: var(--border2);
}

.ref-item.highlight {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.ref-semi {
  color: var(--accent-mid);
  font-weight: 700;
  font-size: 0.7rem;
  min-width: 0.8rem;
}

.ref-name {
  color: var(--text3);
}

.ref-item.highlight .ref-semi { color: var(--accent); }
.ref-item.highlight .ref-name { color: var(--text2); }

/* ── Step bridge ──────────────────────────────────────────────────────────── */
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

/* ── Picker row ───────────────────────────────────────────────────────────── */
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

/* ── Scale tabs ───────────────────────────────────────────────────────────── */
.scale-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.scale-tab {
  padding: 0.35rem 0.7rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.scale-tab:hover { background: var(--raised); color: var(--text2); }
.scale-tab.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

/* ── Scale display ────────────────────────────────────────────────────────── */
.scale-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.scale-tile {
  min-width: 2.8rem;
  padding: 0.6rem 0.4rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input);
  color: var(--text5);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
}

.scale-tile.active {
  background: var(--raised);
  border-color: var(--border2);
  color: var(--text2);
}

.scale-tile.root {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
  font-size: 0.9rem;
}

.scale-tile.sharp { font-size: 0.75rem; }
.scale-tile.active.sharp { color: var(--text3); }
.scale-tile.root.sharp { color: var(--accent); font-size: 0.82rem; }

.scale-tile.playing {
  border-color: var(--accent);
  background: var(--selected);
  color: var(--accent-hi);
  box-shadow: 0 0 8px var(--accent-glow);
}

.scale-display-legend {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.sdl-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: var(--text4);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sdl-item::before {
  content: '';
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 3px;
  flex-shrink: 0;
}

.sdl-root::before {
  background: var(--accent-bg);
  border: 1px solid var(--accent);
}

.sdl-scale::before {
  background: var(--raised);
  border: 1px solid var(--border2);
}

.scale-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.scale-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.scale-feel {
  font-size: 0.85rem;
  color: var(--text3);
  flex: 1;
}

.play-scale-btn {
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--accent-mid);
  background: transparent;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}

.play-scale-btn:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

/* ── Section labels ───────────────────────────────────────────────────────── */
.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: -0.25rem;
}

/* ── Diatonic row ─────────────────────────────────────────────────────────── */
.diatonic-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.diatonic-chord {
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

.diatonic-chord:hover { background: var(--border); }
.diatonic-chord:active { transform: scale(0.94); }

.diatonic-chord.highlight {
  background: var(--selected);
  border-color: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.diatonic-chord.playing {
  background: var(--accent-bg);
  border-color: var(--accent);
  box-shadow: 0 0 10px var(--accent-glow);
}

.diatonic-chord.min { border-color: var(--border); }
.diatonic-chord.dim { opacity: 0.7; }

.dc-roman {
  font-size: 0.68rem;
  color: var(--text4);
  font-weight: 700;
  letter-spacing: 0.03em;
}

.dc-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.diatonic-chord.min .dc-name { color: var(--accent-lo); }
.diatonic-chord.dim .dc-name { color: var(--text3); }
.diatonic-chord.highlight .dc-roman { color: var(--accent-mid); }
.diatonic-chord.highlight .dc-name { color: var(--accent-hi); }

/* ── Progression list ─────────────────────────────────────────────────────── */
.prog-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prog-item {
  width: 100%;
  text-align: left;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.prog-item:hover { background: var(--border); }

.prog-item.active {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.prog-top {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.prog-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.prog-feel {
  font-size: 0.78rem;
  color: var(--text4);
}

.prog-bottom {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prog-chords {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.prog-chord-pill {
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  background: var(--input);
  color: var(--accent);
  border: 1px solid var(--border2);
}

.prog-chord-pill.min { color: var(--accent-lo); }
.prog-chord-pill.dim { color: var(--text3); }

.prog-chord-pill.playing {
  background: var(--selected);
  border-color: var(--accent);
  color: var(--accent-hi);
  box-shadow: 0 0 6px var(--accent-glow);
}

.prog-songs {
  font-size: 0.76rem;
  color: var(--text4);
  letter-spacing: 0.02em;
}

/* ── Chord types (step 4) ─────────────────────────────────────────────────── */
.chord-type-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.chord-type-card {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 0.9rem 1rem;
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

.ctc-play {
  padding: 0.3rem 0.8rem;
  border-radius: 5px;
  border: 1px solid var(--accent-mid);
  background: transparent;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.ctc-play:hover { background: var(--accent-bg); border-color: var(--accent); }

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

/* ── Improv list (step 5) ─────────────────────────────────────────────────── */
.improv-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.improv-item {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.improv-chord-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.improv-scales {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.improv-scale-pill {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
}

.isp-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text2);
}

.isp-desc {
  font-size: 0.68rem;
  color: var(--text4);
}

/* ── Tips ─────────────────────────────────────────────────────────────────── */
.tips {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tip {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.85rem;
  color: var(--text2);
  line-height: 1.5;
}

.tip strong { color: var(--accent); font-weight: 600; }

.tip-num {
  flex-shrink: 0;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--accent-bg);
  border: 1px solid var(--accent-mid);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.1rem;
}

/* ── Improv examples ──────────────────────────────────────────────────────── */
.improv-examples {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface2);
}

.ie-header {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.ie-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text2);
}

.ie-subtitle {
  font-size: 0.78rem;
  color: var(--text4);
}

.ie-chord-picker {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.ie-chord-btn {
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.ie-chord-btn:hover  { border-color: var(--accent-mid); color: var(--text2); }
.ie-chord-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.ie-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.ie-col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.ie-col-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding-bottom: 0.25rem;
}

.ie-col-label.good { color: var(--good); }
.ie-col-label.bad  { color: var(--bad); }

.ie-note-btn {
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

.ie-note-btn:hover { background: var(--surface); }

.ie-note-btn.good { border-left: 3px solid var(--good-dim); }
.ie-note-btn.bad  { border-left: 3px solid var(--bad-dim); }

.ie-note-btn.good:hover { border-color: var(--good); border-left-color: var(--good); }
.ie-note-btn.bad:hover  { border-color: var(--bad);  border-left-color: var(--bad); }

.ie-note-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.ie-note-why {
  font-size: 0.74rem;
  color: var(--text4);
  line-height: 1.3;
}

.improv-cta {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px dashed var(--border2);
  font-size: 0.83rem;
  color: var(--text3);
  text-align: center;
}

.improv-cta strong { color: var(--accent); }

/* ── Step footer ──────────────────────────────────────────────────────────── */
.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}

.nav-btn {
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.nav-btn:hover:not(:disabled) {
  color: var(--accent);
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.nav-btn:disabled {
  opacity: 0.25;
  cursor: default;
}

.step-counter {
  font-size: 0.78rem;
  color: var(--text4);
  letter-spacing: 0.05em;
}

/* ── Beat recipe ──────────────────────────────────────────────────────────── */
.beat-recipe {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.beat-recipe-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.beat-recipe-steps {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.br-step {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.84rem;
  color: var(--text2);
  line-height: 1.5;
}

.br-step strong { color: var(--accent); font-weight: 600; }

.br-num {
  flex-shrink: 0;
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--accent-bg);
  border: 1px solid var(--accent-mid);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.1rem;
}

/* ── Beats ────────────────────────────────────────────────────────────────── */
.beat-patterns {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.beat-pattern {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.bp-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.bp-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.bp-btn-group {
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
}

.bp-play-btn,
.bp-edit-btn {
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

.bp-play-btn:hover,
.bp-edit-btn:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

.bp-play-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent-hi);
}

.bp-edit-btn {
  color: var(--text3);
  border-color: var(--border2);
}

.bp-edit-btn:hover {
  color: var(--accent);
}

.bp-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.bp-desc {
  font-size: 0.78rem;
  color: var(--text3);
  line-height: 1.45;
}

.bp-grid {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
}

.bp-beat-nums,
.bp-row {
  display: grid;
  grid-template-columns: 4rem repeat(16, 1fr);
  gap: 0.15rem;
  min-width: 360px;
}

.bp-inst-spacer { }

.bp-beat-num {
  font-size: 0.6rem;
  color: var(--accent-mid);
  font-weight: 700;
  text-align: center;
  padding: 0.1rem 0;
  grid-column: span 4;
}

.bp-inst {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text4);
  display: flex;
  align-items: center;
}

.bp-cell {
  height: 1.5rem;
  border-radius: 3px;
  background: var(--input);
  border: 1px solid var(--border);
  transition: background 0.1s;
}

.bp-cell.beat-1 {
  border-left: 2px solid var(--border2);
}

.bp-cell.on {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}

.bp-cell.on.beat-1 {
  border-left-color: var(--accent);
  background: var(--accent-bg);
}

.bp-cell.current {
  border-color: var(--accent);
  background: var(--border2);
}

.bp-cell.on.current {
  background: var(--accent);
  border-color: var(--accent);
}

.beat-tips {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.beat-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--accent-mid);
  background: transparent;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: background 0.15s, border-color 0.15s;
}

.beat-cta:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 600px) {
  .learn-mode {
    padding: 1rem;
    gap: 1rem;
  }

  .diatonic-row {
    gap: 0.3rem;
  }

  .diatonic-chord {
    min-width: 2.6rem;
    padding: 0.45rem 0.35rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .learn-mode {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .step-label {
    display: none;
  }

}
</style>
