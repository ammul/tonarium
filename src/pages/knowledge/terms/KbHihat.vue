<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="The hi-hat is the tickling cymbal pattern that subdivides the beat. Closed it sounds tight and dry; open it sloshes. Most patterns hit it on every 8th note (2 per beat) or every 16th note (4 per beat), filling the space between the kick and snare."
        :go-to-term="goToTerm"
        current-term="hihat"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">closed</span>
        <KbText text="tight, dry chick — the default sound" :go-to-term="goToTerm" current-term="hihat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">open</span>
        <KbText text="loose sizzle, often on the off-beat" :go-to-term="goToTerm" current-term="hihat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">subdivide</span>
        <KbText text="splits each beat into 2 or 4 even pulses" :go-to-term="goToTerm" current-term="hihat" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('kick')">Kick</button>
      <button class="kb-rel-btn" @click="goToTerm('snare')">Snare</button>
      <button class="kb-rel-btn" @click="goToTerm('offbeat')">Off-beat</button>
    </div>
  </div>
</template>
