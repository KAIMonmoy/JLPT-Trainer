import type { KanjiItem } from '../pipeline/kanji/types'
import type { GrammarItem } from '../pipeline/grammar/types'

export type ScheduleEntry =
  | { kind: 'kanji'; item: KanjiItem }
  | { kind: 'grammar'; item: GrammarItem }

export type Batch = ScheduleEntry[]
