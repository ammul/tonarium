let _ctx         = null
let _compressor  = null
let _jamGain     = null   // manual note playing (pad / guitar / piano)
let _beatGain    = null   // drum hits
let _progGain    = null   // progression chord playback

// Base gain levels that equalize perceived loudness across channels at slider = 1.0.
// Drums stack multiple simultaneous hits; chords play 3-4 notes at once.
export const JAM_GAIN_BASE  = 1.0
export const BEAT_GAIN_BASE = 0.55
export const PROG_GAIN_BASE = 0.35

export function getCtx() {
  if (!_ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    _ctx = new Ctx()

    _compressor = _ctx.createDynamicsCompressor()
    _compressor.threshold.value = -18
    _compressor.knee.value      = 6
    _compressor.ratio.value     = 4
    _compressor.attack.value    = 0.003
    _compressor.release.value   = 0.1
    _compressor.connect(_ctx.destination)

    _jamGain = _ctx.createGain()
    _jamGain.gain.value = JAM_GAIN_BASE
    _jamGain.connect(_compressor)

    _beatGain = _ctx.createGain()
    _beatGain.gain.value = BEAT_GAIN_BASE
    _beatGain.connect(_compressor)

    _progGain = _ctx.createGain()
    _progGain.gain.value = PROG_GAIN_BASE
    _progGain.connect(_compressor)
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

// Call from the first user gesture to reliably unlock iOS audio.
// Playing a silent buffer forces the audio pipeline active; resume() alone
// is not always sufficient on iOS Safari.
export function unlockCtx() {
  const ctx = getCtx()
  try {
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(ctx.destination)
    src.start(0)
  } catch (_) {}
  if (ctx.state === 'suspended') ctx.resume()
}

export function getCompressor() {
  getCtx()
  return _compressor
}

export function getJamDest() {
  getCtx()
  return _jamGain
}

export function getBeatDest() {
  getCtx()
  return _beatGain
}

export function getProgDest() {
  getCtx()
  return _progGain
}
