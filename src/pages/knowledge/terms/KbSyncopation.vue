<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="Syncopation is the trick of putting accents where they don't belong — on off-beats, between strong pulses, or just before the downbeat. It pushes a groove forward, creates tension against the steady beat, and is the heartbeat of funk, jazz, samba, and reggaeton."
        :go-to-term="goToTerm"
        current-term="syncopation"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">accent</span>
        <KbText text="loud or rhythmically emphasized hits" :go-to-term="goToTerm" current-term="syncopation" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">off-beat</span>
        <KbText text='accents land on the "and" between beats' :go-to-term="goToTerm" current-term="syncopation" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">tension</span>
        <KbText text="creates pull against the steady pulse" :go-to-term="goToTerm" current-term="syncopation" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('offbeat')">Off-beat</button>
      <button class="kb-rel-btn" @click="goToTerm('beat')">Beat</button>
      <button class="kb-rel-btn" @click="goToTerm('downbeat')">Downbeat</button>
    </div>
  </div>
</template>
