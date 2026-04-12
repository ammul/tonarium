// ── Types (re-exported for consumers) ────────────────────────────────────────
export type * from './types/index.js'

// ── Imports: individual type aliases used in casts below ──────────────────────
import type {
  NoteName, NoteIndex, Semitone,
  ChordTypeMap, ChordSuffixMap, ChordDetectType,
  JamScale, VisualizerScale, LearnScale,
  Genre, Progression,
  BeatPattern,
  PianoBlackKey,
} from './types/index.js'

// ── Music constants ───────────────────────────────────────────────────────────
import _notes            from './data/notes.json'            assert { type: 'json' }
import _labels           from './data/labels.json'           assert { type: 'json' }
import _sharps           from './data/sharps.json'           assert { type: 'json' }
import _chordTypes       from './data/chordTypes.json'       assert { type: 'json' }
import _chordSuffix      from './data/chordSuffix.json'      assert { type: 'json' }
import _chordDetectTypes from './data/chordDetectTypes.json' assert { type: 'json' }
import _flatMap          from './data/flatMap.json'          assert { type: 'json' }
import _openStrings      from './data/openStrings.json'      assert { type: 'json' }
import _stringNames      from './data/stringNames.json'      assert { type: 'json' }
import _fretCount        from './data/fretCount.json'        assert { type: 'json' }
import _noteToSemi       from './data/noteToSemi.json'       assert { type: 'json' }
import _semiToName       from './data/semiToName.json'       assert { type: 'json' }
import _pianoWhite       from './data/pianoWhite.json'       assert { type: 'json' }
import _pianoBlack       from './data/pianoBlack.json'       assert { type: 'json' }

export const NOTES:              NoteName[]             = _notes as NoteName[]
export const LABELS:             string[]               = _labels
export const SHARPS:             Set<NoteName>          = new Set(_sharps as NoteName[])
export const CHORD_TYPES:        ChordTypeMap           = _chordTypes as unknown as ChordTypeMap
export const CHORD_SUFFIX:       ChordSuffixMap         = _chordSuffix as unknown as ChordSuffixMap
export const CHORD_DETECT_TYPES: ChordDetectType[]      = _chordDetectTypes as ChordDetectType[]
export const FLAT_MAP:           Record<string, NoteName> = _flatMap as Record<string, NoteName>
export const OPEN_STRINGS:       NoteIndex[]            = _openStrings
export const STRING_NAMES:       string[]               = _stringNames
export const FRET_COUNT:         number                 = _fretCount
export const NOTE_TO_SEMI:       Semitone[]             = _noteToSemi
export const SEMI_TO_NAME:       string[]               = _semiToName
export const PIANO_WHITE:        NoteIndex[]            = _pianoWhite
export const PIANO_BLACK:        PianoBlackKey[]        = _pianoBlack as PianoBlackKey[]

// ── Scales ────────────────────────────────────────────────────────────────────
import _jamScales        from './data/jamScales.json'        assert { type: 'json' }
import _visualizerScales from './data/visualizerScales.json' assert { type: 'json' }
import _learnScales      from './data/learnScales.json'      assert { type: 'json' }

export const JAM_SCALES:        JamScale[]        = _jamScales
export const VISUALIZER_SCALES: VisualizerScale[] = _visualizerScales
export const LEARN_SCALES:      LearnScale[]      = _learnScales

// ── Progressions ──────────────────────────────────────────────────────────────
import _genres       from './data/genres.json'       assert { type: 'json' }
import _progressions from './data/progressions.json' assert { type: 'json' }

export const GENRES:           Genre[]       = _genres
export const ALL_PROGRESSIONS: Progression[] = _progressions as unknown as Progression[]

// ── Beat patterns ─────────────────────────────────────────────────────────────
import _beatPatterns from './data/beatPatterns.json' assert { type: 'json' }

export const BEAT_PATTERNS: BeatPattern[] = _beatPatterns as unknown as BeatPattern[]
