<script setup>
import { ref } from 'vue'
import { playChord, stopAllNotes } from '@/audio/audioEngine.js'
import { NoteStripPicker } from '@tonarium/vue'
import { NOTES, ALL_PROGRESSIONS } from '@tonarium/core'
import { sessionProgression, sessionKey, sessionBpm } from '@/state/sessionState.js'

const emit = defineEmits(['navigate'])

const CHROMATIC   = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
const DIA_TYPES   = ['maj','min','min','maj','maj','min','dim']
const CHORD_ITVS  = { maj:[0,4,7], min:[0,3,7], dim:[0,3,6] }
const ROMAN       = ['I','ii','iii','IV','V','vi','vii°']

const SONG_TEMPLATES = [
  {
    name: 'Pop song',
    desc: 'I-V-vi-IV is the most played progression in modern pop. Verse sets up the story, chorus pays it off.',
    sections: [
      { label: 'Verse',  role: 'Quieter, builds anticipation',    degIdx: [0, 4, 5, 3] },
      { label: 'Chorus', role: 'The hook. Biggest energy.',        degIdx: [0, 3, 4]    },
      { label: 'Bridge', role: 'Contrast before the final chorus', degIdx: [5, 3, 0, 4] },
    ],
  },
  {
    name: '12-bar blues',
    desc: 'A closed three-section loop. The form that built rock, jazz, and blues. Not verse/chorus; just three turns of the wheel.',
    sections: [
      { label: 'Bars 1–4',  role: 'Establish the key',           degIdx: [0, 0, 0, 0] },
      { label: 'Bars 5–8',  role: 'Build tension with IV',       degIdx: [3, 3, 0, 0] },
      { label: 'Bars 9–12', role: 'Resolve with the turnaround', degIdx: [4, 3, 0, 4] },
    ],
  },
  {
    name: 'Folk / country',
    desc: 'Three chords and the truth. I, IV, and V cover hundreds of songs. Verse tells the story, chorus lands it.',
    sections: [
      { label: 'Verse',  role: 'Plain, grounded storytelling', degIdx: [0, 3, 0, 4] },
      { label: 'Chorus', role: 'Full resolution, memorable',   degIdx: [0, 3, 4, 0] },
      { label: 'Bridge', role: 'Minor colour, brief contrast', degIdx: [5, 3, 4, 0] },
    ],
  },
]

const songRoot      = ref(0)  // C-based index
const activeSection = ref(null)  // { templateIdx, sectionIdx }
let   _timers       = []

function pickRoot(i) {
  _timers.forEach(clearTimeout); _timers = []
  stopAllNotes()
  songRoot.value   = i
  activeSection.value = null
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

function isSectionActive(ti, si) {
  return activeSection.value?.ti === ti && activeSection.value?.si === si
}

function tapSection(ti, si) {
  _timers.forEach(clearTimeout); _timers = []
  stopAllNotes()
  if (isSectionActive(ti, si)) {
    activeSection.value = null
    return
  }
  activeSection.value = { ti, si, chordIdx: null }
  const { degIdx } = SONG_TEMPLATES[ti].sections[si]
  degIdx.forEach((deg, ci) => {
    _timers.push(setTimeout(() => {
      activeSection.value = { ti, si, chordIdx: ci }
      playChord(chordMidis(songRoot.value, deg), 0.9)
    }, ci * 900))
  })
  _timers.push(setTimeout(() => {
    activeSection.value = { ti, si, chordIdx: null }
  }, degIdx.length * 900))
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Songs are built from repeating sections. Each section has a job: verse tells the story, chorus makes the hook, bridge adds contrast. Learning the pattern makes any song easier to figure out and write.</p>

    <div class="tc-learn-song-concepts">
      <div class="tc-learn-song-concept-card">
        <span class="tc-learn-song-concept-label">Verse</span>
        <span class="tc-learn-song-concept-desc">Quieter, more words, tells the story. Uses a progression that feels unresolved, pulling toward the chorus.</span>
      </div>
      <div class="tc-learn-song-concept-card">
        <span class="tc-learn-song-concept-label chorus">Chorus</span>
        <span class="tc-learn-song-concept-desc">Loudest, most repeated, most memorable. The hook lands here: strong resolution, clear chords.</span>
      </div>
      <div class="tc-learn-song-concept-card">
        <span class="tc-learn-song-concept-label bridge">Bridge</span>
        <span class="tc-learn-song-concept-desc">Appears once, adds contrast. Often goes to an unexpected chord to reset energy before the final chorus.</span>
      </div>
    </div>

    <div class="picker-row">
      <span class="picker-label">Key</span>
      <NoteStripPicker small :from-index="songRoot" @note-down="pickRoot" />
    </div>

    <div class="tc-learn-song-templates">
      <div v-for="(tmpl, ti) in SONG_TEMPLATES" :key="ti" class="card tc-learn-song-tmpl-card">
        <div class="tc-learn-song-tmpl-header">
          <span class="tc-learn-song-tmpl-name">{{ tmpl.name }}</span>
          <span class="tc-learn-song-tmpl-desc">{{ tmpl.desc }}</span>
        </div>
        <div class="tc-learn-song-tmpl-sections">
          <button
            v-for="(sec, si) in tmpl.sections"
            :key="si"
            class="tc-learn-song-section-btn"
            :class="{ active: isSectionActive(ti, si) }"
            @click="tapSection(ti, si)"
          >
            <div class="tc-learn-song-sec-top">
              <span class="tc-learn-song-sec-label">{{ sec.label }}</span>
              <span class="tc-learn-song-sec-role">{{ sec.role }}</span>
            </div>
            <div class="tc-learn-song-sec-chords">
              <span
                v-for="(di, ci) in sec.degIdx"
                :key="ci"
                class="tc-learn-song-sec-chord-pill"
                :class="[DIA_TYPES[di], { playing: isSectionActive(ti, si) && activeSection.chordIdx === ci }]"
              >
                <span class="tc-learn-song-scp-roman">{{ ROMAN[di] }}</span>
                <span class="tc-learn-song-scp-name">{{ chordLabel(songRoot, di) }}</span>
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="tc-learn-song-cta">
      Build your own song structure in <strong>Progression Builder</strong>. Enter chords as symbols like <code>C F G Am</code>.
      <button class="btn btn-accent btn-block" style="margin-top:0.75rem" @click="emit('navigate', 'builder')">
        Open Progression Builder &rarr;
      </button>
    </div>

    <div class="tc-learn-song-cta">
      Ready to play? <strong>Jam Mode</strong> loops a progression with a drum beat while you improvise. Highlights follow each chord.
      <button class="btn btn-accent btn-block" style="margin-top:0.75rem" @click="emit('navigate', 'home')">
        Try in Jam Mode &rarr;
      </button>
    </div>
  </div>
</template>

<style scoped>
/* step-content, step-intro — from learn.css */

.tc-learn-song-concepts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.tc-learn-song-concept-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.7rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
}

.tc-learn-song-concept-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--accent-lo);
}

