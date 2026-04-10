let _ctx = null
let _compressor = null

export function getCtx() {
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

export function getCompressor() {
  getCtx()
  return _compressor
}
