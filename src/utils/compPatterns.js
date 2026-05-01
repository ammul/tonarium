export function getCompHit(compPattern, stepInChord, beatsPerChord, chordNoteCount) {
  if (chordNoteCount === 0) return []
  const all = Array.from({ length: chordNoteCount }, (_, i) => i)

  if (compPattern === 'offbeat') {
    if (beatsPerChord === 1) return stepInChord === 0 ? all : []
    const beat = Math.floor(stepInChord / 4)
    return (stepInChord % 4 === 0 && beat % 2 === 1) ? all : []
  }
  if (compPattern === 'arp') {
    if (stepInChord % 4 !== 0) return []
    const beat = Math.floor(stepInChord / 4)
    return [beat % chordNoteCount]
  }
  if (compPattern === 'waltz') {
    if (beatsPerChord < 2) return stepInChord === 0 ? all : []
    if (stepInChord === 0) return [0]
    if (stepInChord % 4 === 0) return chordNoteCount > 1 ? all.slice(1) : all
    return []
  }
  return stepInChord === 0 ? all : []
}
