import { describe, expect, it } from 'vitest'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { GrammarItem } from '../pipeline/grammar/types'
import { buildJlptSchedule, PHASE_DAYS } from './buildJlptSchedule'

function kanji(count: number, level: KanjiItem['level']): KanjiItem[] {
  return Array.from({ length: count }, (_, i) => ({
    character: `${level}-k${i}`,
    onyomi: [],
    kunyomi: [],
    meaning: '',
    level,
    jlptbenkyoUrl: '',
    wanikaniUrl: '',
  }))
}

function grammar(count: number, level: GrammarItem['level']): GrammarItem[] {
  return Array.from({ length: count }, (_, i) => ({
    pattern: `${level}-g${i}`,
    reading: '',
    meaning: '',
    level,
    jlptbenkyoUrl: '',
    example: { japanese: '', english: '', blankStart: null, blankEnd: null },
    distractors: [],
  }))
}

describe('PHASE_DAYS', () => {
  it('sums to 77 days (11 weeks: 2 + 3.5 + 5.5)', () => {
    expect(PHASE_DAYS.N5 + PHASE_DAYS.N4 + PHASE_DAYS.N3).toBe(77)
  })
})

describe('buildJlptSchedule', () => {
  it('concatenates batches in N5 -> N4 -> N3 order with one global batch number per day', () => {
    const schedule = buildJlptSchedule({
      N5: { kanji: kanji(80, 'N5'), grammar: grammar(120, 'N5') },
      N4: { kanji: kanji(170, 'N4'), grammar: grammar(140, 'N4') },
      N3: { kanji: kanji(403, 'N3'), grammar: grammar(187, 'N3') },
    })

    expect(schedule).toHaveLength(PHASE_DAYS.N5 + PHASE_DAYS.N4 + PHASE_DAYS.N3)

    // first batch is entirely N5 content
    const firstBatchLevels = new Set(schedule[0].map((entry) => entry.item.level))
    expect(firstBatchLevels).toEqual(new Set(['N5']))

    // last batch is entirely N3 content
    const lastBatch = schedule[schedule.length - 1]
    const lastBatchLevels = new Set(lastBatch.map((entry) => entry.item.level))
    expect(lastBatchLevels).toEqual(new Set(['N3']))
  })

  it('interleaves kanji and grammar within each level instead of running all of one type before the other', () => {
    const schedule = buildJlptSchedule({
      N5: { kanji: kanji(80, 'N5'), grammar: grammar(120, 'N5') },
      N4: { kanji: kanji(170, 'N4'), grammar: grammar(140, 'N4') },
      N3: { kanji: kanji(403, 'N3'), grammar: grammar(187, 'N3') },
    })

    // the first N5 batch (day 0) should already contain both kinds of entry,
    // not be all-kanji or all-grammar
    const firstBatchKinds = new Set(schedule[0].map((entry) => entry.kind))
    expect(firstBatchKinds).toEqual(new Set(['kanji', 'grammar']))

    // same check for the first N4 batch and the first N3 batch
    const firstN4Batch = schedule[PHASE_DAYS.N5]
    expect(new Set(firstN4Batch.map((entry) => entry.kind))).toEqual(
      new Set(['kanji', 'grammar']),
    )

    const firstN3Batch = schedule[PHASE_DAYS.N5 + PHASE_DAYS.N4]
    expect(new Set(firstN3Batch.map((entry) => entry.kind))).toEqual(
      new Set(['kanji', 'grammar']),
    )
  })

  it('covers every kanji and grammar item across all levels exactly once', () => {
    const schedule = buildJlptSchedule({
      N5: { kanji: kanji(3, 'N5'), grammar: grammar(2, 'N5') },
      N4: { kanji: kanji(4, 'N4'), grammar: grammar(1, 'N4') },
      N3: { kanji: kanji(5, 'N3'), grammar: grammar(3, 'N3') },
    })

    const allEntries = schedule.flat()
    expect(allEntries).toHaveLength(3 + 2 + 4 + 1 + 5 + 3)

    const kanjiChars = allEntries
      .filter((e) => e.kind === 'kanji')
      .map((e) => e.item.character)
      .sort()
    expect(new Set(kanjiChars).size).toBe(kanjiChars.length) // no duplicates
  })
})
