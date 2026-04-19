export const TERM_MAP = new Map([
  ['note',        { label: 'Note',             summary: 'A single musical pitch — the fundamental building block.', aliases: ['note', 'notes', 'pitch', 'pitches'] }],
  ['octave',      { label: 'Octave',           summary: '12 semitones up or down — same note name, doubled frequency.', aliases: ['octave', 'octaves'] }],
  ['interval',    { label: 'Interval',         summary: 'The distance between two notes, measured in semitones.', aliases: ['interval', 'intervals', 'semitone', 'semitones', 'half step', 'half steps'] }],
  ['root',        { label: 'Root Note',        summary: 'The tonal center that a scale or chord is built from.', aliases: ['root note', 'root notes', 'root', 'tonic'] }],
  ['scale',       { label: 'Scale',            summary: 'A fixed interval pattern that repeats from a root note.', aliases: ['scale', 'scales', 'mode', 'modes'] }],
  ['chord',       { label: 'Chord',            summary: 'Three or more notes played together.', aliases: ['chord', 'chords', 'triad', 'triads'] }],
  ['key',         { label: 'Key',              summary: 'The home note and scale that a piece of music revolves around.', aliases: ['key', 'keys'] }],
  ['progression', { label: 'Chord Progression', summary: 'A sequence of chords that creates movement and emotion.', aliases: ['chord progression', 'chord progressions', 'progression', 'progressions'] }],
  ['beat',        { label: 'Beat',             summary: 'The steady pulse of music — what you tap your foot to.', aliases: ['beat', 'beats', 'rhythm', 'rhythms'] }],
  ['bpm',         { label: 'BPM',              summary: 'Beats Per Minute — how fast the music moves.', aliases: ['BPM', 'bpm', 'tempo'] }],
])

const _lookup = new Map()
for (const [id, entry] of TERM_MAP) {
  _lookup.set(id, id)
  for (const a of entry.aliases) _lookup.set(a.toLowerCase(), id)
}

export function findTerm(query) {
  return _lookup.get(query.trim().toLowerCase()) ?? null
}

let _regex = null
export function getTermRegex() {
  if (_regex) return _regex
  const phrases = []
  for (const entry of TERM_MAP.values()) {
    phrases.push(...entry.aliases)
  }
  phrases.sort((a, b) => b.length - a.length)
  const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  _regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  return _regex
}
