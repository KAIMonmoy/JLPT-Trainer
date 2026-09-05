import { useState } from 'react'
import { allEntries } from '../content/allEntries'
import { itemKey } from '../lesson/itemKey'
import { loadState, saveState, type LessonState } from '../lesson/store'
import type { JlptLevel } from '../pipeline/kanji/types'
import { entryLabel } from '../schedule/entryLabel'
import type { ScheduleEntry } from '../schedule/types'
import { isMature } from '../srs/srsEngine'
import { filterEntriesByLevel, markEntryKnown } from './session'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3']

export function KnownMode() {
  const [state, setState] = useState<LessonState>(() => loadState(window.localStorage))
  const [level, setLevel] = useState<JlptLevel | null>(null)

  const entries = filterEntriesByLevel(allEntries, level)

  function markKnown(entry: ScheduleEntry) {
    const nextState = markEntryKnown(state, entry, Date.now())
    saveState(window.localStorage, nextState)
    setState(nextState)
  }

  return (
    <section>
      <h1>Known items</h1>
      <label>
        Level
        <select
          value={level ?? 'all'}
          onChange={(e) => setLevel(e.target.value === 'all' ? null : (e.target.value as JlptLevel))}
        >
          <option value="all">All</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <ul>
        {entries.map((entry, index) => {
          const key = itemKey(entry)
          const srsItem = state.srsState[key]
          const known = srsItem !== undefined && isMature(srsItem.stage)
          return (
            // Content occasionally has duplicate rows for the same pattern within a level
            // (a data-pipeline issue upstream, tracked separately) — index keeps React happy.
            <li key={`${key}-${index}`}>
              {entryLabel(entry)} ({entry.item.level})
              {known ? (
                <span> Known</span>
              ) : (
                <button type="button" onClick={() => markKnown(entry)}>
                  Mark Known
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
