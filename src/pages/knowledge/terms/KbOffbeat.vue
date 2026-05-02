<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text='An off-beat is the "and" that lives between strong beats. Counting "1 and 2 and 3 and 4 and" — the "ands" are the off-beats. Putting accents there is the engine of syncopation, the thing that makes funk, reggae, and house grooves push and pull.'
        :go-to-term="goToTerm"
        current-term="offbeat"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">"and"</span>
        <KbText text="the half-beat between every numbered beat" :go-to-term="goToTerm" current-term="offbeat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">push</span>
        <KbText text="off-beat accents pull the groove forward" :go-to-term="goToTerm" current-term="offbeat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">syncopation</span>
        <KbText text="the building block of every funky pattern" :go-to-term="goToTerm" current-term="offbeat" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('downbeat')">Downbeat</button>
      <button class="kb-rel-btn" @click="goToTerm('syncopation')">Syncopation</button>
      <button class="kb-rel-btn" @click="goToTerm('beat')">Beat</button>
    </div>
  </div>
</template>
