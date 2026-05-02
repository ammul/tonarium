<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="The perfect fifth is the interval seven semitones above the root — the strongest consonance after the octave. It's the top note of every basic triad, the foundation of power chords, and the most stable, open-sounding two-note shape in Western music."
        :go-to-term="goToTerm"
        current-term="fifth"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">7</span>
        <KbText text="semitones above the root" :go-to-term="goToTerm" current-term="fifth" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">stable</span>
        <KbText text="the most consonant interval after the octave" :go-to-term="goToTerm" current-term="fifth" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">power chord</span>
        <KbText text="root + fifth = the rock guitar foundation" :go-to-term="goToTerm" current-term="fifth" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('interval')">Interval</button>
      <button class="kb-rel-btn" @click="goToTerm('third')">Third</button>
      <button class="kb-rel-btn" @click="goToTerm('triad')">Triad</button>
    </div>
  </div>
</template>
