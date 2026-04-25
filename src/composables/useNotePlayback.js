import { ref, onUnmounted, getCurrentInstance } from 'vue'
import { startNote, stopNote } from '@/audio/audioEngine.js'

export function useNotePlayback({ styleRef = null } = {}) {
  const pressedMidi = ref(new Map())

  function pressDown(midi) {
    pressedMidi.value = new Map([...pressedMidi.value, [midi, true]])
    startNote(midi, null, styleRef?.value ?? null)
  }

  function pressUp(midi) {
    const m = new Map(pressedMidi.value)
    m.delete(midi)
    pressedMidi.value = m
    stopNote(midi)
  }

  function pressToggle(midi) {
    if (pressedMidi.value.has(midi)) {
      pressUp(midi)
    } else {
      pressDown(midi)
    }
  }

  function releaseAll() {
    for (const midi of pressedMidi.value.keys()) stopNote(midi)
    pressedMidi.value = new Map()
  }

  if (getCurrentInstance()) onUnmounted(releaseAll)

  return { pressedMidi, pressDown, pressUp, pressToggle, releaseAll }
}
