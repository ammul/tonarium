import { ref } from 'vue'
import { getCtx, getProgDest } from '@/audio/audioContext.js'
import { initMixer } from '@/state/mixerState.js'
import { sessionBpm, sessionPlaying, sessionBeatsPerChord, sessionCurrentChordIdx, sessionProgression, sessionCompPattern } from '@/state/sessionState.js'
import { pattern, currentStep, isPlaying as drumIsPlaying, INSTRUMENTS, triggerDrumHit, pause as drumPause } from '@/audio/drumEngine.js'
import { startNote, stopNote } from '@/audio/audioEngine.js'
import { CHORD_TYPES } from '@tonarium/core'
import { chordOn, chordOff } from '@/audio/midiManager.js'
import { getCompHit } from '@/utils/compPatterns.js'

const LOOKAHEAD = 0.1
const TICK_MS   = 25

let _nextStepTime   = 0
let _schedulerTimer = null
let _countInTimer   = null
let _globalStep     = 0
let _chordMidis     = []

export const currentDrumStep = ref(0)

function _playClick(time, isDownbeat) {
  const ctx = getCtx()
  const sr = ctx.sampleRate
  const len = Math.floor(sr * 0.025)
  const buf = ctx.createBuffer(1, len, sr)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.15))
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = isDownbeat ? 2800 : 1800
  filter.Q.value = 0.7
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(isDownbeat ? 0.75 : 0.48, time)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  src.start(time)
  src.stop(time + 0.05)
}

function _updateChordMidis() {
  const prog = sessionProgression.value
  if (!prog) { _chordMidis = []; return }
  const chord = prog.chords[sessionCurrentChordIdx.value]
  if (!chord) { _chordMidis = []; return }
  const aMidi = 12 * (chord._octave + 1) + 9
  _chordMidis = CHORD_TYPES[chord.type].map(i => aMidi + chord._rootIdx + i)
}

function _getCompHit(stepInChord, beatsPerChord) {
  if (!_chordMidis.length) return []
  const indices = getCompHit(sessionCompPattern.value, stepInChord, beatsPerChord, _chordMidis.length)
  return indices.map(i => _chordMidis[i])
}

function _hitDuration(beatsPerChord) {
  const beatSec = 60 / sessionBpm.value
  const pat = sessionCompPattern.value
  if (pat === 'block') return beatSec * beatsPerChord - 0.05
  if (pat === 'arp')   return beatSec * 0.85
  return beatSec * 0.65
}

export function startTransport() {
  if (sessionPlaying.value) return
  drumPause()
  const ctx = getCtx()
  initMixer()

  const beatSec = 60 / sessionBpm.value
  const startTime = ctx.currentTime + 0.1

  for (let i = 0; i < 4; i++) {
    _playClick(startTime + i * beatSec, i === 0)
  }

  sessionPlaying.value = true
  drumIsPlaying.value = true
  _globalStep = 0
  currentDrumStep.value = 0
  sessionCurrentChordIdx.value = 0

  _countInTimer = setTimeout(() => {
    _countInTimer = null
    if (!sessionPlaying.value) return
    _nextStepTime = getCtx().currentTime + 0.05
    _updateChordMidis()
    chordOn(_chordMidis)
    _tick()
  }, Math.round((4 * beatSec + 0.12) * 1000))
}

export function stopTransport() {
  if (_countInTimer) {
    clearTimeout(_countInTimer)
    _countInTimer = null
  }
  sessionPlaying.value = false
  drumIsPlaying.value = false
  clearTimeout(_schedulerTimer)
  _schedulerTimer = null
  _globalStep = 0
  currentDrumStep.value = 0
  currentStep.value = 0
  chordOff(_chordMidis)
  _chordMidis.forEach(m => stopNote(m))
  _chordMidis = []
}

function _tick() {
  if (!sessionPlaying.value) return
  const ctx          = getCtx()
  const stepDur      = 60 / sessionBpm.value / 4
  const beatsPerChord = sessionBeatsPerChord.value
  const chordSteps   = beatsPerChord * 4
  const dest         = getProgDest()

  while (_nextStepTime < ctx.currentTime + LOOKAHEAD) {
    const drumStep = _globalStep % 16

    for (let i = 0; i < INSTRUMENTS.length; i++) {
      if (pattern.value[i][drumStep]) triggerDrumHit(i, _nextStepTime)
    }

    currentDrumStep.value = drumStep
    currentStep.value = drumStep

    const stepInChord = _globalStep % chordSteps

    // Chord boundary: advance to next chord (skip at step 0, chord already set)
    if (_globalStep > 0 && stepInChord === 0) {
      const prog = sessionProgression.value
      if (prog) {
        chordOff(_chordMidis)
        sessionCurrentChordIdx.value = (sessionCurrentChordIdx.value + 1) % prog.chords.length
        _updateChordMidis()
        chordOn(_chordMidis)
      }
    }

    // Comp pattern hit
    const notes = _getCompHit(stepInChord, beatsPerChord)
    if (notes.length) {
      const dur  = _hitDuration(beatsPerChord)
      const gens = notes.map(m => startNote(m, dest))
      setTimeout(
        () => notes.forEach((m, i) => stopNote(m, gens[i])),
        Math.round(dur * 1000),
      )
    }

    _globalStep++
    _nextStepTime += stepDur
  }

  _schedulerTimer = setTimeout(_tick, TICK_MS)
}