.tc-learn-song-concept-label.chorus { color: var(--accent-hi); }
.tc-learn-song-concept-label.bridge { color: var(--accent); }

.tc-learn-song-concept-desc {
  font-size: 0.77rem;
  color: var(--text3);
  line-height: 1.45;
}

/* picker-row — matches LearnProgressions */
.picker-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.picker-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}

.tc-learn-song-templates {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.tc-learn-song-tmpl-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tc-learn-song-tmpl-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tc-learn-song-tmpl-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.tc-learn-song-tmpl-desc {
  font-size: 0.78rem;
  color: var(--text3);
  line-height: 1.4;
}

.tc-learn-song-tmpl-sections {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tc-learn-song-section-btn {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.6rem 0.75rem;
  border-radius: 7px;
  border: 1px solid var(--border2);
  background: var(--input);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.tc-learn-song-section-btn:hover { border-color: var(--accent-mid); }

.tc-learn-song-section-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.tc-learn-song-sec-top {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.tc-learn-song-sec-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text2);
}

.tc-learn-song-section-btn.active .tc-learn-song-sec-label { color: var(--accent); }

.tc-learn-song-sec-role {
  font-size: 0.74rem;
  color: var(--text4);
}

.tc-learn-song-sec-chords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tc-learn-song-sec-chord-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
  padding: 0.2rem 0.45rem;
  border-radius: 5px;
  background: var(--raised);
  border: 1px solid var(--border2);
  transition: background 0.1s, border-color 0.1s;
}

.tc-learn-song-sec-chord-pill.playing {
  background: var(--selected);
  border-color: var(--accent);
  box-shadow: 0 0 6px var(--accent-glow);
}

.tc-learn-song-scp-roman {
  font-size: 0.6rem;
  color: var(--text5);
  font-weight: 700;
  letter-spacing: 0.03em;
}

.tc-learn-song-scp-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent);
}

.tc-learn-song-sec-chord-pill.min .tc-learn-song-scp-name { color: var(--accent-lo); }
.tc-learn-song-sec-chord-pill.dim .tc-learn-song-scp-name { color: var(--text3); }

.tc-learn-song-sec-chord-pill.playing .tc-learn-song-scp-name { color: var(--accent-hi); }

.tc-learn-song-cta {
  padding: 0.85rem 1rem;
  border-radius: 8px;
  border: 1px dashed var(--border2);
  font-size: 0.83rem;
  color: var(--text3);
}

.tc-learn-song-cta strong { color: var(--accent); }
.tc-learn-song-cta code {
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 3px;
  padding: 0.05em 0.35em;
  font-size: 0.82em;
  color: var(--text2);
}

@media (max-width: 500px) {
  .tc-learn-song-concepts { grid-template-columns: 1fr; }
}
</style>
