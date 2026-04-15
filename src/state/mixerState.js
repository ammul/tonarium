import { ref, watch } from 'vue'
import { getJamDest, getBeatDest, getProgDest, JAM_GAIN_BASE, BEAT_GAIN_BASE, PROG_GAIN_BASE } from '@/audio/audioContext.js'

export const jamVolume  = ref(1)
export const beatVolume = ref(1)
export const progVolume = ref(0.3)

watch(jamVolume,  v => { const n = getJamDest();  if (n) n.gain.value = v * JAM_GAIN_BASE })
watch(beatVolume, v => { const n = getBeatDest(); if (n) n.gain.value = v * BEAT_GAIN_BASE })
watch(progVolume, v => { const n = getProgDest(); if (n) n.gain.value = v * PROG_GAIN_BASE })

// Apply current slider values to Web Audio gain nodes.
// Must be called after AudioContext is created (e.g. at transport start)
// because the watches above only fire on changes, not on initial value.
export function initMixer() {
  const j = getJamDest();  if (j) j.gain.value = jamVolume.value  * JAM_GAIN_BASE
  const b = getBeatDest(); if (b) b.gain.value = beatVolume.value * BEAT_GAIN_BASE
  const p = getProgDest(); if (p) p.gain.value = progVolume.value * PROG_GAIN_BASE
}
