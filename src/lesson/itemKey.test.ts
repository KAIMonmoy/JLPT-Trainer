import { describe, expect, it } from 'vitest'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { GrammarItem } from '../pipeline/grammar/types'
import type { ScheduleEntry } from '../schedule/types'
import { itemKey } from './itemKey'

function kanjiEntry(character: string): ScheduleEntry {
  const item: KanjiItem = {
    character,
    onyomi: [],
    kunyomi: [],
    meaning: '',
    level: 'N3',
    jlptbenkyoUrl: '',
    wanikaniUrl: '',
  }
  return { kind: 'kanji', item }
}

function grammarEntry(pattern: string): ScheduleEntry {
  const item: GrammarItem = {
    pattern,
    reading: '',
    meaning: '',
    level: 'N3',
    jlptbenkyoUrl: '',
    example: { japanese: '', english: '', blankStart: null, blankEnd: null },
    distractors: [],
  }
  return { kind: 'grammar', item }
}

describe('itemKey', () => {
  it('keys kanji entries by character', () => {
    expect(itemKey(kanjiEntry('議'))).toBe('kanji:議')
  })

  it('keys grammar entries by pattern', () => {
    expect(itemKey(grammarEntry('結局'))).toBe('grammar:結局')
  })

  it('does not collide between a kanji and grammar entry sharing the same text', () => {
    expect(itemKey(kanjiEntry('結'))).not.toBe(itemKey(grammarEntry('結')))
  })
})
