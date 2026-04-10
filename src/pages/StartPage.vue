<script setup>
import { computed } from 'vue'
import JamMode from '@/pages/JamMode.vue'
import ChordProgressions from '@/pages/ChordProgressions.vue'
import DrumComputer from '@/pages/DrumComputer.vue'
import JamSessionBar from '@/components/jam/JamSessionBar.vue'
import { sessionPlaying } from '@/state/sessionState.js'
import { isPlaying as drumIsPlaying } from '@/audio/drumEngine.js'

const props = defineProps({
  openPanel: { type: String, default: null },
})

const emit = defineEmits(['navigate'])

const panels = [
  {
    id: 'chords',
    label: 'Chord Progressions',
    description: 'Browse 69 classic progressions across 10 genres, transposed to any key.',
    component: ChordProgressions,
  },
  {
    id: 'drums',
    label: 'Drum Computer',
    description: 'Build a beat from 9 synthesised instruments across 16 steps.',
    component: DrumComputer,
  },
  {
    id: 'jam',
    label: 'Jam Mode',
    description: 'Pick a key and scale. See which notes are safe to play.',
    component: JamMode,
  },
]

const panelRunning = computed(() => ({
  jam:    sessionPlaying.value,
  chords: false,
  drums:  drumIsPlaying.value,
}))
</script>

<template>
  <div class="start-page">
    <section v-if="!openPanel" class="hero">
      <p class="tagline">No sheet music required.</p>
      <p class="sub">Pick a chord progression, add a beat, and jam. The app shows you which notes sound good as each chord cycles.</p>
    </section>

    <div class="panels">
      <div
        v-for="panel in panels"
        :key="panel.id"
        class="panel"
        :class="{ open: openPanel === panel.id }"
      >
        <button class="panel-header" @click="emit('navigate', panel.id)">
          <div class="panel-header-text">
            <span class="panel-label">{{ panel.label }}</span>
            <span v-if="openPanel !== panel.id" class="panel-desc">{{ panel.description }}</span>
          </div>
          <div class="panel-header-right">
            <span v-if="openPanel !== panel.id && panelRunning[panel.id]" class="panel-running-dot"></span>
            <svg class="panel-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="4 6 8 10 12 6" />
            </svg>
          </div>
        </button>
        <div class="panel-body-wrapper">
          <div class="panel-body-inner">
            <component :is="panel.component" @navigate="emit('navigate', $event)" />
          </div>
        </div>
      </div>
    </div>

    <JamSessionBar class="jam-session-bar-outer" />

    <section v-if="!openPanel" class="about">
      <p>Built by <a href="https://github.com/ammul" target="_blank" rel="noopener">ammul</a>.</p>
      <a href="https://github.com/ammul/tonarium" target="_blank" rel="noopener" class="github-btn">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        View on GitHub
      </a>
    </section>
  </div>
</template>

<style scoped>
.start-page {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 0.5rem 3rem;
}

.hero {
  margin-bottom: 2rem;
}

.tagline {
  font-size: clamp(1.3rem, 4vw, 1.9rem);
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.01em;
  line-height: 1.25;
  margin: 0 0 0.75rem;
}

.sub {
  font-size: 0.95rem;
  color: var(--text3);
  line-height: 1.6;
  margin: 0;
}

.panels {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.panel {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}

.panel.open {
  border-color: var(--accent-mid);
}

.panel-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: var(--raised);
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.panel-header:hover {
  background: var(--hover);
}

.panel.open .panel-header {
  background: var(--hover);
  border-bottom: 1px solid var(--border);
}

.panel-header-text {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.panel-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.02em;
}

.panel.open .panel-label {
  color: var(--accent);
}

.panel-desc {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.4;
}

.panel-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.panel-chevron {
  color: var(--text4);
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.panel.open .panel-chevron {
  transform: rotate(180deg);
}

.panel-running-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  animation: running-pulse 1.2s ease-in-out infinite;
}

@keyframes running-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.panel-body-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s ease;
}

.panel.open .panel-body-wrapper {
  grid-template-rows: 1fr;
}

.panel-body-inner {
  overflow: hidden;
  background: var(--bg);
}

.jam-session-bar-outer {
  margin-top: 0.5rem;
}

.about {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.about p {
  font-size: 0.85rem;
  color: var(--text3);
  line-height: 1.6;
  margin: 0 0 0.75rem;
}

.about a {
  color: var(--accent);
  text-decoration: none;
}

.about a:hover {
  text-decoration: underline;
}

.github-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.8rem;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: var(--input);
  color: var(--text2);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.github-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-bg);
  text-decoration: none;
}
</style>
