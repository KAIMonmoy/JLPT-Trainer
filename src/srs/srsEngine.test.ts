import { describe, expect, it } from 'vitest'
import {
  STAGE_ORDER,
  STAGE_INTERVAL_MS,
  applyAnswer,
  burn,
  isDue,
  isMature,
  markKnown,
  type SrsItem,
} from './srsEngine'

const NOW = 1_700_000_000_000

function item(stage: SrsItem['stage']): SrsItem {
  return { stage, burned: false, nextReviewAt: 0 }
}

describe('stage ladder', () => {
  it('has the seven stages in order', () => {
    expect(STAGE_ORDER).toEqual([
      'apprentice1',
      'apprentice2',
      'apprentice3',
      'apprentice4',
      'guru1',
      'guru2',
      'master',
    ])
  })

  it('has the correct interval for every stage, capped at two weeks', () => {
    expect(STAGE_INTERVAL_MS.apprentice1).toBe(4 * 3600_000)
    expect(STAGE_INTERVAL_MS.apprentice2).toBe(8 * 3600_000)
    expect(STAGE_INTERVAL_MS.apprentice3).toBe(24 * 3600_000)
    expect(STAGE_INTERVAL_MS.apprentice4).toBe(3 * 24 * 3600_000)
    expect(STAGE_INTERVAL_MS.guru1).toBe(7 * 24 * 3600_000)
    expect(STAGE_INTERVAL_MS.guru2).toBe(14 * 24 * 3600_000)
    expect(STAGE_INTERVAL_MS.master).toBe(14 * 24 * 3600_000)
    for (const stage of STAGE_ORDER) {
      expect(STAGE_INTERVAL_MS[stage]).toBeLessThanOrEqual(14 * 24 * 3600_000)
    }
  })
})

describe('applyAnswer: correct answers advance one stage', () => {
  it.each([
    ['apprentice1', 'apprentice2'],
    ['apprentice2', 'apprentice3'],
    ['apprentice3', 'apprentice4'],
    ['apprentice4', 'guru1'],
    ['guru1', 'guru2'],
    ['guru2', 'master'],
  ] as const)('%s -> %s on a correct answer', (from, to) => {
    expect(applyAnswer(item(from), 'review', true, NOW).stage).toBe(to)
  })

  it('stays at master on a correct answer (plateau)', () => {
    expect(applyAnswer(item('master'), 'review', true, NOW).stage).toBe('master')
  })

  it('advances on a correct answer regardless of mode', () => {
    expect(applyAnswer(item('apprentice1'), 'lesson', true, NOW).stage).toBe('apprentice2')
    expect(applyAnswer(item('apprentice1'), 'exam', true, NOW).stage).toBe('apprentice2')
  })
})

describe('applyAnswer: review-mode wrong answers drop one stage', () => {
  it.each([
    ['apprentice2', 'apprentice1'],
    ['apprentice3', 'apprentice2'],
    ['apprentice4', 'apprentice3'],
    ['guru1', 'apprentice4'],
    ['guru2', 'guru1'],
    ['master', 'guru2'],
  ] as const)('%s -> %s on a review wrong answer', (from, to) => {
    expect(applyAnswer(item(from), 'review', false, NOW).stage).toBe(to)
  })

  it('cannot drop below apprentice1', () => {
    expect(applyAnswer(item('apprentice1'), 'review', false, NOW).stage).toBe('apprentice1')
  })
})

describe('applyAnswer: exam-mode wrong answers fully reset to apprentice1', () => {
  it.each(STAGE_ORDER)('%s -> apprentice1 on an exam wrong answer', (from) => {
    expect(applyAnswer(item(from), 'exam', false, NOW).stage).toBe('apprentice1')
  })
})

describe('applyAnswer: sets nextReviewAt to now plus the new stage interval', () => {
  it('on a correct answer', () => {
    const result = applyAnswer(item('apprentice1'), 'review', true, NOW)
    expect(result.nextReviewAt).toBe(NOW + STAGE_INTERVAL_MS.apprentice2)
  })

  it('on a review wrong answer', () => {
    const result = applyAnswer(item('guru1'), 'review', false, NOW)
    expect(result.nextReviewAt).toBe(NOW + STAGE_INTERVAL_MS.apprentice4)
  })

  it('on an exam wrong answer', () => {
    const result = applyAnswer(item('guru2'), 'exam', false, NOW)
    expect(result.nextReviewAt).toBe(NOW + STAGE_INTERVAL_MS.apprentice1)
  })
})

describe('isDue', () => {
  it('is false before nextReviewAt has elapsed', () => {
    expect(isDue({ stage: 'apprentice1', burned: false, nextReviewAt: NOW + 1 }, NOW)).toBe(false)
  })

  it('is true once nextReviewAt has elapsed', () => {
    expect(isDue({ stage: 'apprentice1', burned: false, nextReviewAt: NOW }, NOW)).toBe(true)
    expect(isDue({ stage: 'apprentice1', burned: false, nextReviewAt: NOW - 1 }, NOW)).toBe(true)
  })

  it('is false for a burned item even if the interval has elapsed', () => {
    expect(isDue({ stage: 'apprentice1', burned: true, nextReviewAt: NOW - 1 }, NOW)).toBe(false)
  })
})

describe('isMature', () => {
  it.each([
    ['apprentice1', false],
    ['apprentice2', false],
    ['apprentice3', false],
    ['apprentice4', false],
    ['guru1', true],
    ['guru2', true],
    ['master', true],
  ] as const)('%s is mature: %s', (stage, expected) => {
    expect(isMature(stage)).toBe(expected)
  })
})

describe('markKnown', () => {
  it('inserts the item directly at guru1', () => {
    expect(markKnown(NOW).stage).toBe('guru1')
  })

  it('produces an item indistinguishable from an organically-promoted guru1 item', () => {
    const known = markKnown(NOW)
    const organic = applyAnswer(item('apprentice4'), 'lesson', true, NOW)
    expect(known).toEqual(organic)

    // subsequent transitions behave identically
    expect(applyAnswer(known, 'review', true, NOW)).toEqual(applyAnswer(organic, 'review', true, NOW))
    expect(applyAnswer(known, 'review', false, NOW)).toEqual(applyAnswer(organic, 'review', false, NOW))
    expect(applyAnswer(known, 'exam', false, NOW)).toEqual(applyAnswer(organic, 'exam', false, NOW))
  })
})

describe('burn', () => {
  it('marks the item as burned when following a correct exam answer', () => {
    const result = burn(item('guru2'), { mode: 'exam', wasCorrect: true })
    expect(result.burned).toBe(true)
  })

  it('refuses to burn outside of a correct exam answer', () => {
    expect(() => burn(item('guru2'), { mode: 'exam', wasCorrect: false })).toThrow()
    expect(() => burn(item('guru2'), { mode: 'review', wasCorrect: true })).toThrow()
    expect(() => burn(item('guru2'), { mode: 'lesson', wasCorrect: true })).toThrow()
  })
})

describe('burned items are excluded from further transitions', () => {
  it('applyAnswer is a no-op on an already-burned item', () => {
    const burned = burn(item('master'), { mode: 'exam', wasCorrect: true })
    expect(applyAnswer(burned, 'review', true, NOW)).toEqual(burned)
    expect(applyAnswer(burned, 'exam', false, NOW)).toEqual(burned)
  })
})
