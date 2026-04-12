/** A scale available in the Scale Visualizer. */
export interface VisualizerScale {
  id: string
  label: string
  /** Semitone intervals relative to root (A-based, 0–11). */
  intervals: number[]
  description: string
}
