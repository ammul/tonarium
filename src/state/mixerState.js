import { ref, watch } from 'vue'
import { getJamDest, getBeatDest, getProgDest } from '@/audio/audioContext.js'

export const jamVolume  = ref(1)
export const beatVolume = ref(1)
export const progVolume = ref(1)

watch(jamVolume,  v => { const n = getJamDest();  if (n) n.gain.value = v })
watch(beatVolume, v => { const n = getBeatDest(); if (n) n.gain.value = v })
watch(progVolume, v => { const n = getProgDest(); if (n) n.gain.value = v })
