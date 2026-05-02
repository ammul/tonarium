<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="The downbeat is the first beat of a bar — the strongest pulse, the one your foot lands on. It anchors the listener, marks the start of a phrase, and is usually where the kick drum hits."
        :go-to-term="goToTerm"
        current-term="downbeat"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">1</span>
        <KbText text="the count of one in any 4-beat bar" :go-to-term="goToTerm" current-term="downbeat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">anchor</span>
        <KbText text="where the ear orients itself in the bar" :go-to-term="goToTerm" current-term="downbeat" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">kick</span>
        <KbText text="usually carried by the kick drum" :go-to-term="goToTerm" current-term="downbeat" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('beat')">Beat</button>
      <button class="kb-rel-btn" @click="goToTerm('offbeat')">Off-beat</button>
      <button class="kb-rel-btn" @click="goToTerm('kick')">Kick</button>
    </div>
  </div>
</template>
