import { describe, expect, it } from 'vitest'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { GrammarItem } from '../pipeline/grammar/types'
import type { ScheduleEntry } from '../schedule/types'
import type { LessonState } from '../lesson/store'
import { itemKey } from '../lesson/itemKey'
import { filterEntriesByLevel, markEntryKnown } from './session'

const NOW = 1_700_000_000_000

function kanjiEntry(character: string, level: KanjiItem['level']): ScheduleEntry {
  const item: KanjiItem = {
    character,
    onyomi: ['ギ'],
    kunyomi: [],
    meaning: 'deliberation',
    level,
    jlptbenkyoUrl: 'https://jlptbenkyo.com/k',
    wanikaniUrl: 'https://wanikani.com/k',
  }
  return { kind: 'kanji', item }
}

function grammarEntry(pattern: string, level: GrammarItem['level']): ScheduleEntry {
  const item: GrammarItem = {
    pattern,
    reading: 'kekkyoku',
    meaning: 'ultimately',
    level,
    jlptbenkyoUrl: 'https://jlptbenkyo.com/g',
    example: { japanese: '結局', english: '', blankStart: null, blankEnd: null },
    distractors: ['a', 'b', 'c'],
  }
  return { kind: 'grammar', item }
}

describe('filterEntriesByLevel', () => {
  const entries = [kanjiEntry('一', 'N5'), kanjiEntry('二', 'N3'), grammarEntry('結局', 'N3')]

  it('returns only entries matching the given level', () => {
    expect(filterEntriesByLevel(entries, 'N3')).toEqual([entries[1], entries[2]])
  })

  it('returns every entry when level is null', () => {
    expect(filterEntriesByLevel(entries, null)).toEqual(entries)
  })
})

describe('markEntryKnown', () => {
  it('inserts the entry into SRS state at guru1', () => {
    const entry = kanjiEntry('一', 'N3')
    const state: LessonState = { srsState: {}, completedBatches: [] }
    const result = markEntryKnown(state, entry, NOW)
    expect(result.srsState[itemKey(entry)]).toEqual({ stage: 'guru1', burned: false, nextReviewAt: NOW + 7 * 24 * 3600_000 })
  })

  it('does not mutate the input state', () => {
    const entry = kanjiEntry('一', 'N3')
    const state: LessonState = { srsState: {}, completedBatches: [] }
    markEntryKnown(state, entry, NOW)
    expect(state.srsState).toEqual({})
  })

  it('overrides any existing SRS state for the entry', () => {
    const entry = kanjiEntry('一', 'N3')
    const state: LessonState = {
      srsState: { [itemKey(entry)]: { stage: 'apprentice2', burned: false, nextReviewAt: 0 } },
      completedBatches: [],
    }
    const result = markEntryKnown(state, entry, NOW)
    expect(result.srsState[itemKey(entry)].stage).toBe('guru1')
  })
})
