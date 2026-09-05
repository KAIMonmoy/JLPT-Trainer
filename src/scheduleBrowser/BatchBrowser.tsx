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
      <h1>Schedule</h1>
      <p>
        Day {batchNumber + 1} of {total}
      </p>
      <button type="button" onClick={() => go(-1)} disabled={batchNumber === 0}>
        Previous
      </button>
      <button type="button" onClick={() => go(1)} disabled={batchNumber === total - 1}>
        Next
      </button>
      <ul>
        {batch.map((entry, index) => (
          // Content occasionally has duplicate rows for the same pattern within a level
          // (a data-pipeline issue upstream, tracked separately) — index keeps React happy.
          <li key={`${itemKey(entry)}-${index}`}>
            {entryLabel(entry)} ({entry.item.level}, {entry.kind})
          </li>
        ))}
      </ul>
    </section>
  )
}
