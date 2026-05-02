<script setup>
import { ref } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import LearnLesson from './lesson/LearnLesson.vue'
import LessonIntro from './lesson/LessonIntro.vue'
import LessonSection from './lesson/LessonSection.vue'
import LessonFactCard from './lesson/LessonFactCard.vue'
import LessonText from './lesson/LessonText.vue'

const rootNoteIdx = ref(null)

function pickRootNote(i) {
  rootNoteIdx.value = i
  playNote(60 + NOTE_TO_SEMI[i])
}

function playRootOctave() {
  if (rootNoteIdx.value === null) return
  playNote(60 + NOTE_TO_SEMI[rootNoteIdx.value])
  setTimeout(() => playNote(72 + NOTE_TO_SEMI[rootNoteIdx.value], 0.8), 550)
}
</script>

<template>
  <LearnLesson id="root-notes">
    <LessonIntro>
      <LessonText text="Pick a note — that's your root. Everything else in music is named from here." />
    </LessonIntro>

    <LessonSection title="Try it">
      <div class="tc-learn-roots-picker">
        <NoteStripPicker :from-index="rootNoteIdx" @note-down="pickRootNote" />
      </div>

      <div class="tc-learn-roots-result">
        <template v-if="rootNoteIdx !== null">
          <div class="tc-learn-roots-rr-main">
            <div>
              <div class="tc-learn-roots-rr-name">{{ NOTES[rootNoteIdx] }}</div>
              <div class="tc-learn-roots-rr-label">your root note</div>
            </div>
            <button class="btn btn-sm btn-accent tc-learn-roots-rr-octave-btn" @click="playRootOctave">Hear it one octave up</button>
          </div>
        </template>
        <template v-else>
          <div class="tc-learn-roots-rr-hint">Tap any note to set your root</div>
        </template>
      </div>
    </LessonSection>

    <LessonSection title="Anatomy">
      <div class="tc-learn-roots-facts">
        <LessonFactCard heading="12 notes">
          <LessonText text="Western music uses 12 pitches before the pattern repeats — 7 naturals plus 5 sharps." />
        </LessonFactCard>
        <LessonFactCard heading="Octaves">
          <LessonText text="The same note at double the frequency — same name, higher pitch." />
        </LessonFactCard>
        <LessonFactCard heading="Keys">
          <LessonText text="When a song is in C major, C is the root — the note everything wants to return to." />
        </LessonFactCard>
      </div>
    </LessonSection>

    <div class="step-bridge">
      <LessonText text="Try picking the same note in different spots on the strip. Notice it sounds the same but sits higher or lower — that's an octave. Once you have a root, you can measure the distance to any other note. That distance is called an interval." />
    </div>
  </LearnLesson>
</template>

<style scoped>
.tc-learn-roots-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tc-learn-roots-result {
  min-height: 5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.3rem;
  padding: 1rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
}

.tc-learn-roots-rr-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  flex-wrap: wrap;
}

.tc-learn-roots-rr-name {
  font-size: clamp(1.8rem, 8vw, 2.8rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.04em;
}

.tc-learn-roots-rr-label {
  font-size: 0.78rem;
  color: var(--accent-mid);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.tc-learn-roots-rr-hint {
  font-size: 1rem;
  color: var(--text3);
  font-weight: 600;
}

.tc-learn-roots-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

@media (max-width: 480px) {
  .tc-learn-roots-facts { grid-template-columns: 1fr; }
}
</style>
