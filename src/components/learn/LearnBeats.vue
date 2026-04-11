<script setup>
import { ref, onUnmounted } from 'vue'
import { pattern as drumPattern, play as drumPlay, pause as drumPause, isPlaying as drumIsPlaying, currentStep as drumCurrentStep } from '@/audio/drumEngine.js'
import { BEAT_PATTERNS, BEAT_TIPS } from '@/constants/beatPatterns.js'
import { buildPatternFromBeat } from '@/utils/beatUtils.js'

const emit = defineEmits(['navigate'])

const loadedPattern = ref(null)
let _navigatingToDrums = false

function loadBeat(pi) {
  if (drumIsPlaying.value) drumPause()
  if (loadedPattern.value === pi) {
    loadedPattern.value = null
    return
  }
  drumPattern.value = buildPatternFromBeat(pi)
  loadedPattern.value = pi
  drumPlay()
}

function editBeat(pi) {
  drumPattern.value = buildPatternFromBeat(pi)
  loadedPattern.value = pi
  _navigatingToDrums = true
  emit('navigate', 'drums')
}

function goToDrumComputer() {
  _navigatingToDrums = true
  emit('navigate', 'drums')
}

onUnmounted(() => {
  if (!_navigatingToDrums && drumIsPlaying.value) drumPause()
})
</script>

<template>
  <div class="step-content">
    <p class="step-intro">A good beat is built from three layers: <strong>kick</strong>, <strong>snare</strong>, and <strong>hi-hat</strong>. Each has a job. Together they create rhythm that makes people move.</p>

    <div class="beat-recipe">
      <div class="beat-recipe-title">The simplest beat that works</div>
      <div class="beat-recipe-steps">
        <div class="br-step">
          <span class="numbered-badge br-num">1</span>
          <div><strong>Snare on beats 2 and 4.</strong> This is the backbeat, the most important rule in drumming. Get this right first. Everything else is decoration.</div>
        </div>
        <div class="br-step">
          <span class="numbered-badge br-num">2</span>
          <div><strong>Kick on beat 1.</strong> Add beat 3 for a rock feel, or only beat 1 for something more sparse. Experiment from there.</div>
        </div>
        <div class="br-step">
          <span class="numbered-badge br-num">3</span>
          <div><strong>Hi-hat on every 8th note</strong> (every other step) for a steady groove. Move to every step for urgency, or just the offbeats for a bouncy feel.</div>
        </div>
      </div>
    </div>

    <div class="beat-patterns">
      <div v-for="(pattern, pi) in BEAT_PATTERNS" :key="pattern.name" class="card beat-pattern">
        <div class="bp-header">
          <div class="bp-header-top">
            <span class="bp-name">{{ pattern.name }}</span>
            <div class="bp-btn-group">
              <button
                class="btn btn-sm btn-accent bp-play-btn"
                :class="{ active: loadedPattern === pi && drumIsPlaying }"
                @click="loadBeat(pi)"
              >{{ loadedPattern === pi && drumIsPlaying ? 'Stop' : 'Play' }}</button>
              <button class="btn btn-sm bp-edit-btn" @click="editBeat(pi)">Edit &rarr;</button>
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
        <span class="numbered-badge tip-num">{{ tip.num }}</span>
        <span v-html="tip.text"></span>
      </div>
    </div>

    <button class="btn btn-accent btn-block btn-lg" @click="goToDrumComputer">
      Build your own beat in the Drum Computer &rarr;
    </button>
  </div>
</template>

<style scoped>
/* step-content, step-intro — from learn.css */

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

/* .br-num — from numbered-badge in learn.css */

.beat-patterns {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

/* unique properties not covered by .card */
.beat-pattern {
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

.tip {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.85rem;
  color: var(--text2);
  line-height: 1.5;
}

.tip strong { color: var(--accent); font-weight: 600; }

/* .tip-num — from numbered-badge in learn.css */

</style>
