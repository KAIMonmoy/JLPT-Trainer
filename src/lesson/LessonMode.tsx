import { useState } from 'react'
import type { ScheduleEntry } from '../schedule/types'
import { jlptSchedule } from '../schedule/jlptSchedule'
import { Session } from '../session/Session'
import { buildLessonQueue, completeBatch, groupIntoLessonGroups, LESSON_GROUP_SIZE, selectNextBatch } from './session'
import { loadState, saveState, type LessonState } from './store'
import { saveName } from './name'

interface ActiveSession {
  batchNumber: number
  batch: ScheduleEntry[]
  groups: ScheduleEntry[][]
  groupIndex: number
}

interface ContentStepProps {
  group: ScheduleEntry[]
  onDone: () => void
}

/** Shows each item in a Lesson Group's full content, one at a time, before that group is quizzed. */
function ContentStep({ group, onDone }: ContentStepProps) {
  const [index, setIndex] = useState(0)
  const entry = group[index]

  function next() {
    if (index + 1 < group.length) {
      setIndex(index + 1)
      return
    }
    onDone()
  }

  return (
    <section className="flex flex-col items-center gap-6 text-center">
      <p className="text-sm text-ink-soft">
        Content — item {index + 1} of {group.length}
      </p>
      {entry.kind === 'kanji' && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-32 w-32 items-center justify-center rounded-md border border-line bg-paper-dim font-serif text-6xl">
            {entry.item.character}
          </div>
          <p>Meaning: {entry.item.meaning}</p>
          <p>Onyomi: {entry.item.onyomi.join(', ')}</p>
        </div>
      )}
      {entry.kind === 'grammar' && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg">{entry.item.example.japanese}</p>
          <p className="text-ink-soft">Pattern: {entry.item.pattern}</p>
        </div>
      )}
      <button type="button" onClick={next} className="w-full rounded-md bg-indigo py-3 font-medium text-paper">
        Next
      </button>
    </section>
  )
}

interface LessonModeProps {
  name: string | null
  onNameChange: (name: string) => void
}

export function LessonMode({ name, onNameChange }: LessonModeProps) {
  const [state, setState] = useState<LessonState>(() => loadState(window.localStorage))
  const [session, setSession] = useState<ActiveSession | null>(null)
  const [phase, setPhase] = useState<'content' | 'quiz'>('content')
  const [justCompletedBatch, setJustCompletedBatch] = useState<{ batchNumber: number; count: number } | null>(
    null,
  )
  const [editingName, setEditingName] = useState(false)

  function handleSetName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = new FormData(e.currentTarget).get('name')
    if (typeof value !== 'string') return
    const trimmed = value.trim()
    if (trimmed === '') return
    saveName(window.localStorage, trimmed)
    onNameChange(trimmed)
    setEditingName(false)
  }

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
    const groups = groupIntoLessonGroups(queue, LESSON_GROUP_SIZE)
    setSession({ batchNumber: next.batchNumber, batch: next.batch, groups, groupIndex: 0 })
    setPhase('content')
  }

  function handleGroupQuizComplete() {
    if (!session) return
    if (session.groupIndex + 1 < session.groups.length) {
      setSession({ ...session, groupIndex: session.groupIndex + 1 })
      setPhase('content')
      return
    }

    const totalItems = session.groups.reduce((sum, group) => sum + group.length, 0)
    const nextState = completeBatch(state, session.batchNumber, session.batch, Date.now())
    saveState(window.localStorage, nextState)
    setState(nextState)
    setJustCompletedBatch({ batchNumber: session.batchNumber, count: totalItems })
    setSession(null)
  }

  if (!name || editingName) {
    return (
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl">JLPT Dojo</h1>
        <form onSubmit={handleSetName} className="flex w-full flex-col gap-2.5">
          <label htmlFor="name" className="text-ink-soft">
            What should we call you?
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoFocus
            defaultValue={name ?? undefined}
            className="rounded-md border border-line bg-transparent px-3.5 py-2.5 text-center outline-none focus-visible:border-indigo focus-visible:ring-2 focus-visible:ring-indigo/30"
          />
          <button type="submit" className="w-full rounded-md bg-indigo py-3 font-medium text-paper">
            {name ? 'Save' : "Let's go"}
          </button>
        </form>
      </section>
    )
  }

  if (!session) {
    return (
      <section className="flex flex-col items-center gap-5 text-center">
        <button
          type="button"
          onClick={() => setEditingName(true)}
          className="text-sm tracking-wide text-ink-soft uppercase"
        >
          Welcome back, {name}
        </button>
        <h1 className="text-3xl">Lesson</h1>
        {justCompletedBatch && (
          <p className="text-ink-soft">
            Batch {justCompletedBatch.batchNumber} complete — {justCompletedBatch.count} items added to your
            SRS pool.
          </p>
        )}
        <button
          type="button"
          onClick={startLesson}
          disabled={selectNextBatch(jlptSchedule, state.completedBatches) === null}
          className="w-full rounded-md bg-indigo py-3 font-medium text-paper disabled:opacity-40"
        >
          Start Lesson
        </button>
        {selectNextBatch(jlptSchedule, state.completedBatches) === null && (
          <p className="text-ink-soft">All batches have been completed.</p>
        )}
      </section>
    )
  }

  const group = session.groups[session.groupIndex]

  if (phase === 'content') {
    return (
      <ContentStep
        key={session.groupIndex}
        group={group}
        onDone={() => setPhase('quiz')}
      />
    )
  }

  return (
    <Session
      key={`${session.batchNumber}-${session.groupIndex}`}
      title={`Lesson — Batch ${session.batchNumber} — Group ${session.groupIndex + 1} of ${session.groups.length}`}
      queue={group}
      positionLabel={(index, total) => `item ${index + 1} of ${total}`}
      onAnswer={() => {}}
      onComplete={handleGroupQuizComplete}
    />
  )
}
