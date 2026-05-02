<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text='The snare is the sharp crack that lands on beats 2 and 4 — the back-beat. While the kick anchors the start of each bar, the snare provides the answering punch, and together they form the spine of almost every popular drum pattern.'
        :go-to-term="goToTerm"
        current-term="snare"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">2 + 4</span>
        <KbText text="the canonical back-beat positions" :go-to-term="goToTerm" current-term="snare" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">crack</span>
        <KbText text="bright, attacky tone — the head of any pattern" :go-to-term="goToTerm" current-term="snare" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">ghost</span>
        <KbText text="quiet snare hits between 2 and 4 add motion" :go-to-term="goToTerm" current-term="snare" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('kick')">Kick</button>
      <button class="kb-rel-btn" @click="goToTerm('hihat')">Hi-Hat</button>
      <button class="kb-rel-btn" @click="goToTerm('beat')">Beat</button>
    </div>
  </div>
</template>
