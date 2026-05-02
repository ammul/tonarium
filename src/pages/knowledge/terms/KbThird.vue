<script setup>
import KbText from '../KbText.vue'
defineProps({ goToTerm: { type: Function, required: true } })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="The third is the interval that decides whether a chord sounds happy or sad. Four semitones above the root makes it major (bright), three semitones makes it minor (dark). Same root, same fifth — the third alone changes the emotional color."
        :go-to-term="goToTerm"
        current-term="third"
      />
    </p>
    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">4</span>
        <KbText text="semitones — major third, bright" :go-to-term="goToTerm" current-term="third" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">3</span>
        <KbText text="semitones — minor third, dark" :go-to-term="goToTerm" current-term="third" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">color</span>
        <KbText text="the single note that decides chord quality" :go-to-term="goToTerm" current-term="third" />
      </div>
    </div>
    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('interval')">Interval</button>
      <button class="kb-rel-btn" @click="goToTerm('fifth')">Fifth</button>
      <button class="kb-rel-btn" @click="goToTerm('triad')">Triad</button>
    </div>
  </div>
</template>
