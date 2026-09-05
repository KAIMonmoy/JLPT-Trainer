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
    <section className="flex flex-col items-center text-center">
      <p className="text-sm text-ink-soft">
        {title} — {positionLabel(index, queue.length)}
      </p>

      {currentEntry?.kind === 'kanji' && (
        <div className="mt-6 flex w-full flex-col items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-md border border-line bg-paper-dim font-serif text-6xl">
            {currentEntry.item.character}
          </div>
          <div className="flex w-full flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-left">
              <span className="text-sm text-ink-soft">Meaning</span>
              <input
                className="rounded-md border border-line bg-transparent px-3.5 py-2.5 outline-none focus-visible:border-indigo focus-visible:ring-2 focus-visible:ring-indigo/30"
                value={meaning}
                disabled={grade !== null}
                onChange={(e) => setMeaning(e.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-left">
              <span className="text-sm text-ink-soft">Onyomi</span>
              <input
                className="rounded-md border border-line bg-transparent px-3.5 py-2.5 outline-none focus-visible:border-indigo focus-visible:ring-2 focus-visible:ring-indigo/30"
                value={onyomi}
                disabled={grade !== null}
                onChange={(e) => setOnyomi(e.target.value)}
                autoComplete="off"
              />
            </label>
          </div>
          {grade === null && (
            <button
              type="button"
              onClick={submitKanjiAnswer}
              className="w-full rounded-md bg-indigo py-3 font-medium text-paper"
            >
              Check
            </button>
          )}
        </div>
      )}

      {currentEntry?.kind === 'grammar' && (
        <div className="mt-6 flex w-full flex-col gap-6">
          <p className="text-lg leading-relaxed">{blankSentence(currentEntry.item.example)}</p>
          <ul className="flex flex-col gap-2.5">
            {grammarChoices.map((choice) => {
              const isSelected = selectedChoice === choice
              const showResult = grade !== null && isSelected
              return (
                <li key={choice}>
                  <button
                    type="button"
                    disabled={grade !== null}
                    onClick={() => selectGrammarChoice(choice)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-md border px-4 py-3 text-left ${
                      showResult && grade?.wasCorrect
                        ? 'border-moss bg-moss-soft'
                        : showResult
                          ? 'border-vermillion bg-vermillion-soft'
                          : 'border-line'
                    }`}
                  >
                    {choice}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {grade && currentEntry && (
        <div className="mt-6 flex w-full flex-col items-center gap-4">
          <p className={grade.wasCorrect ? 'text-moss' : 'text-vermillion'}>
            {grade.wasCorrect ? 'Correct' : 'Incorrect'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {currentEntry.kind === 'kanji' && (
              <>
                <button type="button" onClick={() => reveal(currentEntry.item.jlptbenkyoUrl)} className="text-indigo underline underline-offset-2">
                  Reveal (jlptbenkyo)
                </button>
                <button type="button" onClick={() => reveal(currentEntry.item.wanikaniUrl)} className="text-indigo underline underline-offset-2">
                  Reveal (WaniKani)
                </button>
              </>
            )}
            {currentEntry.kind === 'grammar' && (
              <button type="button" onClick={() => reveal(currentEntry.item.jlptbenkyoUrl)} className="text-indigo underline underline-offset-2">
                Reveal
              </button>
            )}
            {renderAfterGrade?.(currentEntry, grade.wasCorrect)}
          </div>
          <button type="button" onClick={goNext} className="w-full rounded-md bg-indigo py-3 font-medium text-paper">
            Next
          </button>
        </div>
      )}
    </section>
  )
}
