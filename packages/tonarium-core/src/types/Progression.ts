import type { ProgressionChord } from './ProgressionChord.js'

/** Tonal quality of a progression. */
export type ProgressionKey = 'major' | 'minor'

/** A chord progression entry as stored in JSON. */
export interface Progression {
  id: string
  genre: string
  key: ProgressionKey
  label: string
  numeral: string
  examples: string
  chords: ProgressionChord[]
}
