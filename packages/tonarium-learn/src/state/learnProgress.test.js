import { describe, it, expect, beforeEach } from 'vitest'
import {
  LEARN_LESSON_IDS,
  completedLessons,
  markLessonComplete,
  resetLearnProgress,
  isLessonComplete,
  learnPercentage,
} from './learnProgress.js'

beforeEach(() => {
  localStorage.clear()
  resetLearnProgress()
})

describe('learnProgress', () => {
  it('LEARN_LESSON_IDS has 9 lessons', () => {
    expect(LEARN_LESSON_IDS).toHaveLength(9)
  })

  it('starts empty with 0 percent', () => {
    expect(completedLessons.value.size).toBe(0)
    expect(learnPercentage.value).toBe(0)
  })

  it('markLessonComplete adds the lesson and updates percentage', () => {
    markLessonComplete('root-notes')
    expect(isLessonComplete('root-notes')).toBe(true)
    expect(learnPercentage.value).toBe(11)
  })

  it('marking the same lesson twice is a no-op', () => {
    markLessonComplete('root-notes')
    markLessonComplete('root-notes')
    expect(completedLessons.value.size).toBe(1)
  })

  it('ignores unknown lesson ids', () => {
    markLessonComplete('not-a-lesson')
    expect(completedLessons.value.size).toBe(0)
  })

  it('100% when all lessons complete', () => {
    for (const id of LEARN_LESSON_IDS) markLessonComplete(id)
    expect(learnPercentage.value).toBe(100)
  })

  it('persists to localStorage', () => {
    markLessonComplete('root-notes')
    markLessonComplete('intervals')
    const raw = localStorage.getItem('learnCompleted')
    expect(JSON.parse(raw)).toEqual(['root-notes', 'intervals'])
  })

  it('resetLearnProgress clears state and localStorage', () => {
    markLessonComplete('root-notes')
    resetLearnProgress()
    expect(completedLessons.value.size).toBe(0)
    expect(JSON.parse(localStorage.getItem('learnCompleted'))).toEqual([])
  })
})
