<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="The kick is the lowest, deepest drum in the kit — a thud you feel as much as you hear. It carries the downbeat in most genres and locks in with the bass to define the groove's foundation."
        :go-to-term="goToTerm"
        current-term="kick"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">low</span>
        <KbText text="the deepest pitch in the kit, around 50–80 Hz" :go-to-term="goToTerm" current-term="kick" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">1 + 3</span>
        <KbText text="usually lands on beats 1 and 3 in straight rock" :go-to-term="goToTerm" current-term="kick" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">groove</span>
        <KbText text="every genre is partly defined by where its kick falls" :go-to-term="goToTerm" current-term="kick" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('snare')">Snare</button>
      <button class="kb-rel-btn" @click="goToTerm('hihat')">Hi-Hat</button>
      <button class="kb-rel-btn" @click="goToTerm('beat')">Beat</button>
    </div>
  </div>
</template>
