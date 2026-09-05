import { itemKey } from '../lesson/itemKey'
import type { LessonState } from '../lesson/store'
import type { JlptLevel } from '../pipeline/kanji/types'
import type { ScheduleEntry } from '../schedule/types'
import { markKnown } from '../srs/srsEngine'

/** Filters entries down to a single JLPT level, or returns all of them when `level` is null. */
export function filterEntriesByLevel(entries: readonly ScheduleEntry[], level: JlptLevel | null): ScheduleEntry[] {
  if (level === null) return [...entries]
  return entries.filter((entry) => entry.item.level === level)
}

/** Flags an entry Known: inserts it into SRS state at Guru 1, as if it had reached that stage organically. */
export function markEntryKnown(state: LessonState, entry: ScheduleEntry, now: number): LessonState {
  const key = itemKey(entry)
  return { ...state, srsState: { ...state.srsState, [key]: markKnown(now) } }
}
