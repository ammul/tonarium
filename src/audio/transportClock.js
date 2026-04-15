import { ref } from 'vue'
import { getCtx, getProgDest } from '@/audio/audioContext.js'
import { initMixer } from '@/state/mixerState.js'
import { sessionBpm, sessionPlaying, sessionBeatsPerChord, sessionCurrentChordIdx, sessionProgression } from '@/state/sessionState.js'
import { pattern, currentStep, isPlaying as drumIsPlaying, INSTRUMENTS, triggerDrumHit, pause as drumPause } from '@/audio/drumEngine.js'
import { startNote, stopNote } from '@/audio/audioEngine.js'
import { CHORD_TYPES } from '@tonarium/core'
import { chordOn, chordOff } from '@/audio/midiManager.js'

const LOOKAHEAD = 0.1
const TICK_MS   = 25

let _nextStepTime   = 0
let _schedulerTimer  = null
let _globalStep      = 0
let _currentMidis    = []
let _chordStopTimer  = null

export const currentDrumStep = ref(0)

export function startTransport() {
  if (sessionPlaying.value) return
  drumPause()  // stop any standalone drum engine loop before taking over
  const ctx = getCtx()
  initMixer()  // apply current slider values now that AudioContext exists
  sessionPlaying.value = true
  drumIsPlaying.value = true
  _globalStep = 0
  currentDrumStep.value = 0
  sessionCurrentChordIdx.value = 0
  _nextStepTime = ctx.currentTime + 0.05
  _playCurrentChord()
  _tick()
}

export function stopTransport() {
  sessionPlaying.value = false
  drumIsPlaying.value = false
  clearTimeout(_schedulerTimer)
  _schedulerTimer = null
  _globalStep = 0
  currentDrumStep.value = 0
  currentStep.value = 0
  _stopChord()
}

function _tick() {
  if (!sessionPlaying.value) return
  const ctx     = getCtx()
  const stepDur = 60 / sessionBpm.value / 4

  while (_nextStepTime < ctx.currentTime + LOOKAHEAD) {
    const drumStep = _globalStep % 16

    for (let i = 0; i < INSTRUMENTS.length; i++) {
      if (pattern.value[i][drumStep]) triggerDrumHit(i, _nextStepTime)
    }

    currentDrumStep.value = drumStep
    currentStep.value = drumStep

    const chordSteps = sessionBeatsPerChord.value * 4
    if (_globalStep > 0 && _globalStep % chordSteps === 0) {
      _advanceChord()
    }

    _globalStep++
    _nextStepTime += stepDur
  }

  _schedulerTimer = setTimeout(_tick, TICK_MS)
}

function _advanceChord() {
  const prog = sessionProgression.value
  if (!prog) return
  const len = prog.chords.length
  const nextIdx = (sessionCurrentChordIdx.value + 1) % len
  sessionCurrentChordIdx.value = nextIdx
  _stopChord()
  _playCurrentChord()
}

function _playCurrentChord() {
  const prog = sessionProgression.value
  if (!prog) return
  const chord = prog.chords[sessionCurrentChordIdx.value]
  if (!chord) return

  const rootIdx = chord._rootIdx
  const aMidi = 12 * (chord._octave + 1) + 9
  _currentMidis = CHORD_TYPES[chord.type].map(i => aMidi + rootIdx + i)

  chordOn(_currentMidis)
  const beatSec = Math.max(0.1, (60 / sessionBpm.value) * sessionBeatsPerChord.value - 0.05)
  const dest = getProgDest()
  _currentMidis.forEach(m => startNote(m, dest))
  if (_chordStopTimer) clearTimeout(_chordStopTimer)
  _chordStopTimer = setTimeout(() => {
    _chordStopTimer = null
    _currentMidis.forEach(m => stopNote(m))
  }, Math.round(beatSec * 1000))
}

function _stopChord() {
  if (_chordStopTimer) {
    clearTimeout(_chordStopTimer)
    _chordStopTimer = null
  }
  if (_currentMidis.length) {
    chordOff(_currentMidis)
    _currentMidis.forEach(m => stopNote(m))
    _currentMidis = []
  }
}
