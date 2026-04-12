import type { NoteIndex } from './Note.js'

/** Descriptor for a black key on the piano keyboard. */
export interface PianoBlackKey {
  /** A-based note index. */
  noteIdx: NoteIndex
  /** Number of white keys to the left (used for CSS left% positioning). */
  after: number
}
