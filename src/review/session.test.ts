import { describe, expect, it } from 'vitest'
import type { JlptLevel, KanjiItem } from '../pipeline/kanji/types'
import { itemKey } from '../lesson/itemKey'
import type { ScheduleEntry } from '../schedule/types'
import type { SrsItem } from '../srs/srsEngine'
import { selectDueEntries, selectStageBreakdownByLevel } from './session'

const NOW = 1_700_000_000_000

function kanjiEntry(character: string, level: JlptLevel = 'N3'): ScheduleEntry {
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

describe('selectStageBreakdownByLevel', () => {
  it('buckets apprentice 1-4 and guru 1-2 together, and counts master and burned separately', () => {
    const entries = [
      kanjiEntry('一', 'N4'),
      kanjiEntry('二', 'N4'),
      kanjiEntry('三', 'N4'),
      kanjiEntry('四', 'N4'),
      kanjiEntry('五', 'N4'),
    ]
    const srsState = {
      [itemKey(entries[0])]: srsItem({ stage: 'apprentice3' }),
      [itemKey(entries[1])]: srsItem({ stage: 'guru2' }),
      [itemKey(entries[2])]: srsItem({ stage: 'master' }),
      [itemKey(entries[3])]: srsItem({ stage: 'master', burned: true }),
      [itemKey(entries[4])]: srsItem({ stage: 'apprentice1' }),
    }
    expect(selectStageBreakdownByLevel(entries, srsState)).toEqual([
      { level: 'N4', apprentice: 2, guru: 1, master: 1, burned: 1 },
    ])
  })

  it('omits a Level with no Introduced items', () => {
    const entries = [kanjiEntry('一', 'N5'), kanjiEntry('二', 'N4')]
    const srsState = { [itemKey(entries[0])]: srsItem() }
    expect(selectStageBreakdownByLevel(entries, srsState)).toEqual([
      { level: 'N5', apprentice: 1, guru: 0, master: 0, burned: 0 },
    ])
  })

  it('orders results N5 → N4 → N3 regardless of entry order', () => {
    const entries = [kanjiEntry('一', 'N3'), kanjiEntry('二', 'N5')]
    const srsState = { [itemKey(entries[0])]: srsItem(), [itemKey(entries[1])]: srsItem() }
    expect(selectStageBreakdownByLevel(entries, srsState).map((b) => b.level)).toEqual(['N5', 'N3'])
  })

  it('returns an empty array when nothing has been introduced', () => {
    const entries = [kanjiEntry('一', 'N5')]
    expect(selectStageBreakdownByLevel(entries, {})).toEqual([])
  })
})
