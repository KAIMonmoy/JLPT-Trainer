import { useMemo, useState, type ReactNode } from 'react'
import type { ScheduleEntry } from '../schedule/types'
import { blankSentence, buildGrammarChoices, gradeGrammarAnswer, gradeKanjiAnswer } from '../lesson/session'

interface GradeResult {
  wasCorrect: boolean
}

function reveal(url: string): void {
  window.open(url, '_blank', 'noopener')
}

export interface SessionProps {
  title: string
  queue: ScheduleEntry[]
  positionLabel: (index: number, total: number) => string
  /** Called immediately once an item is graded, so a mode can apply its own SRS transition. */
  onAnswer: (entry: ScheduleEntry, wasCorrect: boolean) => void
  /** Called once the last item's Next button is pressed. */
  onComplete: () => void
  /** Extra controls shown alongside Reveal/Next once an item has been graded (e.g. Exam's Burn). */
  renderAfterGrade?: (entry: ScheduleEntry, wasCorrect: boolean) => ReactNode
}

/**
 * Shared study-session UI: presents one item at a time (typed recall for kanji, MCQ for grammar),
 * grades it, and offers Reveal + Next. Reused by Lesson, Review, and Exam — they differ only in
 * which items are queued and what happens on answer/completion.
 */
export function Session({ title, queue, positionLabel, onAnswer, onComplete, renderAfterGrade }: SessionProps) {
  const [index, setIndex] = useState(0)
  const [grade, setGrade] = useState<GradeResult | null>(null)
  const [meaning, setMeaning] = useState('')
  const [onyomi, setOnyomi] = useState('')
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [choices, setChoices] = useState<string[]>(() =>
    queue[0]?.kind === 'grammar' ? buildGrammarChoices(queue[0].item) : [],
  )

  const currentEntry = queue[index] ?? null

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

  function submitKanjiAnswer() {
    if (!currentEntry || currentEntry.kind !== 'kanji') return
    const wasCorrect = gradeKanjiAnswer(currentEntry.item, { meaning, onyomi })
    setGrade({ wasCorrect })
    onAnswer(currentEntry, wasCorrect)
  }

  function selectGrammarChoice(choice: string) {
    if (!currentEntry || currentEntry.kind !== 'grammar' || grade) return
    setSelectedChoice(choice)
    const wasCorrect = gradeGrammarAnswer(currentEntry.item, choice)
    setGrade({ wasCorrect })
    onAnswer(currentEntry, wasCorrect)
  }

  function goNext() {
    const nextIndex = index + 1
    if (nextIndex < queue.length) {
      setIndex(nextIndex)
      resetPerItemState()
      const nextEntry = queue[nextIndex]
      setChoices(nextEntry.kind === 'grammar' ? buildGrammarChoices(nextEntry.item) : [])
      return
    }
    onComplete()
  }

  return (
    <section>
      <p>
        {title} — {positionLabel(index, queue.length)}
      </p>

      {currentEntry?.kind === 'kanji' && (
        <div>
          <p style={{ fontSize: '3rem' }}>{currentEntry.item.character}</p>
          <label>
            Meaning
            <input value={meaning} disabled={grade !== null} onChange={(e) => setMeaning(e.target.value)} />
          </label>
          <label>
            Onyomi
            <input value={onyomi} disabled={grade !== null} onChange={(e) => setOnyomi(e.target.value)} />
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

      {grade && currentEntry && (
        <div>
          <p>{grade.wasCorrect ? 'Correct' : 'Incorrect'}</p>
          {currentEntry.kind === 'kanji' && (
            <>
              <button type="button" onClick={() => reveal(currentEntry.item.jlptbenkyoUrl)}>
                Reveal (jlptbenkyo)
              </button>
              <button type="button" onClick={() => reveal(currentEntry.item.wanikaniUrl)}>
                Reveal (WaniKani)
              </button>
            </>
          )}
          {currentEntry.kind === 'grammar' && (
            <button type="button" onClick={() => reveal(currentEntry.item.jlptbenkyoUrl)}>
              Reveal
            </button>
          )}
          {renderAfterGrade?.(currentEntry, grade.wasCorrect)}
          <button type="button" onClick={goNext}>
            Next
          </button>
        </div>
      )}
    </section>
  )
}
