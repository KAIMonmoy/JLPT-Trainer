import type { SrsItem } from '../srs/srsEngine'

export interface LessonState {
  srsState: Record<string, SrsItem>
  completedBatches: number[]
}

// v2: itemKey now includes level, and SrsItem gained a required nextReviewAt — both are
// incompatible with anything saved under v1, so the key is bumped rather than migrated.
export const STORAGE_KEY = 'jlpt-dojo/lesson-state/v2'

export function emptyState(): LessonState {
  return { srsState: {}, completedBatches: [] }
}

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'setItem'>

export function loadState(storage: ReadableStorage): LessonState {
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return emptyState()

  try {
    const parsed = JSON.parse(raw) as Partial<LessonState>
    const srsState =
      typeof parsed.srsState === 'object' && parsed.srsState !== null && !Array.isArray(parsed.srsState)
        ? parsed.srsState
        : {}
    const completedBatches = Array.isArray(parsed.completedBatches) ? parsed.completedBatches : []
    return { srsState, completedBatches }
  } catch {
    return emptyState()
  }
}

export function saveState(storage: WritableStorage, state: LessonState): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}
