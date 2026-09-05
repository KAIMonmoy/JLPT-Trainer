import { describe, expect, it } from 'vitest'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { GrammarItem } from '../pipeline/grammar/types'
import type { Batch, ScheduleEntry } from '../schedule/types'
import type { LessonState } from './store'
import { itemKey } from './itemKey'
import {
  blankSentence,
  buildGrammarChoices,
  buildLessonQueue,
  completeBatch,
  gradeGrammarAnswer,
  gradeKanjiAnswer,
  groupIntoLessonGroups,
  selectNextBatch,
  shuffle,
} from './session'

function kanji(character: string, overrides: Partial<KanjiItem> = {}): ScheduleEntry {
  const item: KanjiItem = {
    character,
    onyomi: ['ギ'],
    kunyomi: [],
    meaning: 'deliberation, consultation',
    level: 'N3',
    jlptbenkyoUrl: 'https://jlptbenkyo.com/k',
    wanikaniUrl: 'https://wanikani.com/k',
    ...overrides,
  }
  return { kind: 'kanji', item }
}

function grammar(pattern: string, overrides: Partial<GrammarItem> = {}): ScheduleEntry {
  const item: GrammarItem = {
    pattern,
    reading: 'kekkyoku',
    meaning: 'ultimately',
    level: 'N3',
    jlptbenkyoUrl: 'https://jlptbenkyo.com/g',
    example: { japanese: '彼は結局来ませんでした。', english: '', blankStart: 2, blankEnd: 4 },
    distractors: ['つまり', 'ついに', 'やっと'],
    ...overrides,
  }
  return { kind: 'grammar', item }
}

// deterministic "shuffle" stand-in: reverses the array
const reverse = <T>(items: readonly T[]): T[] => [...items].reverse()

const NOW = 1_700_000_000_000

describe('selectNextBatch', () => {
  const schedule: Batch[] = [[kanji('一')], [kanji('二')], [kanji('三')]]

  it('picks the lowest-numbered uncompleted batch', () => {
    expect(selectNextBatch(schedule, [0])).toEqual({ batchNumber: 1, batch: schedule[1] })
  })

  it('picks batch 0 when nothing is completed', () => {
    expect(selectNextBatch(schedule, [])).toEqual({ batchNumber: 0, batch: schedule[0] })
  })

  it('is order-independent in the completed list', () => {
    expect(selectNextBatch(schedule, [2, 0])).toEqual({ batchNumber: 1, batch: schedule[1] })
  })

  it('returns null once every batch is completed', () => {
    expect(selectNextBatch(schedule, [0, 1, 2])).toBeNull()
  })
})

describe('shuffle', () => {
  it('preserves every element without mutating the input', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input, () => 0.5)
    expect(result).not.toBe(input)
    expect([...result].sort()).toEqual(input)
  })

  it('is deterministic for a given random source', () => {
    const input = [1, 2, 3, 4, 5]
    expect(shuffle(input, () => 0)).toEqual(shuffle(input, () => 0))
  })
})

describe('buildLessonQueue', () => {
  it('returns every entry from the batch exactly once, interleaved by the shuffle', () => {
    const batch: Batch = [kanji('一'), kanji('二'), grammar('結局'), grammar('AもBも')]
    const queue = buildLessonQueue(batch, reverse)
    expect(queue).toHaveLength(batch.length)
    expect(queue).toEqual([...batch].reverse())
  })

  it('excludes entries already present in SRS state (e.g. flagged Known ahead of schedule)', () => {
    const batch: Batch = [kanji('一'), kanji('二'), grammar('結局')]
    const srsState = { [itemKey(batch[1])]: { stage: 'guru1' as const, burned: false, nextReviewAt: 0 } }
    const queue = buildLessonQueue(batch, reverse, srsState)
    expect(queue).toEqual([grammar('結局'), kanji('一')])
  })
})

describe('groupIntoLessonGroups', () => {
  it('splits evenly-divisible items into equal-size groups, preserving order', () => {
    const items = [kanji('一'), kanji('二'), kanji('三'), kanji('四'), kanji('五'), kanji('六'), kanji('七'), kanji('八')]
    expect(groupIntoLessonGroups(items, 4)).toEqual([items.slice(0, 4), items.slice(4, 8)])
  })

  it('puts the remainder in a smaller final group', () => {
    const items = [kanji('一'), kanji('二'), kanji('三'), kanji('四'), kanji('五'), kanji('六')]
    const groups = groupIntoLessonGroups(items, 4)
    expect(groups).toEqual([items.slice(0, 4), items.slice(4, 6)])
    expect(groups[1]).toHaveLength(2)
  })

  it('returns a single partial group when there are fewer items than the group size', () => {
    const items = [kanji('一'), kanji('二')]
    expect(groupIntoLessonGroups(items, 4)).toEqual([items])
  })

  it('returns an empty array for empty input', () => {
    expect(groupIntoLessonGroups([], 4)).toEqual([])
  })
})

