<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { unlockCtx } from '@/audio/audioContext.js'
import { displayMode } from '@/state/displayMode.js'
import { colorScheme as _colorScheme } from '@/state/colorScheme.js'
import { isPlaying as drumIsPlaying, play as drumPlay, pause as drumPause } from '@/audio/drumEngine.js'
import { sessionPlaying } from '@/state/sessionState.js'
import { startTransport, stopTransport } from '@/audio/transportClock.js'
import LandingPage from '@/pages/LandingPage.vue'
import { requestedLandingView } from '@/state/landingState.js'
import ScaleVisualizer from '@/pages/ScaleVisualizer.vue'
import ChordProgressions from '@/pages/ChordProgressions.vue'
import ChordDetector from '@/pages/ChordDetector.vue'
import ProgressionBuilder from '@/pages/ProgressionBuilder.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import DrumComputer from '@/pages/DrumComputer.vue'
import AboutPage from '@/pages/AboutPage.vue'
import QuickJam2 from '@/pages/QuickJam2.vue'
import KnowledgeBase from '@/pages/KnowledgeBase.vue'
import ChordLibrary from '@/pages/ChordLibrary.vue'
import { Home, Zap, BookOpen, Disc3, Music, BarChart2, ScanSearch, Layers, Info, Settings, Menu, X, Play, Pause, Square, RefreshCw, BookMarked, Library } from 'lucide-vue-next'

const allTabs = [
  { id: 'home',           label: 'Home',                shortLabel: 'Home',         component: LandingPage,        icon: Home },
  { id: 'jam',            label: 'Quick Jam',           shortLabel: 'Jam',          component: LandingPage,        menuOnly: true, icon: Zap },
  { id: 'learn',          label: 'Learn',               shortLabel: 'Learn',        component: LandingPage,        menuOnly: true, icon: BookOpen },
  { id: 'quickjam2',      label: 'Carousel Jam',        shortLabel: 'Carousel',     component: QuickJam2,          menuOnly: true, hidden: true, icon: RefreshCw },
  { id: 'kb',             label: 'Knowledge Base',      shortLabel: 'Knowledge',    component: KnowledgeBase,      menuOnly: true, icon: BookMarked },
  { id: 'drums',          label: 'Drum Computer',       shortLabel: 'Drums',        component: DrumComputer,       menuOnly: true, icon: Disc3 },
  { id: 'chords',         label: 'Chord Progressions',  shortLabel: 'Progressions', component: ChordProgressions,  menuOnly: true, icon: Music },
  { id: 'scales',         label: 'Scale Visualizer',    shortLabel: 'Scales',       component: ScaleVisualizer,    menuOnly: true, icon: BarChart2 },
  { id: 'chord-detector', label: 'Chord Detector',      shortLabel: 'Detector',     component: ChordDetector,      menuOnly: true, icon: ScanSearch },
  { id: 'chord-library',  label: 'Chord Library',       shortLabel: 'Library',      component: ChordLibrary,       menuOnly: true, icon: Library },
  { id: 'prog-builder',   label: 'Progression Builder', shortLabel: 'Builder',      component: ProgressionBuilder, menuOnly: true, icon: Layers },
  { id: 'about',          label: 'About',               shortLabel: 'About',        component: AboutPage,          menuOnly: true, icon: Info },
  { id: 'settings',       label: 'Settings',            shortLabel: 'Settings',     component: SettingsPage,       icon: Settings },
]

const activeTab      = ref('home')
const previousTab    = ref('home')
const menuOpen       = ref(false)
const drumEverPlayed = ref(false)

const sessionEverStarted = ref(false)

watch(drumIsPlaying, (playing) => {
  if (playing) drumEverPlayed.value = true
})

watch(sessionPlaying, (playing) => {
  if (playing) sessionEverStarted.value = true
})

const tabs = computed(() =>
  allTabs.filter(t => !t.hidden && (!t.padOnly || displayMode.value === 'pad'))
)

watch(displayMode, (mode) => {
  if (mode !== 'pad' && activeTab.value === 'claves') {
    activeTab.value = 'home'
  }
})

const activeComponent = computed(() => allTabs.find(t => t.id === activeTab.value)?.component)

function selectTab(id) {
  // 'jam' and 'learn' are sub-views of LandingPage, not top-level tabs
  if (id === 'jam' || id === 'learn') {
    requestedLandingView.value = id
    id = 'home'
  } else if (id === 'home') {
    requestedLandingView.value = 'hero'
  }
  if (id === 'settings' && activeTab.value !== 'settings') {
    previousTab.value = activeTab.value
  }
  activeTab.value = id
  menuOpen.value = false
  history.pushState({ tab: id }, '')
  window.scrollTo(0, 0)
}

function closeSettings() {
  activeTab.value = previousTab.value
  menuOpen.value = false
  window.scrollTo(0, 0)
}

function handlePopState(e) {
  const tab = e.state?.tab
  if (!tab || !allTabs.some(t => t.id === tab)) return
  activeTab.value = tab
  menuOpen.value = false
  window.scrollTo(0, 0)
}

