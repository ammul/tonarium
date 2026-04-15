<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import StartPage from '@/pages/StartPage.vue'
import LearnMode from '@/pages/LearnMode.vue'

const emit = defineEmits(['navigate'])

// null = hero, 'jam' = Quick Jam, 'learn' = Learn
const subView = ref(null)

function goTo(view) {
  if (subView.value !== view) {
    history.pushState({ landingView: view }, '')
    subView.value = view
  }
}

function goHome() {
  history.pushState({ landingView: null }, '')
  subView.value = null
}

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

    <!-- Sub-nav: shown when inside a child view -->
    <div v-if="subView" class="tc-landing-subnav">
      <button class="tc-landing-back" @click="goHome" aria-label="Back to home">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 2 4 7 9 12"/>
        </svg>
      </button>
      <div class="tc-landing-tabs">
        <button
          class="tc-landing-tab"
          :class="{ active: subView === 'jam' }"
          @click="goTo('jam')"
        >Quick Jam</button>
        <button
          class="tc-landing-tab"
          :class="{ active: subView === 'learn' }"
          @click="goTo('learn')"
        >Learn</button>
      </div>
    </div>

    <!-- Hero screen -->
    <template v-if="!subView">
      <div class="tc-landing-hero">
        <h2 class="tc-landing-slogan">Play music.<br>No sheets.</h2>
        <p class="tc-landing-sub">Chords, scales, beats. All in your hands.</p>
      </div>

      <div class="tc-landing-ctas">
        <button class="tc-landing-btn tc-landing-btn--jam" @click="goTo('jam')">
          <span class="tc-landing-btn-icon">&#9654;</span>
          <span class="tc-landing-btn-label">Quick Jam</span>
          <span class="tc-landing-btn-desc">Pick a vibe and play</span>
        </button>

        <button class="tc-landing-btn tc-landing-btn--learn" @click="goTo('learn')">
          <span class="tc-landing-btn-icon">&#9670;</span>
          <span class="tc-landing-btn-label">Learn</span>
          <span class="tc-landing-btn-desc">Root notes to full jams</span>
        </button>
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

/* Sub-nav */
.tc-landing-subnav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tc-landing-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text3);
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: border-color 0.12s, color 0.12s;
}

.tc-landing-back:hover {
  border-color: var(--border2);
  color: var(--text);
}

.tc-landing-tabs {
  display: flex;
  gap: 0.25rem;
}

.tc-landing-tab {
  padding: 0.3rem 0.9rem;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text3);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.tc-landing-tab:hover {
  color: var(--text);
  background: var(--hover);
}

.tc-landing-tab.active {
  background: var(--raised);
  border-color: var(--border2);
  color: var(--accent);
}

/* Hero */
.tc-landing-hero {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  padding: 3rem 1.5rem 0;
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

/* CTAs */
.tc-landing-ctas {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tc-landing-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  width: 100%;
  padding: 1.5rem 1.75rem;
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

.tc-landing-btn-icon {
  font-size: 1rem;
  color: var(--accent);
  margin-bottom: 0.3rem;
  line-height: 1;
}

.tc-landing-btn--learn .tc-landing-btn-icon {
  color: var(--text3);
  font-size: 0.85rem;
}

.tc-landing-btn-label {
  font-size: 1.45rem;
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

@media (min-width: 480px) {
  .tc-landing-ctas {
    flex-direction: row;
  }

  .tc-landing-btn {
    flex: 1;
    min-height: 160px;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-landing-hero {
    padding-top: 1.5rem;
  }

  .tc-landing-ctas {
    flex-direction: row;
    padding-bottom: 2rem;
  }

  .tc-landing-btn {
    flex: 1;
  }
}
</style>
