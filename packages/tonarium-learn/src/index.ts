// Constants
export { INTERVALS } from './constants/intervals.js'
export { CHORD_TYPES, IMPROV_CHORD_TYPES, IMPROV_EXAMPLES } from './constants/chordTypes.js'
export { BEAT_TIPS } from './constants/beatPatterns.js'
export { LEARN_PROGS } from './constants/progressions.js'

// State
export {
  LEARN_LESSON_IDS,
  completedLessons,
  markLessonComplete,
  resetLearnProgress,
  isLessonComplete,
  learnPercentage,
} from './state/learnProgress.js'

// Lesson framework
export { default as LearnLesson }    from './components/lesson/LearnLesson.vue'
export { default as LessonIntro }    from './components/lesson/LessonIntro.vue'
export { default as LessonSection }  from './components/lesson/LessonSection.vue'
export { default as LessonFactCard } from './components/lesson/LessonFactCard.vue'
export { default as LessonText }     from './components/lesson/LessonText.vue'

// Components
export { default as LearnMode } from './components/LearnMode.vue'
export { default as LearnStepNav } from './components/LearnStepNav.vue'
export { default as LearnStepFooter } from './components/LearnStepFooter.vue'
export { default as LearnRootNotes } from './components/LearnRootNotes.vue'
export { default as LearnIntervals } from './components/LearnIntervals.vue'
export { default as LearnScales } from './components/LearnScales.vue'
export { default as LearnChords } from './components/LearnChords.vue'
export { default as LearnProgressions } from './components/LearnProgressions.vue'
export { default as LearnImprovising } from './components/LearnImprovising.vue'
export { default as LearnBeats } from './components/LearnBeats.vue'
export { default as LearnSongStructure } from './components/LearnSongStructure.vue'
export { default as LearnJamSession } from './components/LearnJamSession.vue'
