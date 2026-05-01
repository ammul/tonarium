<script setup>
import { pattern, isPlaying, currentStep, toggleCell, INSTRUMENTS } from '@/audio/drumEngine.js'
</script>

<template>
  <div class="seq-drum-grid-wrap">
    <div class="seq-drum-step-header">
      <div class="seq-drum-inst-spacer"></div>
      <div
        v-for="s in 16"
        :key="s"
        class="seq-drum-step-num"
        :class="{
          active:     isPlaying && currentStep === s - 1,
          'beat-start': (s - 1) % 4 === 0,
        }"
      >{{ s }}</div>
    </div>

    <div v-for="(inst, i) in INSTRUMENTS" :key="inst" class="seq-drum-inst-row">
      <div class="seq-drum-inst-name">{{ inst }}</div>
      <button
        v-for="s in 16"
        :key="s"
        class="seq-drum-step-btn"
        :class="{
          on:           pattern[i][s - 1],
          playing:      isPlaying && currentStep === s - 1,
          'beat-start': (s - 1) % 4 === 0,
        }"
        @click="toggleCell(i, s - 1)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.seq-drum-grid-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
}

.seq-drum-step-header,
.seq-drum-inst-row {
  display: grid;
  grid-template-columns: 7rem repeat(16, minmax(1.6rem, 1fr));
  gap: 0.2rem;
  margin-bottom: 0.2rem;
  min-width: 560px;
}

.seq-drum-step-num {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text5);
  padding: 0.15rem 0;
  border-radius: 3px;
  transition: color 0.1s, background 0.1s;
}

.seq-drum-step-num.beat-start {
  color: var(--text4);
  border-left: 1px solid var(--border2);
}

.seq-drum-step-num.active {
  color: var(--accent);
  background: var(--accent-bg);
}

.seq-drum-inst-name {
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

.seq-drum-step-btn {
  height: 2rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  transition: background 0.1s, border-color 0.1s;
  padding: 0;
}

.seq-drum-step-btn.beat-start {
  border-left: 2px solid var(--border2);
}

.seq-drum-step-btn:hover { background: var(--border); }

.seq-drum-step-btn.on {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}

.seq-drum-step-btn.on.beat-start {
  border-left-color: var(--accent-mid);
}

.seq-drum-step-btn.on.playing {
  background: var(--accent);
  border-color: var(--accent);
}

.seq-drum-step-btn.playing:not(.on) {
  background: var(--border3);
}

@media (max-width: 600px) {
  .seq-drum-step-header, .seq-drum-inst-row { grid-template-columns: 4.5rem repeat(16, minmax(1.4rem, 1fr)); min-width: 460px; }
  .seq-drum-inst-name { font-size: 0.68rem; padding-right: 0.25rem; }
  .seq-drum-step-btn { height: 1.75rem; }
  .seq-drum-step-num { font-size: 0.6rem; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .seq-drum-step-btn { height: 1.6rem; }
}
</style>
