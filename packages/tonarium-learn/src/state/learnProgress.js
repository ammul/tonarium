import { ref, computed } from 'vue'

export const LEARN_LESSON_IDS = [
  'root-notes',
  'intervals',
  'scales',
  'chords',
  'progressions',
  'improvising',
  'beats',
  'song-structure',
  'jam-session',
]

const STORAGE_KEY = 'learnCompleted'

function loadCompleted() {
  if (typeof localStorage === 'undefined') return new Set()
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveCompleted(set) {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])) } catch {}
}

export const completedLessons = ref(loadCompleted())

export function markLessonComplete(id) {
  if (!LEARN_LESSON_IDS.includes(id)) return
  if (completedLessons.value.has(id)) return
  const next = new Set(completedLessons.value)
  next.add(id)
  completedLessons.value = next
  saveCompleted(next)
}

export function resetLearnProgress() {
  completedLessons.value = new Set()
  saveCompleted(completedLessons.value)
}

export function isLessonComplete(id) {
  return completedLessons.value.has(id)
}

export const learnPercentage = computed(() =>
  Math.round((completedLessons.value.size / LEARN_LESSON_IDS.length) * 100)
)
