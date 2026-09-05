import { jlptContent } from '../schedule/loadContent'
import type { ScheduleEntry } from '../schedule/types'
import { itemKey } from '../lesson/itemKey'

function toEntries(): ScheduleEntry[] {
  const entries: ScheduleEntry[] = []
  for (const level of Object.values(jlptContent)) {
    for (const item of level.kanji) entries.push({ kind: 'kanji', item })
    for (const item of level.grammar) entries.push({ kind: 'grammar', item })
  }
  return entries
}

/** Every kanji and grammar entry across N5/N4/N3, computed once at module load. */
export const allEntries: ScheduleEntry[] = toEntries()

/** Lookup from an item's stable SRS key back to its full entry. */
export const entriesByKey: Record<string, ScheduleEntry> = Object.fromEntries(
  allEntries.map((entry) => [itemKey(entry), entry]),
)
