<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="An arpeggio is a chord whose notes are played one at a time instead of all at once. Same notes, different feel — an arpeggio sounds melodic and flowing where a block chord sounds dense and fixed."
        :go-to-term="goToTerm"
        current-term="arpeggio"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">one at a time</span>
        <KbText text="each chord note plays in sequence" :go-to-term="goToTerm" current-term="arpeggio" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">flowing</span>
        <KbText text="creates melody from a static chord" :go-to-term="goToTerm" current-term="arpeggio" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">up / down</span>
        <KbText text="ascend, descend, or zigzag through the notes" :go-to-term="goToTerm" current-term="arpeggio" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
      <button class="kb-rel-btn" @click="goToTerm('comp')">Comping</button>
      <button class="kb-rel-btn" @click="goToTerm('voicing')">Voicing</button>
    </div>
  </div>
</template>
