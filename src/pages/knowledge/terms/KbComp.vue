<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="Comping is the rhythm pattern a chord is played with. Block hits all the notes at once on beat 1. Off-beat lands on beats 2 and 4. Arp plays one note per beat in sequence. Waltz emphasizes the 1 with the upper notes filling 2 and 3."
        :go-to-term="goToTerm"
        current-term="comp"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">block</span>
        <KbText text="all notes hit together on the downbeat" :go-to-term="goToTerm" current-term="comp" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">off-beat</span>
        <KbText text="hits on the back-beat for a reggae or ska feel" :go-to-term="goToTerm" current-term="comp" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">arp</span>
        <KbText text="one chord note per beat — flowing, melodic" :go-to-term="goToTerm" current-term="comp" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
      <button class="kb-rel-btn" @click="goToTerm('arpeggio')">Arpeggio</button>
      <button class="kb-rel-btn" @click="goToTerm('beat')">Beat</button>
    </div>
  </div>
</template>
