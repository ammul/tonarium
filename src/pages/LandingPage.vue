<script setup>
const emit = defineEmits(['navigate'])
</script>

<template>
  <div class="tc-landing">
    <div class="tc-landing-hero">
      <h2 class="tc-landing-slogan">Play music.<br>No sheets.</h2>
      <p class="tc-landing-sub">Chords, scales, beats. All in your hands.</p>
    </div>

    <div class="tc-landing-ctas">
      <button class="tc-landing-btn tc-landing-btn--jam" @click="emit('navigate', 'jam')">
        <span class="tc-landing-btn-icon">&#9654;</span>
        <span class="tc-landing-btn-label">Quick Jam</span>
        <span class="tc-landing-btn-desc">Pick a vibe and play</span>
      </button>

      <button class="tc-landing-btn tc-landing-btn--learn" @click="emit('navigate', 'learn')">
        <span class="tc-landing-btn-icon">&#9670;</span>
        <span class="tc-landing-btn-label">Learn</span>
        <span class="tc-landing-btn-desc">Root notes to full jams</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tc-landing {
  max-width: 560px;
  margin: 0 auto;
  padding: 3rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.tc-landing-hero {
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

.tc-landing-ctas {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
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

.tc-landing-btn:hover {
  transform: translateY(-2px);
}

.tc-landing-btn:active {
  transform: translateY(0);
}

.tc-landing-btn--jam {
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.tc-landing-btn--jam:hover {
  border-color: var(--accent);
  background: var(--selected);
}

.tc-landing-btn--learn {
  border-color: var(--border2);
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
  .tc-landing {
    padding: 1.5rem 1.5rem 2rem;
    gap: 1.5rem;
  }

  .tc-landing-ctas {
    flex-direction: row;
  }

  .tc-landing-btn {
    flex: 1;
  }
}
</style>
