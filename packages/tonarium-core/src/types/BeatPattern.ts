/** A single instrument row within a beat pattern. */
export interface BeatRow {
  name: string
  /** 16-step pattern: 1 = hit, 0 = rest. */
  steps: (0 | 1)[]
}

/** A full beat pattern definition. */
export interface BeatPattern {
  name: string
  genre: string
  bpm: number
  desc: string
  rows: BeatRow[]
}
