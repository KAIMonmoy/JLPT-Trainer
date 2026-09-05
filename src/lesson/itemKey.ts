import type { ScheduleEntry } from '../schedule/types'

/** Stable identity for an item across sessions and content types, used as the SRS state map key. */
export function itemKey(entry: ScheduleEntry): string {
  return entry.kind === 'kanji' ? `kanji:${entry.item.character}` : `grammar:${entry.item.pattern}`
}
