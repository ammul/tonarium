export const TERM_MAP = new Map([
  ['note',         { label: 'Note',              summary: 'A single musical pitch — the fundamental building block.', aliases: ['note', 'notes', 'pitch', 'pitches'] }],
  ['octave',       { label: 'Octave',            summary: '12 semitones up or down — same note name, doubled frequency.', aliases: ['octave', 'octaves'] }],
  ['interval',     { label: 'Interval',          summary: 'The distance between two notes, measured in semitones.', aliases: ['interval', 'intervals', 'semitone', 'semitones', 'half step', 'half steps'] }],
  ['root',         { label: 'Root Note',         summary: 'The tonal center that a scale or chord is built from.', aliases: ['root note', 'root notes', 'root', 'tonic'] }],
  ['scale',        { label: 'Scale',             summary: 'A fixed interval pattern that repeats from a root note.', aliases: ['scale', 'scales', 'mode', 'modes'] }],
  ['chord',        { label: 'Chord',             summary: 'Three or more notes played together.', aliases: ['chord', 'chords'] }],
  ['triad',        { label: 'Triad',             summary: 'A three-note chord built from a root, third, and fifth.', aliases: ['triad', 'triads'] }],
  ['key',          { label: 'Key',               summary: 'The home note and scale that a piece of music revolves around.', aliases: ['key', 'keys'] }],
  ['progression',  { label: 'Chord Progression', summary: 'A sequence of chords that creates movement and emotion.', aliases: ['chord progression', 'chord progressions', 'progression', 'progressions'] }],
  ['beat',         { label: 'Beat',              summary: 'The steady pulse of music — what you tap your foot to.', aliases: ['beat', 'beats', 'rhythm', 'rhythms'] }],
  ['bpm',          { label: 'BPM',               summary: 'Beats Per Minute — how fast the music moves.', aliases: ['BPM', 'bpm', 'tempo'] }],
  ['pentatonic',   { label: 'Pentatonic',        summary: 'A 5-note scale that sounds friendly over almost any chord in its key.', aliases: ['pentatonic', 'pentatonic scale', 'pentatonics'] }],
  ['voicing',      { label: 'Voicing',           summary: 'How a chord is laid out across an instrument — which notes, in which order.', aliases: ['voicing', 'voicings'] }],
  ['downbeat',     { label: 'Downbeat',          summary: 'The strong "1" pulse at the start of each beat or bar.', aliases: ['downbeat', 'downbeats'] }],
  ['offbeat',      { label: 'Off-beat',          summary: 'The "and" between strong beats — where syncopation lives.', aliases: ['off-beat', 'offbeat', 'off beat', 'offbeats'] }],
  ['kick',         { label: 'Kick',              summary: 'The deep bass drum hit, usually on beats 1 and 3.', aliases: ['kick', 'kicks', 'kick drum', 'bass drum'] }],
  ['snare',        { label: 'Snare',             summary: 'The crack on beats 2 and 4 — the back-beat.', aliases: ['snare', 'snares', 'snare drum', 'back-beat', 'backbeat'] }],
  ['hihat',        { label: 'Hi-Hat',            summary: 'Closed or open cymbal pattern that subdivides each beat.', aliases: ['hi-hat', 'hihat', 'hi hat', 'hi-hats'] }],
  ['fifth',        { label: 'Fifth',             summary: 'The interval seven semitones up — the strongest consonance after the octave.', aliases: ['fifth', 'fifths', 'perfect fifth', '5th'] }],
  ['third',        { label: 'Third',             summary: 'The interval that decides whether a chord sounds major (4 semitones) or minor (3 semitones).', aliases: ['third', 'thirds', 'major third', 'minor third', '3rd'] }],
  ['comp',         { label: 'Comping',           summary: 'The rhythm pattern a chord is played with — block, arp, off-beat, or waltz.', aliases: ['comp', 'comping', 'comp pattern', 'comping pattern'] }],
  ['arpeggio',     { label: 'Arpeggio',          summary: "A chord whose notes are played one at a time instead of together.", aliases: ['arpeggio', 'arpeggios', 'arp', 'arps'] }],
  ['syncopation',  { label: 'Syncopation',       summary: 'Putting accents on weak beats or off-beats — the source of groove.', aliases: ['syncopation', 'syncopated', 'syncopate'] }],
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
  _regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  return _regex
}
