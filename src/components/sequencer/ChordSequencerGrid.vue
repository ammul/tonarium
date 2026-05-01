<script setup>
import { computed } from 'vue'
import { NOTES, CHORD_SUFFIX, CHORD_TYPES } from '@tonarium/core'
import { sessionProgression, sessionCurrentChordIdx, sessionCompPattern, sessionBeatsPerChord, sessionPlaying } from '@/state/sessionState.js'
import { currentDrumStep } from '@/audio/transportClock.js'
import { getCompHit } from '@/utils/compPatterns.js'

const chords = computed(() => sessionProgression.value?.chords ?? [])

function chordLabel(chord) {
  return NOTES[chord._rootIdx] + (CHORD_SUFFIX[chord.type] ?? '')
}

const chordRows = computed(() =>
  chords.value.map(chord => {
    const noteCount = CHORD_TYPES[chord.type]?.length ?? 0
    const cells = []
    for (let s = 0; s < 16; s++) {
      const inWindow = s < sessionBeatsPerChord.value * 4
      cells.push({
        on: inWindow && getCompHit(sessionCompPattern.value, s, sessionBeatsPerChord.value, noteCount).length > 0,
        outOfWindow: !inWindow,
        beatStart: s % 4 === 0,
      })
    }
    return { label: chordLabel(chord), cells }
  })
)

function isPlayheadCell(rowIdx, step) {
  return sessionPlaying.value
    && sessionCurrentChordIdx.value === rowIdx
    && currentDrumStep.value % (sessionBeatsPerChord.value * 4) === step
}
</script>

<template>
  <div v-if="chords.length" class="seq-chord-grid-wrap">
    <div class="seq-chord-step-header">
      <div class="seq-chord-label-spacer"></div>
      <div
        v-for="s in 16"
        :key="s"
        class="seq-chord-step-num"
        :class="{ 'beat-start': (s - 1) % 4 === 0, 'out-of-window': s - 1 >= sessionBeatsPerChord * 4 }"
      >{{ s }}</div>
    </div>

    <div
      v-for="(row, i) in chordRows"
      :key="i"
      class="seq-chord-row"
      :class="{ active: sessionCurrentChordIdx === i }"
    >
      <div class="seq-chord-label">{{ row.label }}</div>
      <div
        v-for="(cell, s) in row.cells"
        :key="s"
        class="seq-chord-cell"
        :class="{
          on: cell.on,
          'beat-start': cell.beatStart,
          'out-of-window': cell.outOfWindow,
          playing: isPlayheadCell(i, s),
        }"
      ></div>
    </div>
  </div>
  <div v-else class="seq-chord-empty">Pick a progression to see chord trigger steps.</div>
</template>

<style scoped>
.seq-chord-grid-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
}

.seq-chord-step-header,
.seq-chord-row {
  display: grid;
  grid-template-columns: 7rem repeat(16, minmax(1.6rem, 1fr));
  gap: 0.2rem;
  margin-bottom: 0.2rem;
  min-width: 560px;
  align-items: center;
}

.seq-chord-step-num {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text5);
  padding: 0.15rem 0;
  border-radius: 3px;
}

.seq-chord-step-num.beat-start {
  color: var(--text4);
  border-left: 1px solid var(--border2);
}

.seq-chord-step-num.out-of-window {
  opacity: 0.3;
}

.seq-chord-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text3);
  display: flex;
  align-items: center;
  padding-right: 0.4rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.seq-chord-row.active .seq-chord-label {
  color: var(--accent);
}

.seq-chord-cell {
  height: 1.4rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  transition: background 0.1s, border-color 0.1s, opacity 0.1s;
}

.seq-chord-cell.beat-start {
  border-left: 2px solid var(--border2);
}

.seq-chord-cell.out-of-window {
  opacity: 0.25;
}

.seq-chord-cell.on {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}

.seq-chord-row.active .seq-chord-cell.on {
  background: var(--accent);
  border-color: var(--accent);
}

.seq-chord-cell.playing {
  outline: 2px solid var(--accent);
  outline-offset: -1px;
}

.seq-chord-empty {
  padding: 1.5rem;
  color: var(--text4);
  font-size: 0.9rem;
  text-align: center;
  border: 1px dashed var(--border2);
  border-radius: 6px;
}

@media (max-width: 600px) {
  .seq-chord-step-header, .seq-chord-row { grid-template-columns: 4.5rem repeat(16, minmax(1.4rem, 1fr)); min-width: 460px; }
  .seq-chord-label { font-size: 0.75rem; padding-right: 0.25rem; }
  .seq-chord-cell { height: 1.25rem; }
  .seq-chord-step-num { font-size: 0.6rem; }
}
</style>
