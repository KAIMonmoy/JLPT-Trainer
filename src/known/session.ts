import { itemKey } from '../lesson/itemKey'
import type { LessonState } from '../lesson/store'
import type { JlptLevel } from '../pipeline/kanji/types'
import { entryLabel } from '../schedule/entryLabel'
import type { ScheduleEntry } from '../schedule/types'
import { markKnown } from '../srs/srsEngine'

/** Filters entries down to a single JLPT level, or returns all of them when `level` is null. */
export function filterEntriesByLevel(entries: readonly ScheduleEntry[], level: JlptLevel | null): ScheduleEntry[] {
  if (level === null) return [...entries]
  return entries.filter((entry) => entry.item.level === level)
}

/** Filters entries down to a single kind (kanji or grammar), or returns all of them when `kind` is null. */
export function filterEntriesByKind(
  entries: readonly ScheduleEntry[],
  kind: ScheduleEntry['kind'] | null,
): ScheduleEntry[] {
  if (kind === null) return [...entries]
  return entries.filter((entry) => entry.kind === kind)
}

export type KnownStatusFilter = 'all' | 'known' | 'unknown'

/** Filters entries by Known status, using the caller's definition of "known" for a given entry. */
export function filterEntriesByKnownStatus(
  entries: readonly ScheduleEntry[],
  status: KnownStatusFilter,
  isKnown: (entry: ScheduleEntry) => boolean,
): ScheduleEntry[] {
  if (status === 'all') return [...entries]
  return entries.filter((entry) => isKnown(entry) === (status === 'known'))
}

/** Filters entries whose character/pattern or meaning contains the query (case-insensitive). */
export function searchEntries(entries: readonly ScheduleEntry[], query: string): ScheduleEntry[] {
  const q = query.trim().toLowerCase()
  if (q === '') return [...entries]
  return entries.filter((entry) => {
    const label = entryLabel(entry).toLowerCase()
    const meaning = entry.item.meaning.toLowerCase()
    return label.includes(q) || meaning.includes(q)
  })
}

/** Flags an entry Known: inserts it into SRS state at Guru 1, as if it had reached that stage organically. */
export function markEntryKnown(state: LessonState, entry: ScheduleEntry, now: number): LessonState {
  const key = itemKey(entry)
  return { ...state, srsState: { ...state.srsState, [key]: markKnown(now) } }
}
