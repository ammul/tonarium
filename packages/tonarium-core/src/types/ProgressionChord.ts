import type { ChordTypeId } from './Chord.js'
import type { NoteIndex } from './Note.js'

/** A chord within a progression, stored as degree-relative (key-agnostic). */
export interface ProgressionChord {
  /** Semitone offset from the root (A-based). */
  degree: number
  type: ChordTypeId
  numeral: string
}

/**
 * A ProgressionChord enriched at runtime with a resolved root note index
 * and octave. Not stored in JSON.
 */
export interface EnrichedChord extends ProgressionChord {
  _rootIdx: NoteIndex
  _octave: number
}
