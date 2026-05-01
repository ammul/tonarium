import { midiStatus } from '@/audio/midiManager.js'
import { soundEnabled } from '@/state/soundEnabled.js'
import { soundStyle } from '@/state/soundStyle.js'
import { getCtx, getJamDest } from '@/audio/audioContext.js'

let _gen = 0
const _active = new Map() // midiNote → { gainNode, oscs, gen }

function midiToFreq(note) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

function _synthesise(ctx, midiNote, dest, styleOverride, gen) {
  const freq = midiToFreq(midiNote)
  const now = ctx.currentTime
  const gainNode = ctx.createGain()
  gainNode.connect(dest ?? getJamDest())
  const style = styleOverride ?? soundStyle.value
  let oscs

  if (style === 'bell') {
    // Inharmonic metallic partials — characteristic of real bells
    gainNode.gain.setValueAtTime(0.3, now)
    const partials = [
      { ratio: 1.0,   level: 0.55, decay: 4.0 },
      { ratio: 2.756, level: 0.28, decay: 2.2 },
      { ratio: 5.404, level: 0.14, decay: 1.1 },
      { ratio: 8.0,   level: 0.05, decay: 0.5 },
    ]
    oscs = partials.map(p => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = freq * p.ratio
      const g = ctx.createGain()
      g.gain.setValueAtTime(p.level, now + 0.002)
      g.gain.exponentialRampToValueAtTime(0.001, now + p.decay)
      o.connect(g)
      g.connect(gainNode)
      o.start(now)
      return o
    })

  } else if (style === 'piano') {
    // Triangle fundamental + high harmonics that decay fast for a bright percussive attack
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    osc.connect(gainNode)

    const h4 = ctx.createOscillator()
    h4.type = 'sine'
    h4.frequency.value = freq * 4
    const h4g = ctx.createGain()
    h4g.gain.setValueAtTime(0.22, now)
    h4g.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    h4.connect(h4g)
    h4g.connect(gainNode)

    const h9 = ctx.createOscillator()
    h9.type = 'sine'
    h9.frequency.value = freq * 9
    const h9g = ctx.createGain()
    h9g.gain.setValueAtTime(0.07, now)
    h9g.gain.exponentialRampToValueAtTime(0.001, now + 0.07)
    h9.connect(h9g)
    h9g.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.42, now + 0.007)
    gainNode.gain.exponentialRampToValueAtTime(0.14, now + 0.6)
    gainNode.gain.exponentialRampToValueAtTime(0.07, now + 2.5)

    osc.start(now); h4.start(now); h9.start(now)
    oscs = [osc, h4, h9]

  } else if (style === 'pluck') {
    // Guitar/harp-like — bright pick transient, then warm decay over ~2s
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(freq * 14, now)
    filter.frequency.exponentialRampToValueAtTime(freq * 2.5, now + 0.6)
    filter.Q.value = 1
    filter.connect(gainNode)

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.connect(filter)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.003)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.2)

    osc.start(now)
    osc.stop(now + 2.3)
    oscs = [osc]

  } else if (style === 'marimba') {
    // Triangle fundamental + fast-decaying inharmonic partial for woody mallet character
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    osc.connect(gainNode)

    const h = ctx.createOscillator()
    h.type = 'sine'
    h.frequency.value = freq * 4.07
    const hg = ctx.createGain()
    hg.gain.setValueAtTime(0.35, now)
    hg.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    h.connect(hg)
    hg.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.38, now + 0.004)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.75)

    osc.start(now); h.start(now)
    osc.stop(now + 0.8); h.stop(now + 0.8)
    oscs = [osc, h]

  } else if (style === 'glass') {
    // Stacked sine harmonics with slow attack and long shimmer
    gainNode.gain.setValueAtTime(0.22, now)
    const partials = [
      { ratio: 1.0, level: 0.5,  decay: 4.0 },
      { ratio: 2.0, level: 0.25, decay: 2.5 },
      { ratio: 3.0, level: 0.12, decay: 1.5 },
      { ratio: 4.0, level: 0.05, decay: 0.8 },
    ]
    oscs = partials.map(p => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = freq * p.ratio
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(p.level, now + 0.08)
      g.gain.exponentialRampToValueAtTime(0.001, now + p.decay)
      o.connect(g)
      g.connect(gainNode)
      o.start(now)
      return o
    })

  } else if (style === 'pulse') {
    // Square wave through a resonant bandpass sweep — retro synth lead
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(freq * 4, now)
    filter.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.18)
    filter.Q.value = 5
    filter.connect(gainNode)

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = freq
    osc.connect(filter)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.22, now + 0.008)
    gainNode.gain.setValueAtTime(0.22, now + 0.1)

    osc.start(now)
    oscs = [osc]

  } else if (style === 'organ') {
    // Hammond-style sustained tone — sine fundamental plus drawbar harmonics
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.26, now + 0.012)
    const drawbars = [
      { ratio: 1.0, level: 0.5 },
      { ratio: 2.0, level: 0.32 },
      { ratio: 3.0, level: 0.18 },
      { ratio: 4.0, level: 0.1 },
      { ratio: 6.0, level: 0.05 },
    ]
    oscs = drawbars.map(d => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = freq * d.ratio
      const g = ctx.createGain()
      g.gain.value = d.level
      o.connect(g)
      g.connect(gainNode)
      o.start(now)
      return o
    })

  } else if (style === 'brass') {
    // Sawtooth with filter swell — closed to open, medium decay
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(freq * 1.2, now)
    filter.frequency.exponentialRampToValueAtTime(freq * 7, now + 0.1)
    filter.frequency.exponentialRampToValueAtTime(freq * 3.5, now + 0.45)
    filter.Q.value = 3.5
    filter.connect(gainNode)

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.connect(filter)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.04)
    gainNode.gain.setValueAtTime(0.3, now + 0.25)

    osc.start(now)
    oscs = [osc]

  } else if (style === 'kalimba') {
    // Thumb piano — inharmonic tine ratios with fast fundamental decay
    gainNode.gain.setValueAtTime(0.3, now)
    const tines = [
      { ratio: 1.0,  level: 0.55, decay: 2.2 },
      { ratio: 5.83, level: 0.22, decay: 0.9 },
      { ratio: 9.75, level: 0.08, decay: 0.4 },
    ]
    oscs = tines.map(t => {
      const o = ctx.createOscillator()
      o.type = 'sine'
      o.frequency.value = freq * t.ratio
      const g = ctx.createGain()
      g.gain.setValueAtTime(t.level, now + 0.001)
      g.gain.exponentialRampToValueAtTime(0.001, now + t.decay)
      o.connect(g)
      g.connect(gainNode)
      o.start(now)
      return o
    })

  } else if (style === 'rhodes') {
    const harmOsc = ctx.createOscillator()
    harmOsc.type = 'sine'
    harmOsc.frequency.value = freq * 7
    const harmGain = ctx.createGain()
    harmGain.gain.setValueAtTime(0.18, now)
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    harmOsc.connect(harmGain)
    harmGain.connect(gainNode)

    const tineOsc = ctx.createOscillator()
    tineOsc.type = 'sine'
    tineOsc.frequency.value = freq
    tineOsc.connect(gainNode)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.008)
    gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.9)

    const lfoOsc = ctx.createOscillator()
    lfoOsc.type = 'sine'
    lfoOsc.frequency.value = 5
    const lfoDepth = ctx.createGain()
    lfoDepth.gain.value = 0.07
    lfoOsc.connect(lfoDepth)
    lfoDepth.connect(gainNode.gain)

    harmOsc.start(now); harmOsc.stop(now + 0.1)
    tineOsc.start(now); lfoOsc.start(now)
    oscs = [tineOsc, lfoOsc, harmOsc]

  } else if (style === 'strings') {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = freq * 6
    filter.Q.value = 1.5
    filter.connect(gainNode)

    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.value = freq
    osc1.connect(filter)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.value = freq * 1.006
    const g2 = ctx.createGain()
    g2.gain.value = 0.8
    osc2.connect(g2); g2.connect(filter)

    const osc3 = ctx.createOscillator()
    osc3.type = 'sawtooth'
    osc3.frequency.value = freq * 0.994
    const g3 = ctx.createGain()
    g3.gain.value = 0.8
    osc3.connect(g3); g3.connect(filter)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.28, now + 0.3)

    const vibOsc = ctx.createOscillator()
    vibOsc.type = 'sine'
    vibOsc.frequency.value = 5.5
    const vibDepth = ctx.createGain()
    vibDepth.gain.value = freq * 0.002
    vibOsc.connect(vibDepth)
    vibDepth.connect(osc1.frequency)
    vibDepth.connect(osc2.frequency)
    vibDepth.connect(osc3.frequency)

    osc1.start(now); osc2.start(now); osc3.start(now); vibOsc.start(now)
    oscs = [osc1, osc2, osc3, vibOsc]

  } else {
    // 'synth' — detuned sawtooth pad through a lowpass filter
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = freq * 5
    filter.Q.value = 2.5
    filter.connect(gainNode)

    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.value = freq
    osc1.connect(filter)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.value = freq * 1.004
    const osc2g = ctx.createGain()
    osc2g.gain.value = 0.65
    osc2.connect(osc2g)
    osc2g.connect(filter)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.28, now + 0.055)
    gainNode.gain.setValueAtTime(0.28, now + 0.1)

    osc1.start(now); osc2.start(now)
    oscs = [osc1, osc2]
  }

  _active.set(midiNote, { gainNode, oscs, gen })
}

export function startNote(midiNote, dest = null, styleOverride = null) {
  if (!soundEnabled.value || midiStatus.value === 'connected') return 0
  stopNote(midiNote)
  const ctx = getCtx()
  const gen = ++_gen
  if (ctx.state === 'running') {
    _synthesise(ctx, midiNote, dest, styleOverride, gen)
  } else {
    ctx.resume().then(() => _synthesise(ctx, midiNote, dest, styleOverride, gen))
  }
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
