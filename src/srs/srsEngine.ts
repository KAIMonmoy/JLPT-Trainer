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

export function applyAnswer(item: SrsItem, mode: Mode, wasCorrect: boolean): SrsItem {
  if (item.burned) return item

  const index = STAGE_ORDER.indexOf(item.stage)

  if (wasCorrect) {
    const nextIndex = Math.min(index + 1, STAGE_ORDER.length - 1)
    return { ...item, stage: STAGE_ORDER[nextIndex] }
  }

  if (mode === 'exam') {
    return { ...item, stage: 'apprentice1' }
  }

  const prevIndex = Math.max(index - 1, 0)
  return { ...item, stage: STAGE_ORDER[prevIndex] }
}

export function markKnown(): SrsItem {
  return { stage: 'guru1', burned: false }
}

export function burn(item: SrsItem, context: { mode: Mode; wasCorrect: boolean }): SrsItem {
  if (context.mode !== 'exam' || !context.wasCorrect) {
    throw new Error('Burn is only allowed following a correct Exam answer')
  }
  return { ...item, burned: true }
}
