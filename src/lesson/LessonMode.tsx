import { useMemo, useState } from 'react'
import type { ScheduleEntry } from '../schedule/types'
import { jlptSchedule } from '../schedule/jlptSchedule'
import {
  blankSentence,
  buildGrammarChoices,
  buildLessonQueue,
  completeBatch,
  gradeGrammarAnswer,
  gradeKanjiAnswer,
  selectNextBatch,
} from './session'
import { loadState, saveState, type LessonState } from './store'

interface ActiveSession {
  batchNumber: number
  batch: ScheduleEntry[]
  queue: ScheduleEntry[]
}

interface GradeResult {
  wasCorrect: boolean
}

function reveal(url: string): void {
  window.open(url, '_blank', 'noopener')
}

export function LessonMode() {
  const [state, setState] = useState<LessonState>(() => loadState(window.localStorage))
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [index, setIndex] = useState(0)
  const [grade, setGrade] = useState<GradeResult | null>(null)
  const [meaning, setMeaning] = useState('')
  const [onyomi, setOnyomi] = useState('')
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [choices, setChoices] = useState<string[]>([])
  const [justCompletedBatch, setJustCompletedBatch] = useState<{ batchNumber: number; count: number } | null>(
    null,
  )

  const currentEntry = session ? session.queue[index] : null

  const grammarChoices = useMemo(() => {
    if (!currentEntry || currentEntry.kind !== 'grammar') return []
    return choices
  }, [currentEntry, choices])

  function resetPerItemState() {
    setGrade(null)
    setMeaning('')
    setOnyomi('')
    setSelectedChoice(null)
  }

  function startLesson() {
    setJustCompletedBatch(null)
    const next = selectNextBatch(jlptSchedule, state.completedBatches)
    if (!next) {
      setSession(null)
      return
    }
    const queue = buildLessonQueue(next.batch)
    setSession({ batchNumber: next.batchNumber, batch: next.batch, queue })
    setIndex(0)
    resetPerItemState()
    if (queue[0]?.kind === 'grammar') {
      setChoices(buildGrammarChoices(queue[0].item))
    }
  }

  function submitKanjiAnswer() {
    if (!currentEntry || currentEntry.kind !== 'kanji') return
    const wasCorrect = gradeKanjiAnswer(currentEntry.item, { meaning, onyomi })
    setGrade({ wasCorrect })
  }

  function selectGrammarChoice(choice: string) {
    if (!currentEntry || currentEntry.kind !== 'grammar' || grade) return
    setSelectedChoice(choice)
    setGrade({ wasCorrect: gradeGrammarAnswer(currentEntry.item, choice) })
  }

  function goNext() {
    if (!session) return
    const nextIndex = index + 1
    if (nextIndex < session.queue.length) {
      setIndex(nextIndex)
      resetPerItemState()
      const nextEntry = session.queue[nextIndex]
      if (nextEntry.kind === 'grammar') {
        setChoices(buildGrammarChoices(nextEntry.item))
      }
      return
    }

    const nextState = completeBatch(state, session.batchNumber, session.batch)
    saveState(window.localStorage, nextState)
    setState(nextState)
    setJustCompletedBatch({ batchNumber: session.batchNumber, count: session.batch.length })
    setSession(null)
  }

  if (!session) {
    return (
      <section>
        <h1>Lesson</h1>
        {justCompletedBatch && (
          <p>
            Batch {justCompletedBatch.batchNumber} complete — {justCompletedBatch.count} items added to your
            SRS pool.
          </p>
        )}
        <button type="button" onClick={startLesson}>
          Start Lesson
        </button>
        {selectNextBatch(jlptSchedule, state.completedBatches) === null && (
          <p>All batches have been completed.</p>
        )}
      </section>
    )
  }

  return (
    <section>
      <p>
        Batch {session.batchNumber} — item {index + 1} of {session.queue.length}
      </p>

      {currentEntry?.kind === 'kanji' && (
        <div>
          <p style={{ fontSize: '3rem' }}>{currentEntry.item.character}</p>
          <label>
            Meaning
            <input
              value={meaning}
              disabled={grade !== null}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </label>
          <label>
            Onyomi
            <input
              value={onyomi}
              disabled={grade !== null}
              onChange={(e) => setOnyomi(e.target.value)}
            />
          </label>
          {grade === null && (
            <button type="button" onClick={submitKanjiAnswer}>
              Check
            </button>
          )}
        </div>
      )}

      {currentEntry?.kind === 'grammar' && (
        <div>
          <p>{blankSentence(currentEntry.item.example)}</p>
          <ul>
            {grammarChoices.map((choice) => (
              <li key={choice}>
                <button
                  type="button"
                  disabled={grade !== null}
                  onClick={() => selectGrammarChoice(choice)}
                  aria-pressed={selectedChoice === choice}
                >
                  {choice}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {grade && (
        <div>
          <p>{grade.wasCorrect ? 'Correct' : 'Incorrect'}</p>
          {currentEntry?.kind === 'kanji' && (
            <>
              <button type="button" onClick={() => reveal(currentEntry.item.jlptbenkyoUrl)}>
                Reveal (jlptbenkyo)
              </button>
              <button type="button" onClick={() => reveal(currentEntry.item.wanikaniUrl)}>
                Reveal (WaniKani)
              </button>
            </>
          )}
          {currentEntry?.kind === 'grammar' && (
            <button type="button" onClick={() => reveal(currentEntry.item.jlptbenkyoUrl)}>
              Reveal
            </button>
          )}
          <button type="button" onClick={goNext}>
            Next
          </button>
        </div>
      )}
    </section>
  )
}
