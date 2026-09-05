import type { Batch } from '../schedule/types'
import { selectNextBatch } from '../lesson/session'

/** Clamps a batch number navigation target to the valid range of the schedule. */
export function clampBatchNumber(batchNumber: number, schedule: readonly Batch[]): number {
  return Math.min(Math.max(batchNumber, 0), schedule.length - 1)
}

/**
 * The batch number to open the browser on: the next batch not yet studied (same definition
 * Lesson uses), or the final batch once everything has been completed.
 */
export function currentBatchNumber(schedule: readonly Batch[], completedBatches: readonly number[]): number {
  const next = selectNextBatch(schedule, completedBatches)
  return next ? next.batchNumber : schedule.length - 1
}
