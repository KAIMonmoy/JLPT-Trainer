import { describe, expect, it } from 'vitest'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { ScheduleEntry } from '../schedule/types'
import type { SrsItem } from '../srs/srsEngine'
import { selectDueEntries } from './session'

const NOW = 1_700_000_000_000

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
  return { stage: 'apprentice1', burned: false, nextReviewAt: NOW, ...overrides }
}

describe('selectDueEntries', () => {
  const entriesByKey = {
    'kanji:一': kanjiEntry('一'),
    'kanji:二': kanjiEntry('二'),
    'kanji:三': kanjiEntry('三'),
  }

  it('includes items whose nextReviewAt has elapsed', () => {
    const srsState = {
      'kanji:一': srsItem({ nextReviewAt: NOW - 1 }),
      'kanji:二': srsItem({ nextReviewAt: NOW + 1 }),
    }
    expect(selectDueEntries(srsState, entriesByKey, NOW)).toEqual([entriesByKey['kanji:一']])
  })

  it('excludes burned items even if due', () => {
    const srsState = { 'kanji:一': srsItem({ nextReviewAt: NOW - 1, burned: true }) }
    expect(selectDueEntries(srsState, entriesByKey, NOW)).toEqual([])
  })

  it('returns an empty array when nothing is due', () => {
    const srsState = { 'kanji:一': srsItem({ nextReviewAt: NOW + 1000 }) }
    expect(selectDueEntries(srsState, entriesByKey, NOW)).toEqual([])
  })
})
