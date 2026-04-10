import { ref, watchEffect } from 'vue'

function loadNum(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  const v = localStorage.getItem(key)
  if (v === null) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function loadStr(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  return localStorage.getItem(key) ?? fallback
}

export const sessionKey             = ref(loadStr('sessionKey', 'C'))
export const sessionProgression     = ref(null)
export const sessionBeatIdx         = ref(loadNum('sessionBeatIdx', null))
export const sessionBpm             = ref(loadNum('sessionBpm', 120))
export const sessionBeatsPerChord   = ref(loadNum('sessionBeatsPerChord', 2))
export const sessionPlaying         = ref(false)
export const sessionCurrentChordIdx = ref(0)

watchEffect(() => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('sessionKey', sessionKey.value)
  localStorage.setItem('sessionBpm', String(sessionBpm.value))
  localStorage.setItem('sessionBeatsPerChord', String(sessionBeatsPerChord.value))
  if (sessionBeatIdx.value !== null) {
    localStorage.setItem('sessionBeatIdx', String(sessionBeatIdx.value))
  }
})
