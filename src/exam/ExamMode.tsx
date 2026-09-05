import { useState } from 'react'
import { entriesByKey } from '../content/allEntries'
import { itemKey } from '../lesson/itemKey'
import { shuffle } from '../lesson/session'
import { loadState, saveState, type LessonState } from '../lesson/store'
import type { ScheduleEntry } from '../schedule/types'
import { Session } from '../session/Session'
import { applyAnswer, burn } from '../srs/srsEngine'
import { selectMatureEntries } from './session'

export function ExamMode() {
  const [state, setState] = useState<LessonState>(() => loadState(window.localStorage))
  const [queue, setQueue] = useState<ScheduleEntry[] | null>(null)
  const [sessionId, setSessionId] = useState(0)
  const [burnedKeys, setBurnedKeys] = useState<Set<string>>(new Set())
  const [justFinished, setJustFinished] = useState<number | null>(null)

  const matureCount = selectMatureEntries(state.srsState, entriesByKey).length

  function startExam() {
    setJustFinished(null)
    const mature = selectMatureEntries(state.srsState, entriesByKey)
    setQueue(shuffle(mature))
    setBurnedKeys(new Set())
    setSessionId((id) => id + 1)
  }

  function handleAnswer(entry: ScheduleEntry, wasCorrect: boolean) {
    const key = itemKey(entry)
    const current = state.srsState[key]
    if (!current) return
    const updated = applyAnswer(current, 'exam', wasCorrect, Date.now())
    const nextState = { ...state, srsState: { ...state.srsState, [key]: updated } }
    saveState(window.localStorage, nextState)
    setState(nextState)
  }

  function handleBurn(entry: ScheduleEntry) {
    const key = itemKey(entry)
    const current = state.srsState[key]
    if (!current) return
    const updated = burn(current, { mode: 'exam', wasCorrect: true })
    const nextState = { ...state, srsState: { ...state.srsState, [key]: updated } }
    saveState(window.localStorage, nextState)
    setState(nextState)
    setBurnedKeys((keys) => new Set(keys).add(key))
  }

  function handleComplete() {
    setJustFinished(queue?.length ?? 0)
    setQueue(null)
  }

  if (!queue) {
    return (
      <section>
        <h1>Exam</h1>
        {justFinished !== null && <p>Exam complete — {justFinished} items tested.</p>}
        <p>{matureCount} mature item(s) available.</p>
        <button type="button" onClick={startExam} disabled={matureCount === 0}>
          Start Exam
        </button>
      </section>
    )
  }

  return (
    <Session
      key={sessionId}
      title="Exam"
      queue={queue}
      positionLabel={(index, total) => `item ${index + 1} of ${total}`}
      onAnswer={handleAnswer}
      onComplete={handleComplete}
      renderAfterGrade={(entry, wasCorrect) => {
        if (!wasCorrect) return null
        const key = itemKey(entry)
        if (burnedKeys.has(key)) return <span> Burned.</span>
        return (
          <button type="button" onClick={() => handleBurn(entry)}>
            Burn
          </button>
        )
      }}
    />
  )
}
