/** A-based chromatic note name (index 0 = A). */
export type NoteName =
  | 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#'

/** A-based note index (0–11, where 0 = A). */
export type NoteIndex = number

/** C-based semitone (0–11, where 0 = C). Used by chord detection. */
export type Semitone = number
