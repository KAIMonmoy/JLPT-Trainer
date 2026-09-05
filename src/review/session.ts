import type { JlptLevel } from '../pipeline/kanji/types'
import { itemKey } from '../lesson/itemKey'
import { isDue, type SrsItem } from '../srs/srsEngine'
import { LEVEL_ORDER, type ScheduleEntry } from '../schedule/types'

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

export interface StageBreakdown {
  level: JlptLevel
  /** Apprentice 1–4 combined. */
  apprentice: number
  /** Guru 1–2 combined. */
  guru: number
  master: number
  burned: number
}

/**
 * Per-Level counts of Introduced items bucketed into Apprentice/Guru/Master/Burned (see CONTEXT.md).
 * Levels with no Introduced items are omitted, since they'd add no signal.
 */
export function selectStageBreakdownByLevel(
  entries: readonly ScheduleEntry[],
  srsState: Record<string, SrsItem>,
): StageBreakdown[] {
  const breakdownByLevel = new Map<JlptLevel, StageBreakdown>(
    LEVEL_ORDER.map((level) => [level, { level, apprentice: 0, guru: 0, master: 0, burned: 0 }]),
  )

  for (const entry of entries) {
    const srsItem = srsState[itemKey(entry)]
    if (!srsItem) continue
    const breakdown = breakdownByLevel.get(entry.item.level)
    if (!breakdown) continue

    if (srsItem.burned) {
      breakdown.burned++
    } else if (srsItem.stage.startsWith('apprentice')) {
      breakdown.apprentice++
    } else if (srsItem.stage.startsWith('guru')) {
      breakdown.guru++
    } else {
      breakdown.master++
    }
  }

  return LEVEL_ORDER.map((level) => breakdownByLevel.get(level)!).filter(
    (breakdown) => breakdown.apprentice + breakdown.guru + breakdown.master + breakdown.burned > 0,
  )
}
