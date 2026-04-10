<script setup>
const emit = defineEmits(['navigate'])

const features = [
  {
    id: 'jam',
    label: 'Jam Mode',
    description: 'Pick a key and scale. Play over a looping chord progression with a drum beat running.',
  },
  {
    id: 'chords',
    label: 'Chord Progressions',
    description: 'Browse 69 classic progressions across 10 genres. Transpose to any key or take one into Jam Mode.',
  },
  {
    id: 'drums',
    label: 'Drum Computer',
    description: 'Build a beat from 9 synthesised instruments across 16 steps. Keeps running while you switch tools.',
  },
]
</script>

<template>
  <div class="start-page">
    <section class="hero">
      <p class="tagline">Play music. No sheet music required.</p>
      <p class="sub">Pick a chord progression, add a beat, and jam — the app shows you which notes sound good as each chord cycles.</p>
    </section>

    <section class="features">
      <button
        v-for="feature in features"
        :key="feature.id"
        class="feature-btn"
        @click="emit('navigate', feature.id)"
      >
        <span class="feature-label">{{ feature.label }}</span>
        <span class="feature-desc">{{ feature.description }}</span>
      </button>
    </section>

    <section class="about">
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
  max-width: 560px;
  margin: 0 auto;
  padding: 0 0.5rem 3rem;
}

.hero {
  margin-bottom: 2.5rem;
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

.features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 3rem;
}

.feature-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  width: 100%;
  padding: 1.25rem 1.4rem;
  background: var(--raised);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s;
}

.feature-btn:hover {
  border-color: var(--accent);
  background: var(--hover);
}

.feature-label {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.02em;
}

.feature-desc {
  font-size: 0.85rem;
  color: var(--text3);
  line-height: 1.5;
}

.about {
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
