import type { GrammarItem } from '../pipeline/grammar/types'
import type { KanjiItem } from '../pipeline/kanji/types'
import { generateSchedule } from './generateSchedule'
import type { Batch, ScheduleEntry } from './types'

/**
 * Days allotted per phase: 2 weeks N5, 3.5 weeks N4, 5.5 weeks N3 (11 weeks /
 * 77 days total). 3.5 and 5.5 weeks don't convert to whole days evenly
 * (24.5 and 38.5) — N4 is rounded up and N3 rounded down so the three
 * phases still sum to exactly 77.
 */
export const PHASE_DAYS = {
  N5: 14,
  N4: 25,
  N3: 38,
} as const

export interface LevelContent {
  kanji: KanjiItem[]
  grammar: GrammarItem[]
}

export interface JlptContent {
  N5: LevelContent
  N4: LevelContent
  N3: LevelContent
}

function toEntries(content: LevelContent): ScheduleEntry[] {
  return [
    ...content.kanji.map((item): ScheduleEntry => ({ kind: 'kanji', item })),
    ...content.grammar.map((item): ScheduleEntry => ({ kind: 'grammar', item })),
  ]
}

/**
 * Builds the full, fixed batch schedule across all three phases, concatenated
 * N5 -> N4 -> N3 so batch number is one continuous index across the whole
 * plan (see CONTEXT.md: batches are addressed by number, not calendar date).
 */
export function buildJlptSchedule(content: JlptContent): Batch[] {
  return [
    ...generateSchedule(toEntries(content.N5), PHASE_DAYS.N5),
    ...generateSchedule(toEntries(content.N4), PHASE_DAYS.N4),
    ...generateSchedule(toEntries(content.N3), PHASE_DAYS.N3),
  ]
}
