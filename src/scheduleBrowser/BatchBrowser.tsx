import { useState } from 'react'
import { jlptSchedule } from '../schedule/jlptSchedule'
import { itemKey } from '../lesson/itemKey'
import { loadState } from '../lesson/store'
import { entryLabel } from '../schedule/entryLabel'
import { clampBatchNumber, currentBatchNumber } from './session'

export function BatchBrowser() {
  const [batchNumber, setBatchNumber] = useState(() => {
    const state = loadState(window.localStorage)
    return currentBatchNumber(jlptSchedule, state.completedBatches)
  })

  const total = jlptSchedule.length
  const batch = jlptSchedule[batchNumber]

  function go(delta: number) {
    setBatchNumber((n) => clampBatchNumber(n + delta, jlptSchedule))
  }

  return (
    <section>
      <h1 className="text-3xl">Schedule</h1>
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={batchNumber === 0}
          className="rounded-md border border-line px-4 py-2.5 text-sm disabled:opacity-30"
        >
          Previous
        </button>
        <p className="text-ink-soft">
          Day {batchNumber + 1} of {total}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={batchNumber === total - 1}
          className="rounded-md border border-line px-4 py-2.5 text-sm disabled:opacity-30"
        >
          Next
        </button>
      </div>
      <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {batch.map((entry, index) => (
          // Content occasionally has duplicate rows for the same pattern within a level
          // (a data-pipeline issue upstream, tracked separately) — index keeps React happy.
          <li key={`${itemKey(entry)}-${index}`} className="flex items-baseline justify-between gap-3 py-3">
            <span>{entryLabel(entry)}</span>
            <span className="shrink-0 text-sm text-ink-soft">
              {entry.item.level}, {entry.kind}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
