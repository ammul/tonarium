import { ref, watchEffect } from 'vue'

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('jamSoundStyle') : null
const VALID = ['synth', 'pluck', 'marimba', 'glass', 'pulse', 'organ', 'brass', 'kalimba']
export const jamSoundStyle = ref(VALID.includes(stored) ? stored : 'synth')

watchEffect(() => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('jamSoundStyle', jamSoundStyle.value)
  }
})
