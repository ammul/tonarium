<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import StartPage from '@/pages/StartPage.vue'
import LearnMode from '@/pages/LearnMode.vue'
import { requestedLandingView, activeLandingView } from '@/state/landingState.js'
import { Zap, BookOpen, Disc3, Music, BarChart2, ScanSearch, Layers, Settings } from 'lucide-vue-next'

const emit = defineEmits(['navigate'])

// null = hero, 'jam' = Quick Jam, 'learn' = Learn
const subView = ref(null)

function goTo(view) {
  history.pushState({ landingView: view }, '')
  subView.value = view
  activeLandingView.value = view
  window.scrollTo(0, 0)
}

function goHome() {
  history.pushState({ landingView: null }, '')
  subView.value = null
  activeLandingView.value = null
  window.scrollTo(0, 0)
}

// React to navigation requests from App.vue
watch(requestedLandingView, view => {
  if (view === 'hero') {
    goHome()
    requestedLandingView.value = null
  } else if (view) {
    goTo(view)
    requestedLandingView.value = null
  }
}, { immediate: true })

function handleChildNavigate(dest) {
  if (dest === 'home' || dest === 'jam') {
    goTo('jam')
  } else if (dest === 'learn') {
    goTo('learn')
  } else {
    emit('navigate', dest)
  }
}

function handlePopState(e) {
  const v = e.state?.landingView ?? null
  subView.value = v
  activeLandingView.value = v
}

onMounted(() => {
  history.replaceState({ ...history.state, landingView: null }, '')
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
  <div class="tc-landing">

    <!-- Hero screen -->
    <template v-if="!subView">
      <div class="tc-landing-hero">
        <h2 class="tc-landing-slogan">Play music.<br>No sheets.</h2>
        <p class="tc-landing-sub">Chords, scales, beats. All in your hands.</p>
      </div>

      <div class="tc-landing-ctas">
        <button class="tc-landing-btn tc-landing-btn--learn" @click="goTo('learn')">
          <BookOpen :size="28" class="tc-landing-btn-icon" />
          <span class="tc-landing-btn-label">Learn</span>
          <span class="tc-landing-btn-desc">Root notes to full jams</span>
        </button>

        <button class="tc-landing-btn tc-landing-btn--jam" @click="goTo('jam')">
          <Zap :size="28" class="tc-landing-btn-icon" />
          <span class="tc-landing-btn-label">Quick Jam</span>
          <span class="tc-landing-btn-desc">Pick a vibe and play</span>
        </button>

        <button class="tc-landing-tool-btn" @click="$emit('navigate', 'drums')"><Disc3 :size="15" />Drum Computer</button>
        <button class="tc-landing-tool-btn" @click="$emit('navigate', 'chords')"><Music :size="15" />Chord Progressions</button>
        <button class="tc-landing-tool-btn" @click="$emit('navigate', 'scales')"><BarChart2 :size="15" />Scale Visualizer</button>
        <button class="tc-landing-tool-btn" @click="$emit('navigate', 'chord-detector')"><ScanSearch :size="15" />Chord Detector</button>
        <button class="tc-landing-tool-btn" @click="$emit('navigate', 'prog-builder')"><Layers :size="15" />Progression Builder</button>
        <button class="tc-landing-tool-btn" @click="$emit('navigate', 'settings')"><Settings :size="15" />Settings</button>
      </div>
    </template>

    <!-- Child views -->
    <StartPage v-else-if="subView === 'jam'" @navigate="handleChildNavigate" />
    <LearnMode v-else-if="subView === 'learn'" @navigate="handleChildNavigate" />

  </div>
</template>

<style scoped>
.tc-landing {
  display: flex;
  flex-direction: column;
}

/* Hero */
.tc-landing-hero {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  padding: clamp(1.25rem, 5vh, 3rem) 1.5rem 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tc-landing-slogan {
  font-size: clamp(2.2rem, 8vw, 3.6rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--text);
}

.tc-landing-sub {
  font-size: clamp(0.95rem, 3vw, 1.15rem);
  color: var(--text3);
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* CTAs grid */
.tc-landing-ctas {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  padding: clamp(1rem, 3vh, 2rem) 1.5rem clamp(2rem, 5vh, 4rem);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.tc-landing-btn-icon {
  color: var(--text3);
  margin-bottom: 0.35rem;
}

.tc-landing-btn--jam .tc-landing-btn-icon {
  color: var(--accent);
}

.tc-landing-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1.5px solid var(--border2);
  background: var(--surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, transform 0.1s;
}

.tc-landing-btn:hover { transform: translateY(-2px); }
.tc-landing-btn:active { transform: translateY(0); }

.tc-landing-btn--jam {
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.tc-landing-btn--jam:hover {
  border-color: var(--accent);
  background: var(--selected);
}

.tc-landing-btn--learn:hover {
  border-color: var(--accent-dim);
}

.tc-landing-btn-label {
  font-size: clamp(1.1rem, 4vw, 1.45rem);
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.01em;
  line-height: 1;
}

.tc-landing-btn--jam .tc-landing-btn-label {
  color: var(--accent-hi);
}

.tc-landing-btn-desc {
  font-size: 0.85rem;
  color: var(--text3);
  font-weight: 500;
}

/* Tool buttons — smaller cells in the same grid */
.tc-landing-tool-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.1rem;
  border-radius: 10px;
  border: 1px solid var(--border2);
  background: var(--surface);
  color: var(--text2);
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, transform 0.1s;
}

.tc-landing-tool-btn:hover {
  border-color: var(--accent-dim);
  color: var(--text);
  transform: translateY(-1px);
}

.tc-landing-tool-btn:active { transform: translateY(0); }


@media (orientation: landscape) and (max-height: 500px) {
  .tc-landing-hero {
    padding-top: 1.5rem;
  }

  .tc-landing-ctas {
    padding-bottom: 2rem;
  }
}
</style>
