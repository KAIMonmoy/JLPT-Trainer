import { isExactMatch, isFuzzyMatch, toKatakana } from '../grader/grader'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { ExampleSentence, GrammarItem } from '../pipeline/grammar/types'
import type { Batch, ScheduleEntry } from '../schedule/types'
import { STAGE_INTERVAL_MS, type SrsItem } from '../srs/srsEngine'
import { itemKey } from './itemKey'
import type { LessonState } from './store'

export function selectNextBatch(
  schedule: readonly Batch[],
  completedBatches: readonly number[],
): { batchNumber: number; batch: Batch } | null {
  const completed = new Set(completedBatches)
  for (let batchNumber = 0; batchNumber < schedule.length; batchNumber++) {
    if (!completed.has(batchNumber)) {
      return { batchNumber, batch: schedule[batchNumber] }
    }
  }
  return null
}

/** Fisher-Yates shuffle. `random` is injectable so callers can get deterministic output in tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Interleaves and shuffles a batch's kanji and grammar items into one presentation order.
 * Entries already present in SRS state (e.g. flagged Known ahead of their scheduled batch)
 * are excluded, since they're no longer un-introduced.
 */
export function buildLessonQueue(
  batch: Batch,
  shuffleFn: (items: readonly ScheduleEntry[]) => ScheduleEntry[] = (items) => shuffle(items),
  srsState: Record<string, SrsItem> = {},
): ScheduleEntry[] {
  const notYetIntroduced = batch.filter((entry) => !(itemKey(entry) in srsState))
  return shuffleFn(notYetIntroduced)
}

/** Lesson Groups (see CONTEXT.md) hold this many items, except possibly the last. */
export const LESSON_GROUP_SIZE = 4

/**
 * Splits a Lesson's queue into consecutive Lesson Groups of `groupSize` items,
 * preserving order. The final group holds whatever remains (1..groupSize items).
 */
export function groupIntoLessonGroups<T>(items: readonly T[], groupSize: number): T[][] {
  const groups: T[][] = []
  for (let cursor = 0; cursor < items.length; cursor += groupSize) {
    groups.push(items.slice(cursor, cursor + groupSize))
  }
  return groups
}

export interface KanjiAnswer {
  meaning: string
  onyomi: string
}

export function gradeKanjiAnswer(item: KanjiItem, answer: KanjiAnswer): boolean {
  const meaningCorrect = isFuzzyMatch(item.meaning, answer.meaning)
  const onyomiCorrect = item.onyomi.some((reading) => isExactMatch(reading, toKatakana(answer.onyomi)))
  return meaningCorrect && onyomiCorrect
}

export function gradeGrammarAnswer(item: GrammarItem, selectedPattern: string): boolean {
  return selectedPattern === item.pattern
}

/** Renders a grammar example sentence with its pattern span replaced by a blank. */
export function blankSentence(example: ExampleSentence): string {
  if (example.blankStart === null || example.blankEnd === null) return example.japanese
  const blank = '＿＿'
  return example.japanese.slice(0, example.blankStart) + blank + example.japanese.slice(example.blankEnd)
}

/** Builds the 4 MCQ choices (correct pattern + 3 curated distractors), shuffled. */
export function buildGrammarChoices(
  item: GrammarItem,
  shuffleFn: (items: readonly string[]) => string[] = (items) => shuffle(items),
): string[] {
  return shuffleFn([item.pattern, ...item.distractors])
}

/**
 * Inserts every batch item into SRS state at Apprentice 1, unless it's already
 * present (e.g. fast-tracked via the Known flag), and marks the batch completed.
 */
export function completeBatch(state: LessonState, batchNumber: number, batch: Batch, now: number): LessonState {
  const srsState = { ...state.srsState }
  for (const entry of batch) {
    const key = itemKey(entry)
    if (!(key in srsState)) {
      srsState[key] = { stage: 'apprentice1', burned: false, nextReviewAt: now + STAGE_INTERVAL_MS.apprentice1 }
    }
  }

  const completedBatches = state.completedBatches.includes(batchNumber)
    ? state.completedBatches
    : [...state.completedBatches, batchNumber]

  return { srsState, completedBatches }
}
