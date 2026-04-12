/** Identifier keys for built-in chord types. */
export type ChordTypeId = 'maj' | 'min' | 'dim' | 'aug' | 'dom7' | 'maj7' | 'min7' | 'sus4'

/** Semitone-interval arrays keyed by ChordTypeId. */
export type ChordTypeMap = Record<ChordTypeId, number[]>

/**
 * Display suffix for each chord type (e.g. 'm', '°', 'maj7').
 * Empty string means major (no suffix).
 */
export type ChordSuffixMap = Record<ChordTypeId, string>

/** A chord type entry used for detection via interval matching. */
export interface ChordDetectType {
  intervals: number[]
  suffix: string
  name: string
}
