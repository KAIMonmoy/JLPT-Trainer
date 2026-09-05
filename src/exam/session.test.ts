import { describe, expect, it } from 'vitest'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { ScheduleEntry } from '../schedule/types'
import type { SrsItem } from '../srs/srsEngine'
import { selectMatureEntries } from './session'

function kanjiEntry(character: string): ScheduleEntry {
  const item: KanjiItem = {
    character,
    onyomi: ['ギ'],
    kunyomi: [],
    meaning: 'deliberation',
    level: 'N3',
    jlptbenkyoUrl: 'https://jlptbenkyo.com/k',
    wanikaniUrl: 'https://wanikani.com/k',
  }
  return { kind: 'kanji', item }
}

function srsItem(overrides: Partial<SrsItem> = {}): SrsItem {
  return { stage: 'guru1', burned: false, nextReviewAt: 0, ...overrides }
}

describe('selectMatureEntries', () => {
  const entriesByKey = {
    'kanji:一': kanjiEntry('一'),
    'kanji:二': kanjiEntry('二'),
    'kanji:三': kanjiEntry('三'),
  }

  it('includes items at guru1 or above', () => {
    const srsState = {
      'kanji:一': srsItem({ stage: 'guru1' }),
      'kanji:二': srsItem({ stage: 'apprentice4' }),
    }
    expect(selectMatureEntries(srsState, entriesByKey)).toEqual([entriesByKey['kanji:一']])
  })

  it('is not time-gated: a far-future nextReviewAt still counts as eligible', () => {
    const srsState = { 'kanji:一': srsItem({ stage: 'master', nextReviewAt: Date.now() + 1_000_000_000 }) }
    expect(selectMatureEntries(srsState, entriesByKey)).toEqual([entriesByKey['kanji:一']])
  })

  it('excludes burned items', () => {
    const srsState = { 'kanji:一': srsItem({ stage: 'master', burned: true }) }
    expect(selectMatureEntries(srsState, entriesByKey)).toEqual([])
  })
})
