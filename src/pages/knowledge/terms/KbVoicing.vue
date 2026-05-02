<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A voicing is how the notes of a chord are arranged — which note is on the bottom, which on top, how they're spread across the instrument. Same chord, different voicings can feel tense or open or bright, even though the note names are identical."
        :go-to-term="goToTerm"
        current-term="voicing"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">order</span>
        <KbText text="root on bottom, or any other note (inversion)" :go-to-term="goToTerm" current-term="voicing" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">spread</span>
        <KbText text="notes close together feel dense; spread out feels open" :go-to-term="goToTerm" current-term="voicing" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">register</span>
        <KbText text="high voicings sparkle; low voicings rumble" :go-to-term="goToTerm" current-term="voicing" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
      <button class="kb-rel-btn" @click="goToTerm('triad')">Triad</button>
      <button class="kb-rel-btn" @click="goToTerm('octave')">Octave</button>
    </div>
  </div>
</template>
