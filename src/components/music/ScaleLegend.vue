<script setup>
const props = defineProps({
  showAnchor:  { type: Boolean, default: true },
  activeLabel: { type: String,  default: 'safe' },
})
</script>

<template>
  <div class="tc-scale-legend">
    <span class="tc-scale-legend-item root">root</span>
    <template v-if="showAnchor">
      <span class="tc-scale-legend-sep">·</span>
      <span class="tc-scale-legend-item anchor">anchor - land here</span>
    </template>
    <span class="tc-scale-legend-sep">·</span>
    <span class="tc-scale-legend-item safe">{{ activeLabel }}</span>
  </div>
</template>

<style scoped>
.tc-scale-legend {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tc-scale-legend-sep {
  color: var(--text5);
  font-size: 0.75rem;
}

.tc-scale-legend-item {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text3);
  letter-spacing: 0.03em;
}

.tc-scale-legend-item::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.3rem;
  vertical-align: middle;
}

.tc-scale-legend-item.root::before   { background: var(--rust); }
.tc-scale-legend-item.anchor::before { background: var(--accent-mid); }
.tc-scale-legend-item.safe::before   { background: var(--border2); }

</style>
