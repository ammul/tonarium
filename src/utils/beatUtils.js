import { BEAT_PATTERNS } from '@tonarium/core'
import { INSTRUMENTS } from '@/audio/drumEngine.js'

export const GROOVE_INST_MAP = { 'Kick': 0, 'Snare': 1, 'Hi-Hat': 3 }

export function createEmptyPattern() {
  return Array.from({ length: INSTRUMENTS.length }, () => new Array(16).fill(false))
}

export function buildPatternFromBeat(idx) {
  const bp = BEAT_PATTERNS[idx]
  if (!bp) return createEmptyPattern()
  const pattern = createEmptyPattern()
  for (const row of bp.rows) {
    const instIdx = GROOVE_INST_MAP[row.name]
    if (instIdx !== undefined) pattern[instIdx] = row.steps.map(s => s === 1)
  }
  return pattern
}
