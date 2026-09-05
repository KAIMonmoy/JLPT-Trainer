import { isDue, type SrsItem } from '../srs/srsEngine'
import type { ScheduleEntry } from '../schedule/types'

/** Every entry currently in SRS state whose Review interval has elapsed, excluding burned items. */
export function selectDueEntries(
  srsState: Record<string, SrsItem>,
  entriesByKey: Record<string, ScheduleEntry>,
  now: number,
): ScheduleEntry[] {
  return Object.entries(srsState)
    .filter(([, item]) => isDue(item, now))
    .map(([key]) => entriesByKey[key])
    .filter((entry): entry is ScheduleEntry => entry !== undefined)
}
