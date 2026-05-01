import { ref, watchEffect } from 'vue'

export const JAM_SOUND_STYLES = ['synth', 'pluck', 'marimba', 'glass', 'pulse', 'organ', 'brass', 'kalimba', 'rhodes', 'strings']
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('jamSoundStyle') : null
export const jamSoundStyle = ref(JAM_SOUND_STYLES.includes(stored) ? stored : 'synth')

watchEffect(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('jamSoundStyle', jamSoundStyle.value)
  }
})
