export type Stage =
  | 'apprentice1'
  | 'apprentice2'
  | 'apprentice3'
  | 'apprentice4'
  | 'guru1'
  | 'guru2'
  | 'master'

export type Mode = 'lesson' | 'review' | 'exam'

export interface SrsItem {
  stage: Stage
  burned: boolean
  /** Epoch ms when this item next becomes due for Review. Ignored by Exam, which is never time-gated. */
  nextReviewAt: number
}

const HOUR_MS = 3600_000
const DAY_MS = 24 * HOUR_MS

export const STAGE_ORDER: readonly Stage[] = [
  'apprentice1',
  'apprentice2',
  'apprentice3',
  'apprentice4',
  'guru1',
  'guru2',
  'master',
]

export const STAGE_INTERVAL_MS: Readonly<Record<Stage, number>> = {
  apprentice1: 4 * HOUR_MS,
  apprentice2: 8 * HOUR_MS,
  apprentice3: 1 * DAY_MS,
  apprentice4: 3 * DAY_MS,
  guru1: 7 * DAY_MS,
  guru2: 14 * DAY_MS,
  master: 14 * DAY_MS,
}

const MATURE_INDEX = STAGE_ORDER.indexOf('guru1')

export function isMature(stage: Stage): boolean {
  return STAGE_ORDER.indexOf(stage) >= MATURE_INDEX
}

function withStage(item: SrsItem, stage: Stage, now: number): SrsItem {
  return { ...item, stage, nextReviewAt: now + STAGE_INTERVAL_MS[stage] }
}

export function applyAnswer(item: SrsItem, mode: Mode, wasCorrect: boolean, now: number): SrsItem {
  if (item.burned) return item

  const index = STAGE_ORDER.indexOf(item.stage)

  if (wasCorrect) {
    const nextIndex = Math.min(index + 1, STAGE_ORDER.length - 1)
    return withStage(item, STAGE_ORDER[nextIndex], now)
  }

  if (mode === 'exam') {
    return withStage(item, 'apprentice1', now)
  }

  const prevIndex = Math.max(index - 1, 0)
  return withStage(item, STAGE_ORDER[prevIndex], now)
}

/** True when a non-burned item's Review interval has elapsed. Exam ignores this — it is never time-gated. */
export function isDue(item: SrsItem, now: number): boolean {
  return !item.burned && now >= item.nextReviewAt
}

export function markKnown(now: number): SrsItem {
  return { stage: 'guru1', burned: false, nextReviewAt: now + STAGE_INTERVAL_MS.guru1 }
}

export function burn(item: SrsItem, context: { mode: Mode; wasCorrect: boolean }): SrsItem {
  if (context.mode !== 'exam' || !context.wasCorrect) {
    throw new Error('Burn is only allowed following a correct Exam answer')
  }
  return { ...item, burned: true }
}
