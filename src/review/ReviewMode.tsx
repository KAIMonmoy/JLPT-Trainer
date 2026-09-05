import { useState } from 'react'
import { entriesByKey } from '../content/allEntries'
import { itemKey } from '../lesson/itemKey'
import { shuffle } from '../lesson/session'
import { loadState, saveState, type LessonState } from '../lesson/store'
import type { ScheduleEntry } from '../schedule/types'
import { Session } from '../session/Session'
import { applyAnswer } from '../srs/srsEngine'
import { selectDueEntries } from './session'

export function ReviewMode() {
  const [state, setState] = useState<LessonState>(() => loadState(window.localStorage))
  const [queue, setQueue] = useState<ScheduleEntry[] | null>(null)
  const [sessionId, setSessionId] = useState(0)
  const [justFinished, setJustFinished] = useState<number | null>(null)

  const dueCount = selectDueEntries(state.srsState, entriesByKey, Date.now()).length

  function startReview() {
    setJustFinished(null)
    const due = selectDueEntries(state.srsState, entriesByKey, Date.now())
    setQueue(shuffle(due))
    setSessionId((id) => id + 1)
  }

  function handleAnswer(entry: ScheduleEntry, wasCorrect: boolean) {
    const key = itemKey(entry)
    const current = state.srsState[key]
    if (!current) return
    const updated = applyAnswer(current, 'review', wasCorrect, Date.now())
    const nextState = { ...state, srsState: { ...state.srsState, [key]: updated } }
    saveState(window.localStorage, nextState)
    setState(nextState)
  }

  function handleComplete() {
    setJustFinished(queue?.length ?? 0)
    setQueue(null)
  }

  if (!queue) {
    return (
      <section>
        <h1>Review</h1>
        {justFinished !== null && <p>Review complete — {justFinished} items reviewed.</p>}
        <p>{dueCount} item(s) due for review.</p>
        <button type="button" onClick={startReview} disabled={dueCount === 0}>
          Start Review
        </button>
      </section>
    )
  }

  return (
    <Session
      key={sessionId}
      title="Review"
      queue={queue}
      positionLabel={(index, total) => `item ${index + 1} of ${total}`}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
    />
  )
}
