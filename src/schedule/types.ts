import type { JlptLevel, KanjiItem } from '../pipeline/kanji/types'
import type { GrammarItem } from '../pipeline/grammar/types'

export type ScheduleEntry =
  | { kind: 'kanji'; item: KanjiItem }
  | { kind: 'grammar'; item: GrammarItem }

export type Batch = ScheduleEntry[]

/** Levels in schedule order — the order a learner works through them. */
export const LEVEL_ORDER: readonly JlptLevel[] = ['N5', 'N4', 'N3']
