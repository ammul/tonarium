let _ctx         = null
let _compressor  = null
let _jamGain     = null   // manual note playing (pad / guitar / piano)
let _beatGain    = null   // drum hits
let _progGain    = null   // progression chord playback

export function getCtx() {
  if (!_ctx) {
    _ctx = new AudioContext()

    _compressor = _ctx.createDynamicsCompressor()
    _compressor.threshold.value = -18
    _compressor.knee.value      = 6
    _compressor.ratio.value     = 4
    _compressor.attack.value    = 0.003
    _compressor.release.value   = 0.1
    _compressor.connect(_ctx.destination)

    _jamGain = _ctx.createGain()
    _jamGain.connect(_compressor)

    _beatGain = _ctx.createGain()
    _beatGain.connect(_compressor)

    _progGain = _ctx.createGain()
    _progGain.connect(_compressor)
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
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
