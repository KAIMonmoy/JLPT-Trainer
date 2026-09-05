import { isMature, type SrsItem } from '../srs/srsEngine'
import type { ScheduleEntry } from '../schedule/types'

/**
 * Every entry currently at Guru 1 or above (Mature), excluding burned items. Unlike Review,
 * this is never time-gated — Exam is user-triggered, not scheduled.
 */
export function selectMatureEntries(
  srsState: Record<string, SrsItem>,
  entriesByKey: Record<string, ScheduleEntry>,
): ScheduleEntry[] {
  return Object.entries(srsState)
    .filter(([, item]) => !item.burned && isMature(item.stage))
    .map(([key]) => entriesByKey[key])
    .filter((entry): entry is ScheduleEntry => entry !== undefined)
}
