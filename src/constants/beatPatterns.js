export const BEAT_PATTERNS = [
  {
    name: 'Basic rock beat',
    genre: 'Rock / Pop',
    bpm: 120,
    desc: 'Kick on beats 1 and 3, snare on 2 and 4, hi-hat on every 8th note. The foundation of rock, pop, and almost everything else.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    ],
  },
  {
    name: 'Four-on-the-floor',
    genre: 'House / Techno',
    bpm: 128,
    desc: 'Kick on every beat, open hi-hat on the offbeats. The backbone of house, techno, and dance music.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
    ],
  },
  {
    name: 'Syncopated kick',
    genre: 'Rock / Groove',
    bpm: 110,
    desc: 'Kick displaced off the beat adds forward motion and groove. Snare still holds down 2 and 4 as the anchor.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    ],
  },
  {
    name: 'Boom-bap',
    genre: 'Hip-hop',
    bpm: 90,
    desc: 'Classic 90s hip-hop feel. Kick on beat 1 and the "and" of 2, heavy snare on 2 and 4, steady 8th hi-hats.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    ],
  },
  {
    name: 'Funk groove',
    genre: 'Funk / R&B',
    bpm: 100,
    desc: '16th note hi-hats drive urgency. Kick and snare are syncopated to create that deep pocket feel.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,1, 0,0,0,0, 1,0,0,0, 0,1,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    ],
  },
  {
    name: 'Half-time',
    genre: 'Hip-hop / Trap',
    bpm: 80,
    desc: 'Snare only on beat 3 gives a heavy, slow-motion feel twice as wide as a standard bar. Common in hip-hop and trap.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
      { name: 'Hi-Hat', steps: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    ],
  },
  {
    name: 'One drop',
    genre: 'Reggae',
    bpm: 75,
    desc: 'Kick falls only on beat 3 — the "one drop" that defines reggae. Offbeat hi-hats and a sparse snare carry the groove.',
    rows: [
      { name: 'Kick',   steps: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
    ],
  },
  {
    name: 'Bossa nova',
    genre: 'Bossa Nova / Latin',
    bpm: 120,
    desc: 'The classic Brazilian cross-rhythm kick pattern creates a floating, forward push. Steady 8th hi-hats keep it grounded.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,1,0,0, 0,0,1,0, 1,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    ],
  },
  {
    name: 'Afrobeat',
    genre: 'Afrobeat',
    bpm: 110,
    desc: 'Interlocking kick and snare create a dense, layered groove. Everything is in motion — no single part carries it alone.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0] },
      { name: 'Snare',  steps: [0,0,1,0, 1,0,0,0, 0,0,1,0, 0,1,0,0] },
      { name: 'Hi-Hat', steps: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    ],
  },
  {
    name: 'Trap hi-hats',
    genre: 'Trap',
    bpm: 140,
    desc: 'Irregular 16th note hi-hat pattern with gaps and clusters. Kick on 1 with off-beat ghost hits, snare holds down 2 and 4.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,1,0,1, 1,0,1,1, 0,1,1,0, 1,1,1,0] },
    ],
  },
]

export const BEAT_TIPS = [
  { num: '1', text: 'The <strong>backbeat</strong> is everything. Snare on beats 2 and 4 is what makes music groove rather than march. Lock that in first.' },
  { num: '2', text: '<strong>Beats 1, 5, 9, 13</strong> in the drum computer are the four quarter-note beats of one bar. Kick and snare live here.' },
  { num: '3', text: '<strong>Hi-hats subdivide time.</strong> 8th notes (every other step) feel steady. 16th notes (every step) feel urgent. Offbeat 8ths feel bouncy.' },
  { num: '4', text: '<strong>Leave space.</strong> A kick on every 16th step is noise, not a beat. What you don\'t play shapes the groove as much as what you do.' },
]
