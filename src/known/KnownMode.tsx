import { useState } from 'react'
import { allEntries } from '../content/allEntries'
import { itemKey } from '../lesson/itemKey'
import { loadState, saveState, type LessonState } from '../lesson/store'
import type { JlptLevel } from '../pipeline/kanji/types'
import { entryLabel } from '../schedule/entryLabel'
import type { ScheduleEntry } from '../schedule/types'
import { isMature } from '../srs/srsEngine'
import {
  filterEntriesByKind,
  filterEntriesByKnownStatus,
  filterEntriesByLevel,
  markEntryKnown,
  searchEntries,
  type KnownStatusFilter,
} from './session'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3']
const KINDS: { label: string; value: ScheduleEntry['kind'] | null }[] = [
  { label: 'All', value: null },
  { label: 'Kanji', value: 'kanji' },
  { label: 'Grammar', value: 'grammar' },
]
const KNOWN_STATUSES: { label: string; value: KnownStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Known', value: 'known' },
  { label: 'Unknown', value: 'unknown' },
]

export function KnownMode() {
  const [state, setState] = useState<LessonState>(() => loadState(window.localStorage))
  const [level, setLevel] = useState<JlptLevel | null>(null)
  const [kind, setKind] = useState<ScheduleEntry['kind'] | null>(null)
  const [status, setStatus] = useState<KnownStatusFilter>('all')
  const [query, setQuery] = useState('')

  function isEntryKnown(entry: ScheduleEntry): boolean {
    const srsItem = state.srsState[itemKey(entry)]
    return srsItem !== undefined && isMature(srsItem.stage)
  }

  let entries = filterEntriesByLevel(allEntries, level)
  entries = filterEntriesByKind(entries, kind)
  entries = filterEntriesByKnownStatus(entries, status, isEntryKnown)
  entries = searchEntries(entries, query)

  function markKnown(entry: ScheduleEntry) {
    const nextState = markEntryKnown(state, entry, Date.now())
    saveState(window.localStorage, nextState)
    setState(nextState)
  }

  return (
    <section>
      <h1 className="text-3xl">Known items</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search meaning or reading"
        className="mt-5 w-full rounded-md border border-line bg-transparent px-3.5 py-2.5 outline-none focus-visible:border-indigo focus-visible:ring-2 focus-visible:ring-indigo/30"
      />

      <div className="mt-4 flex flex-col gap-2.5">
        <FilterRow
          value={level}
          onChange={setLevel}
          options={[{ label: 'All levels', value: null }, ...LEVELS.map((l) => ({ label: l, value: l }))]}
        />
        <FilterRow value={kind} onChange={setKind} options={KINDS} />
        <FilterRow value={status} onChange={setStatus} options={KNOWN_STATUSES} />
      </div>

      <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
        {entries.map((entry, index) => {
          const key = itemKey(entry)
          const known = isEntryKnown(entry)
          return (
            // Content occasionally has duplicate rows for the same pattern within a level
            // (a data-pipeline issue upstream, tracked separately) — index keeps React happy.
            <li key={`${key}-${index}`} className="flex items-center justify-between gap-3 py-3">
              <span>
                {entryLabel(entry)} <span className="text-sm text-ink-soft">({entry.item.level})</span>
              </span>
              {known ? (
                <span className="shrink-0 text-sm text-moss">Known</span>
              ) : (
                <button
                  type="button"
                  onClick={() => markKnown(entry)}
                  className="shrink-0 rounded-md border border-line px-3.5 py-2.5 text-sm"
                >
                  Mark Known
                </button>
              )}
            </li>
          )
        })}
        {entries.length === 0 && <li className="py-6 text-center text-ink-soft">No items match these filters.</li>}
      </ul>
    </section>
  )
}

interface FilterRowProps<T extends string | null> {
  value: T
  onChange: (value: T) => void
  options: { label: string; value: T }[]
}

function FilterRow<T extends string | null>({ value, onChange, options }: FilterRowProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={`shrink-0 rounded-full border px-4 py-2.5 text-sm ${
              active ? 'border-indigo bg-indigo text-paper' : 'border-line text-ink-soft'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