onMounted(() => {
  history.replaceState({ tab: activeTab.value }, '')
  window.addEventListener('popstate', handlePopState)
  document.addEventListener('touchstart', unlockCtx, { once: true, passive: true })
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<template>
  <div id="app">
    <header>
      <div class="header-row">
        <div class="title-block">
          <h1 @click="selectTab('home')" class="home-link">Tonarium</h1>
        </div>
        <div class="header-controls">
          <div v-if="sessionEverStarted" class="drum-widget session-widget" :class="{ playing: sessionPlaying }" @click="selectTab('home')">
            <span class="dw-dot"></span>
            <span class="dw-label">Session</span>
            <button
              class="btn btn-icon dw-btn"
              :aria-label="sessionPlaying ? 'Stop session' : 'Start session'"
              @click.stop="sessionPlaying ? stopTransport() : startTransport()"
            >
              <Pause v-if="sessionPlaying" :size="10" />
              <Play v-else :size="10" />
            </button>
          </div>
          <div v-else-if="drumEverPlayed" class="drum-widget" :class="{ playing: drumIsPlaying }" @click="selectTab('drums')">
            <span class="dw-dot"></span>
            <span class="dw-label">Drums</span>
            <button
              class="btn btn-icon dw-btn"
              :aria-label="drumIsPlaying ? 'Pause drums' : 'Play drums'"
              @click.stop="drumIsPlaying ? drumPause() : drumPlay()"
            >
              <Pause v-if="drumIsPlaying" :size="10" />
              <Play v-else :size="10" />
            </button>
          </div>
          <button class="btn btn-icon icon-btn" @click="activeTab === 'settings' ? closeSettings() : selectTab('settings')" :class="{ active: activeTab === 'settings' }" aria-label="Settings">
            <Settings :size="16" />
          </button>
          <button class="btn btn-icon icon-btn burger-btn" @click="menuOpen = true" aria-label="Open menu">
            <Menu :size="18" />
          </button>
        </div>
      </div>
    </header>

    <div class="menu-overlay" :class="{ open: menuOpen }" @click="menuOpen = false"></div>

    <nav class="side-menu" :class="{ open: menuOpen }">
      <button class="btn btn-ghost close-btn" @click="menuOpen = false" aria-label="Close menu">
        <X :size="18" />
      </button>
      <ul>
        <li v-for="tab in tabs" :key="tab.id">
          <button
            :class="{ active: activeTab === tab.id }"
            @click="selectTab(tab.id)"
          >
            <component :is="tab.icon" :size="16" class="menu-tab-icon" />
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </nav>

    <main>
      <component
        :is="activeComponent"
        @navigate="selectTab"
        @close="closeSettings"
      />
    </main>
  </div>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.header-row {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  .header-row {
    padding: 0.35rem 1rem;
  }
  h1 {
    font-size: 1.1rem;
  }
}

h1 {
  font-size: clamp(1.2rem, 5vw, 1.8rem);
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title-block {
  min-width: 0;
}

.home-link {
  cursor: pointer;
}


.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Drum widget */
.drum-widget {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.5rem 0 0.55rem;
  height: 36px;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: border-color 0.15s;
}

.drum-widget.playing {
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.dw-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text4);
  flex-shrink: 0;
  transition: background 0.2s;
}

.drum-widget.playing .dw-dot {
  background: var(--accent);
  animation: dw-pulse 1s ease-in-out infinite;
}

@keyframes dw-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

.dw-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text4);
  transition: color 0.15s;
}

.drum-widget.playing .dw-label {
  color: var(--accent);
}

/* unique properties not covered by .btn + .btn-icon */
.dw-btn {
  width: 24px;
  height: 24px;
  min-width: unset;
  min-height: unset;
  border-radius: 4px;
}

.drum-widget.playing .dw-btn {
  color: var(--accent);
  border-color: var(--accent-mid);
}

/* unique properties not covered by .btn + .btn-icon */
.icon-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

/* unique properties not covered by .btn + .btn-icon */
.burger-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.burger-btn:hover { border-color: var(--accent); }

main {
  padding-top: 4.5rem;
}

@media (orientation: landscape) and (max-height: 500px) {
  main {
    padding-top: 3.5rem;
  }
}

/* Overlay */
.menu-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: var(--overlay);
  z-index: 100;
}

.menu-overlay.open {
  display: block;
}

/* Side menu */
.side-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 260px;
  background: var(--bg);
  border-left: 1px solid var(--border);
  z-index: 101;
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem 1.25rem;
  transform: translateX(100%);
  transition: transform 0.22s ease;
}

.side-menu.open {
  transform: translateX(0);
}

/* unique properties not covered by .btn + .btn-ghost */
.close-btn {
  align-self: flex-end;
  font-size: 1.1rem;
  margin-bottom: 1.25rem;
}

.close-btn:hover { color: var(--text); }

.side-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.side-menu ul li button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text2);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  padding: 0.65rem 0.9rem;
  letter-spacing: 0.03em;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.menu-tab-icon {
  flex-shrink: 0;
  opacity: 0.6;
}

.side-menu ul li button.active .menu-tab-icon,
.side-menu ul li button:hover .menu-tab-icon {
  opacity: 1;
}

.side-menu ul li button:hover {
  color: var(--text);
  background: var(--hover);
}

.side-menu ul li button.active {
  background: var(--raised);
  border-color: var(--border2);
  color: var(--accent);
}
</style>
