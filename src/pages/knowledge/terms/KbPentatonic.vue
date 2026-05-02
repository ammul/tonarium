<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A pentatonic is a 5-note scale carved out of a 7-note major or minor scale. By dropping the two notes most likely to clash, every remaining note works over almost any chord in the key — making pentatonics the safest landing zone for soloing."
        :go-to-term="goToTerm"
        current-term="pentatonic"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">5</span>
        <KbText text="notes per octave instead of 7" :go-to-term="goToTerm" current-term="pentatonic" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">major / minor</span>
        <KbText text="two flavors, mirroring scale quality" :go-to-term="goToTerm" current-term="pentatonic" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">forgiving</span>
        <KbText text="every note sits over almost any chord in the key" :go-to-term="goToTerm" current-term="pentatonic" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('scale')">Scale</button>
      <button class="kb-rel-btn" @click="goToTerm('key')">Key</button>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
    </div>
  </div>
</template>
