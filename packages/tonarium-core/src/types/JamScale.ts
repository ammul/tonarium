/** A scale available in the Jam view. */
export interface JamScale {
  id: string
  label: string
  /** Semitone intervals relative to root (A-based, 0–11). */
  intervals: number[]
  description: string
}
