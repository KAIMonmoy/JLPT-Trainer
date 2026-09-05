import type { ScheduleEntry } from '../schedule/types'

/**
 * Stable identity for an item across sessions and content types, used as the SRS state map key.
 * Includes the level because the same grammar pattern is legitimately re-taught at multiple JLPT
 * levels (with a different example/distractor set each time) and would otherwise collide.
 */
export function itemKey(entry: ScheduleEntry): string {
  return entry.kind === 'kanji'
    ? `kanji:${entry.item.level}:${entry.item.character}`
    : `grammar:${entry.item.level}:${entry.item.pattern}`
}