describe('gradeKanjiAnswer', () => {
  const item = kanji('議').item as KanjiItem

  it('passes on an exact onyomi and exact meaning', () => {
    expect(gradeKanjiAnswer(item, { onyomi: 'ギ', meaning: 'deliberation, consultation' })).toBe(true)
  })

  it('passes on a fuzzy (typo) meaning match', () => {
    expect(gradeKanjiAnswer(item, { onyomi: 'ギ', meaning: 'deliberation, consultetion' })).toBe(true)
  })

  it('fails when the onyomi is wrong even if the meaning matches', () => {
    expect(gradeKanjiAnswer(item, { onyomi: 'チ', meaning: 'deliberation, consultation' })).toBe(false)
  })

  it('fails when the meaning is not a close enough match', () => {
    expect(gradeKanjiAnswer(item, { onyomi: 'ギ', meaning: 'people' })).toBe(false)
  })

  it('matches any of multiple onyomi readings', () => {
    const multi = kanji('民', { onyomi: ['ミン', 'タミ'] }).item as KanjiItem
    expect(gradeKanjiAnswer(multi, { onyomi: 'タミ', meaning: 'deliberation, consultation' })).toBe(true)
  })

  it('passes when the onyomi is typed in hiragana instead of katakana', () => {
    expect(gradeKanjiAnswer(item, { onyomi: 'ぎ', meaning: 'deliberation, consultation' })).toBe(true)
  })

  it('passes when the onyomi mixes hiragana and katakana', () => {
    const multi = kanji('民', { onyomi: ['シュウ'] }).item as KanjiItem
    expect(gradeKanjiAnswer(multi, { onyomi: 'しゅウ', meaning: 'deliberation, consultation' })).toBe(true)
  })

  it('passes when the answer matches just one clause of a comma-separated meaning', () => {
    const multi = kanji('一', { meaning: 'one, one radical (no.1)' }).item as KanjiItem
    expect(gradeKanjiAnswer(multi, { onyomi: 'ギ', meaning: 'one' })).toBe(true)
  })
})

describe('gradeGrammarAnswer', () => {
  const item = grammar('結局').item as GrammarItem

  it('passes when the selected pattern matches', () => {
    expect(gradeGrammarAnswer(item, '結局')).toBe(true)
  })

  it('fails when a distractor is selected', () => {
    expect(gradeGrammarAnswer(item, 'つまり')).toBe(false)
  })
})

describe('buildGrammarChoices', () => {
  it('includes the correct pattern plus all 3 distractors, shuffled', () => {
    const item = grammar('結局').item as GrammarItem
    const choices = buildGrammarChoices(item, reverse)
    expect(choices).toHaveLength(4)
    expect(new Set(choices)).toEqual(new Set(['結局', 'つまり', 'ついに', 'やっと']))
    expect(choices).toEqual(['結局', 'つまり', 'ついに', 'やっと'].reverse())
  })
})

describe('blankSentence', () => {
  it('replaces the pattern span with a blank', () => {
    const example = { japanese: '彼は結局来ませんでした。', english: '', blankStart: 2, blankEnd: 4 }
    expect(blankSentence(example)).toBe('彼は＿＿来ませんでした。')
  })

  it('returns the sentence unchanged when the span could not be located', () => {
    const example = { japanese: '彼は結局来ませんでした。', english: '', blankStart: null, blankEnd: null }
    expect(blankSentence(example)).toBe('彼は結局来ませんでした。')
  })
})

describe('completeBatch', () => {
  function state(overrides: Partial<LessonState> = {}): LessonState {
    return { srsState: {}, completedBatches: [], ...overrides }
  }

  it('inserts every new item into SRS state at apprentice1', () => {
    const batch: Batch = [kanji('一'), grammar('結局')]
    const result = completeBatch(state(), 0, batch, NOW)
    expect(result.srsState[itemKey(batch[0])]).toEqual({
      stage: 'apprentice1',
      burned: false,
      nextReviewAt: NOW + 4 * 3600_000,
    })
    expect(result.srsState[itemKey(batch[1])]).toEqual({
      stage: 'apprentice1',
      burned: false,
      nextReviewAt: NOW + 4 * 3600_000,
    })
  })

  it('marks the batch number as completed', () => {
    const result = completeBatch(state(), 2, [kanji('一')], NOW)
    expect(result.completedBatches).toEqual([2])
  })

  it('does not duplicate an already-completed batch number', () => {
    const result = completeBatch(state({ completedBatches: [2] }), 2, [kanji('一')], NOW)
    expect(result.completedBatches).toEqual([2])
  })

  it('does not overwrite an item already present in SRS state (e.g. flagged Known)', () => {
    const batch: Batch = [kanji('一')]
    const known = { stage: 'guru1' as const, burned: false, nextReviewAt: NOW }
    const result = completeBatch(state({ srsState: { [itemKey(batch[0])]: known } }), 0, batch, NOW)
    expect(result.srsState[itemKey(batch[0])]).toEqual(known)
  })

  it('does not mutate the input state', () => {
    const original = state()
    completeBatch(original, 0, [kanji('一')], NOW)
    expect(original).toEqual(state())
  })
})
