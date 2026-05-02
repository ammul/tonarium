<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TERM_MAP, findTerm } from './knowledge/termMap.js'
import KbNote        from './knowledge/terms/KbNote.vue'
import KbOctave      from './knowledge/terms/KbOctave.vue'
import KbInterval    from './knowledge/terms/KbInterval.vue'
import KbRoot        from './knowledge/terms/KbRoot.vue'
import KbScale       from './knowledge/terms/KbScale.vue'
import KbChord       from './knowledge/terms/KbChord.vue'
import KbKey         from './knowledge/terms/KbKey.vue'
import KbProgression from './knowledge/terms/KbProgression.vue'
import KbBeat        from './knowledge/terms/KbBeat.vue'
import KbBpm         from './knowledge/terms/KbBpm.vue'
import KbPentatonic  from './knowledge/terms/KbPentatonic.vue'
import KbVoicing     from './knowledge/terms/KbVoicing.vue'
import KbDownbeat    from './knowledge/terms/KbDownbeat.vue'
import KbOffbeat     from './knowledge/terms/KbOffbeat.vue'
import KbKick        from './knowledge/terms/KbKick.vue'
import KbSnare       from './knowledge/terms/KbSnare.vue'
import KbHihat       from './knowledge/terms/KbHihat.vue'
import KbFifth       from './knowledge/terms/KbFifth.vue'
import KbThird       from './knowledge/terms/KbThird.vue'
import KbTriad       from './knowledge/terms/KbTriad.vue'
import KbComp        from './knowledge/terms/KbComp.vue'
import KbArpeggio    from './knowledge/terms/KbArpeggio.vue'
import KbSyncopation from './knowledge/terms/KbSyncopation.vue'
import { requestedKbTerm } from '@/state/landingState.js'

const TERM_COMPONENTS = {
  note:        KbNote,
  octave:      KbOctave,
  interval:    KbInterval,
  root:        KbRoot,
  scale:       KbScale,
  chord:       KbChord,
  key:         KbKey,
  progression: KbProgression,
  beat:        KbBeat,
  bpm:         KbBpm,
  pentatonic:  KbPentatonic,
  voicing:     KbVoicing,
  downbeat:    KbDownbeat,
  offbeat:     KbOffbeat,
  kick:        KbKick,
  snare:       KbSnare,
  hihat:       KbHihat,
  fifth:       KbFifth,
  third:       KbThird,
  triad:       KbTriad,
  comp:        KbComp,
  arpeggio:    KbArpeggio,
  syncopation: KbSyncopation,
}

const activeTerm  = ref(null)
const searchQuery = ref('')

const filteredTerms = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return [...TERM_MAP.values()]
  return [...TERM_MAP.values()].filter(entry =>
    entry.label.toLowerCase().includes(q) ||
    entry.aliases.some(a => a.toLowerCase().includes(q))
  )
})

function goToTerm(slug) {
  const id = findTerm(slug)
  if (!id) return
  activeTerm.value = id
  history.pushState({ kb: id }, '')
  window.scrollTo(0, 0)
}

function openIndex() {
  activeTerm.value = null
  history.pushState({ kb: null }, '')
  window.scrollTo(0, 0)
}

function onPopState(e) {
  activeTerm.value = e.state?.kb ?? null
}

onMounted(() => {
  window.addEventListener('popstate', onPopState)
  history.replaceState({ kb: null }, '')
  if (requestedKbTerm.value) {
    goToTerm(requestedKbTerm.value)
    requestedKbTerm.value = null
  }
})
onUnmounted(() => window.removeEventListener('popstate', onPopState))
</script>

<template>
  <div class="kb-root">
    <template v-if="activeTerm === null">
      <div class="kb-index-header">
        <h1 class="kb-title">Knowledge Base</h1>
        <p class="kb-subtitle">Musical terms, explained interactively.</p>
        <input
          v-model="searchQuery"
          class="kb-search"
          type="text"
          placeholder="Search terms..."
          autofocus
        />
      </div>

      <div class="kb-grid">
        <button
          v-for="entry in filteredTerms"
          :key="entry.label"
          class="kb-card"
          @click="goToTerm(entry.label)"
        >
          <div class="kb-card-label">{{ entry.label }}</div>
          <div class="kb-card-summary">{{ entry.summary }}</div>
          <div class="kb-card-arrow">→</div>
        </button>
      </div>

      <div v-if="filteredTerms.length === 0" class="kb-empty">
        No terms match "{{ searchQuery }}"
      </div>
    </template>

    <template v-else>
      <div class="kb-term-header">
        <button class="kb-back-btn" @click="openIndex">← All terms</button>
        <h2 class="kb-term-title">{{ TERM_MAP.get(activeTerm)?.label }}</h2>
      </div>
      <component
        :is="TERM_COMPONENTS[activeTerm]"
        :go-to-term="goToTerm"
      />
    </template>
  </div>
</template>

<style scoped>
.kb-root {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem 1rem 2rem;
  max-width: 680px;
  margin: 0 auto;
}
.kb-index-header {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.kb-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
.kb-subtitle {
  font-size: 0.88rem;
  color: var(--text3);
  margin: 0;
}
.kb-search {
  margin-top: 0.25rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s;
}
.kb-search:focus { border-color: var(--accent); }
.kb-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
@media (max-width: 420px) {
  .kb-grid { grid-template-columns: 1fr; }
}
.kb-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--border2);
  background: var(--surface);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  position: relative;
  transition: border-color 0.12s, background 0.12s;
}
.kb-card:hover { border-color: var(--accent); background: var(--raised); }
.kb-card-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent);
}
.kb-card-summary {
  font-size: 0.78rem;
  color: var(--text3);
  line-height: 1.4;
  padding-right: 1.5rem;
}
.kb-card-arrow {
  position: absolute;
  top: 0.75rem;
  right: 0.9rem;
  font-size: 0.9rem;
  color: var(--text5);
}
.kb-empty {
  font-size: 0.88rem;
  color: var(--text4);
  text-align: center;
  padding: 2rem 0;
}
.kb-term-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.kb-back-btn {
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.12s, color 0.12s;
}
.kb-back-btn:hover { border-color: var(--accent); color: var(--accent); }
.kb-term-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
</style>
