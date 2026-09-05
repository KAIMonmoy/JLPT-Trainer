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
      <section className="flex flex-col items-center gap-5 text-center">
        <h1 className="text-3xl">Exam</h1>
        {justFinished !== null && <p className="text-ink-soft">Exam complete — {justFinished} items tested.</p>}
        <p className="text-ink-soft">{matureCount} mature item(s) available.</p>
        <button
          type="button"
          onClick={startExam}
          disabled={matureCount === 0}
          className="w-full rounded-md bg-indigo py-3 font-medium text-paper disabled:opacity-40"
        >
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
        if (burnedKeys.has(key)) return <span className="text-ink-soft">Burned</span>
        return (
          <button type="button" onClick={() => handleBurn(entry)} className="text-vermillion underline underline-offset-2">
            Burn
          </button>
        )
      }}
    />
  )
}
