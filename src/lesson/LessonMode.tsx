import { useState } from 'react'
import type { ScheduleEntry } from '../schedule/types'
import { jlptSchedule } from '../schedule/jlptSchedule'
import { Session } from '../session/Session'
import { buildLessonQueue, completeBatch, selectNextBatch } from './session'
import { loadState, saveState, type LessonState } from './store'

interface ActiveSession {
  batchNumber: number
  batch: ScheduleEntry[]
  queue: ScheduleEntry[]
}

export function LessonMode() {
  const [state, setState] = useState<LessonState>(() => loadState(window.localStorage))
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [justCompletedBatch, setJustCompletedBatch] = useState<{ batchNumber: number; count: number } | null>(
    null,
  )

  function startLesson() {
    setJustCompletedBatch(null)
    const next = selectNextBatch(jlptSchedule, state.completedBatches)
    if (!next) {
      setSession(null)
      return
    }
    const queue = buildLessonQueue(next.batch, undefined, state.srsState)
    if (queue.length === 0) {
      // Every item in this batch was already flagged Known ahead of schedule — nothing left to teach.
      const nextState = completeBatch(state, next.batchNumber, next.batch, Date.now())
      saveState(window.localStorage, nextState)
      setState(nextState)
      setJustCompletedBatch({ batchNumber: next.batchNumber, count: 0 })
      return
    }
    setSession({ batchNumber: next.batchNumber, batch: next.batch, queue })
  }

  function handleComplete() {
    if (!session) return
    const nextState = completeBatch(state, session.batchNumber, session.batch, Date.now())
    saveState(window.localStorage, nextState)
    setState(nextState)
    setJustCompletedBatch({ batchNumber: session.batchNumber, count: session.queue.length })
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
    <Session
      key={session.batchNumber}
      title={`Lesson — Batch ${session.batchNumber}`}
      queue={session.queue}
      positionLabel={(index, total) => `item ${index + 1} of ${total}`}
      onAnswer={() => {}}
      onComplete={handleComplete}
    />
  )
}
