import { midiStatus } from './midiManager.js'
import { soundEnabled } from './soundEnabled.js'
import { soundStyle } from './soundStyle.js'

let _ctx = null
let _compressor = null
let _gen = 0
const _active = new Map() // midiNote → { gainNode, oscs, gen }

function getCtx() {
  if (!_ctx) {
    _ctx = new AudioContext()
    _compressor = _ctx.createDynamicsCompressor()
    _compressor.threshold.value = -18
    _compressor.knee.value = 6
    _compressor.ratio.value = 4
    _compressor.attack.value = 0.003
    _compressor.release.value = 0.1
    _compressor.connect(_ctx.destination)
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

export function startNote(midiNote) {
  if (!soundEnabled.value || midiStatus.value === 'connected') return 0
  stopNote(midiNote)

  const ctx = getCtx()
  const freq = midiToFreq(midiNote)
  const now = ctx.currentTime
  const gen = ++_gen

  const gainNode = ctx.createGain()
  gainNode.connect(_compressor)

  const style = soundStyle.value
  let oscs

  if (style === 'bell') {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gainNode)

    const h2 = ctx.createOscillator()
    h2.type = 'sine'
    h2.frequency.value = freq * 2
    const h2g = ctx.createGain()
    h2g.gain.value = 0.3
    h2.connect(h2g)
    h2g.connect(gainNode)

    const h3 = ctx.createOscillator()
    h3.type = 'sine'
    h3.frequency.value = freq * 3
    const h3g = ctx.createGain()
    h3g.gain.value = 0.1
    h3.connect(h3g)
    h3g.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.003)
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 1.0)

    osc.start(now); h2.start(now); h3.start(now)
    oscs = [osc, h2, h3]

  } else if (style === 'piano') {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gainNode)

    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const harmGain = ctx.createGain()
    harmGain.gain.value = 0.05
    harm.connect(harmGain)
    harmGain.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.015)
    gainNode.gain.exponentialRampToValueAtTime(0.10, now + 0.6)

    osc.start(now); harm.start(now)
    oscs = [osc, harm]

  } else if (style === 'pluck') {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.6, now + 0.005)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.085)

    osc.start(now)
    osc.stop(now + 0.1)
    oscs = [osc]

  } else {
    // 'synth' (default)
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    osc.connect(gainNode)

    const harm = ctx.createOscillator()
    harm.type = 'sine'
    harm.frequency.value = freq * 2
    const harmGain = ctx.createGain()
    harmGain.gain.value = 0.1
    harm.connect(harmGain)
    harmGain.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.45, now + 0.008)
    gainNode.gain.exponentialRampToValueAtTime(0.22, now + 0.15)

    osc.start(now); harm.start(now)
    oscs = [osc, harm]
  }

  _active.set(midiNote, { gainNode, oscs, gen })
  return gen
}

export function stopNote(midiNote, gen = null) {
  const entry = _active.get(midiNote)
  if (!entry) return
  if (gen !== null && entry.gen !== gen) return
  _active.delete(midiNote)

  const ctx = getCtx()
  const now = ctx.currentTime
  const { gainNode, oscs } = entry

  gainNode.gain.cancelScheduledValues(now)
  gainNode.gain.setValueAtTime(gainNode.gain.value, now)
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
  oscs.forEach(o => { try { o.stop(now + 0.26) } catch (_) {} })
}

export function stopAllNotes() {
  for (const midi of [..._active.keys()]) stopNote(midi)
}

export function playNote(midiNote, duration = 1.4) {
  if (!soundEnabled.value || midiStatus.value === 'connected') return
  const gen = startNote(midiNote)
  if (gen) setTimeout(() => stopNote(midiNote, gen), Math.round(duration * 1000))
}

export function playChord(midiNotes, duration = 1.8) {
  if (!soundEnabled.value || midiStatus.value === 'connected') return
  midiNotes.forEach(n => playNote(n, duration))
}
