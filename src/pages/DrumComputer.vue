<script setup>
import { ref } from 'vue'
import { pattern, isPlaying, currentStep, clearPattern, toggleCell, INSTRUMENTS } from '@/audio/drumEngine.js'
import { BEAT_PATTERNS } from '@tonarium/core'
import PageHeader from '@/components/ui/PageHeader.vue'
import { sessionBeatIdx, sessionBpm } from '@/state/sessionState.js'
import { startTransport, stopTransport } from '@/audio/transportClock.js'
import { buildPatternFromBeat } from '@/utils/beatUtils.js'

const emit = defineEmits(['navigate'])

const loadedGroove = ref(null)

function loadGroove(pi) {
  if (isPlaying.value) stopTransport()
  if (loadedGroove.value === pi) {
    loadedGroove.value = null
    clearPattern()
    return
  }
  pattern.value = buildPatternFromBeat(pi)
  loadedGroove.value = pi
  if (BEAT_PATTERNS[pi].bpm) sessionBpm.value = BEAT_PATTERNS[pi].bpm
  startTransport()
}

function useInJam() {
  sessionBeatIdx.value = loadedGroove.value
  emit('navigate', 'jam')
}
</script>

<template>
  <div class="tc-drum">
    <PageHeader title="Drum Computer" subtitle="loop continues while switching tabs" />

    <div class="tc-drum-groove-picker">
      <span class="tc-drum-groove-label">Grooves</span>
      <div class="tc-drum-groove-btns">
        <button
          v-for="(gp, pi) in BEAT_PATTERNS"
          :key="gp.name"
          class="tc-drum-groove-btn"
          :class="{ active: loadedGroove === pi }"
          @click="loadGroove(pi)"
        >
          <span class="tc-drum-groove-name">{{ gp.name }}</span>
          <span class="tc-drum-groove-genre">{{ gp.genre }} · {{ gp.bpm }} BPM</span>
        </button>
      </div>
    </div>

    <div class="tc-drum-transport">
      <button
        class="tc-drum-transport-btn"
        :class="{ active: isPlaying }"
        @click="isPlaying ? stopTransport() : startTransport()"
      >{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <button class="tc-drum-transport-btn" @click="clearPattern">Clear</button>
      <button class="tc-drum-transport-btn tc-drum-jam-btn" @click="useInJam">Use in Jam</button>
      <div class="tc-drum-bpm-control">
        <label>BPM</label>
        <input type="number" v-model.number="sessionBpm" min="60" max="200" class="tc-drum-bpm-input" />
      </div>
    </div>

    <div class="tc-drum-grid-wrap">
      <div class="tc-drum-step-header">
        <div class="tc-drum-inst-spacer"></div>
        <div
          v-for="s in 16"
          :key="s"
          class="tc-drum-step-num"
          :class="{
            active:     isPlaying && currentStep === s - 1,
            'beat-start': (s - 1) % 4 === 0,
          }"
        >{{ s }}</div>
      </div>

      <div v-for="(inst, i) in INSTRUMENTS" :key="inst" class="tc-drum-inst-row">
        <div class="tc-drum-inst-name">{{ inst }}</div>
        <button
          v-for="s in 16"
          :key="s"
          class="tc-drum-step-btn"
          :class="{
            on:           pattern[i][s - 1],
            playing:      isPlaying && currentStep === s - 1,
            'beat-start': (s - 1) % 4 === 0,
          }"
          @click="toggleCell(i, s - 1)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tc-drum {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.tc-drum-groove-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1.5rem 0 0;
}

.tc-drum-groove-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.tc-drum-groove-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tc-drum-groove-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s;
}

.tc-drum-groove-btn:hover { border-color: var(--accent); }

.tc-drum-groove-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.tc-drum-groove-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text2);
}

.tc-drum-groove-btn.active .tc-drum-groove-name { color: var(--accent); }

.tc-drum-groove-genre {
  font-size: 0.65rem;
  color: var(--text5);
}

.tc-drum-transport {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.tc-drum-transport-btn {
  padding: 0.4rem 1.1rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.tc-drum-transport-btn:hover  { border-color: var(--accent); color: var(--text); }
.tc-drum-transport-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.tc-drum-transport-btn.tc-drum-jam-btn { font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; }

.tc-drum-bpm-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.tc-drum-bpm-control label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tc-drum-bpm-input {
  width: 4.5rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.9rem;
  text-align: center;
}

.tc-drum-bpm-input:focus { outline: none; border-color: var(--accent); }

.tc-drum-grid-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
}

.tc-drum-step-header,
.tc-drum-inst-row {
  display: grid;
  grid-template-columns: 7rem repeat(16, minmax(1.6rem, 1fr));
  gap: 0.2rem;
  margin-bottom: 0.2rem;
  min-width: 560px;
}

.tc-drum-step-num {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text5);
  padding: 0.15rem 0;
  border-radius: 3px;
  transition: color 0.1s, background 0.1s;
}

.tc-drum-step-num.beat-start {
  color: var(--text4);
  border-left: 1px solid var(--border2);
}

.tc-drum-step-num.active {
  color: var(--accent);
  background: var(--accent-bg);
}

.tc-drum-inst-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text3);
  display: flex;
  align-items: center;
  padding-right: 0.4rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tc-drum-step-btn {
  height: 2rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s;
  padding: 0;
}

.tc-drum-step-btn.beat-start {
  border-left: 2px solid var(--border2);
}

.tc-drum-step-btn:hover { background: var(--border); }

.tc-drum-step-btn.on {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}

.tc-drum-step-btn.on.beat-start {
  border-left-color: var(--accent-mid);
}

.tc-drum-step-btn.on.playing {
  background: var(--accent);
  border-color: var(--accent);
}

.tc-drum-step-btn.playing:not(.on) {
  background: var(--border3);
}

@media (max-width: 600px) {
  .tc-drum { padding: 1.25rem 0.75rem; }
  .tc-drum-step-header, .tc-drum-inst-row { grid-template-columns: 4.5rem repeat(16, minmax(1.4rem, 1fr)); min-width: 460px; }
  .tc-drum-inst-name { font-size: 0.68rem; padding-right: 0.25rem; }
  .tc-drum-step-btn { height: 1.75rem; }
  .tc-drum-step-num { font-size: 0.6rem; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-drum { padding: 0.75rem 1rem; }
  .tc-drum-transport { margin: 0.5rem 0; }
  .tc-drum-step-btn { height: 1.6rem; }
}
</style>
