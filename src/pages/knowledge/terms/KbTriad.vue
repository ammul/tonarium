<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A triad is the smallest, most fundamental chord — three notes stacked in thirds: root, third, and fifth. Major and minor triads form the backbone of almost every chord progression in popular music."
        :go-to-term="goToTerm"
        current-term="triad"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">3</span>
        <KbText text="notes — root, third, fifth" :go-to-term="goToTerm" current-term="triad" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">major</span>
        <KbText text="major third + perfect fifth — bright" :go-to-term="goToTerm" current-term="triad" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">minor</span>
        <KbText text="minor third + perfect fifth — sad" :go-to-term="goToTerm" current-term="triad" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
      <button class="kb-rel-btn" @click="goToTerm('third')">Third</button>
      <button class="kb-rel-btn" @click="goToTerm('fifth')">Fifth</button>
    </div>
  </div>
</template>
