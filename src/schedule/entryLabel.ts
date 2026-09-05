import type { ScheduleEntry } from './types'

/** Display text for an entry: the kanji character, or the grammar pattern. */
export function entryLabel(entry: ScheduleEntry): string {
  return entry.kind === 'kanji' ? entry.item.character : entry.item.pattern
}
