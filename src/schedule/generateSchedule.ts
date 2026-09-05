/**
 * Partitions `items` into `days` batches, covering every item exactly once,
 * preserving input order. When the count doesn't divide evenly, the
 * remainder is spread one-extra-item-each across the first batches. Pure and
 * deterministic: batch number (array index) always maps to the same items
 * for the same input.
 */
export function generateSchedule<T>(items: readonly T[], days: number): T[][] {
  const baseSize = Math.floor(items.length / days)
  const remainder = items.length % days

  const batches: T[][] = []
  let cursor = 0

  for (let day = 0; day < days; day++) {
    const size = baseSize + (day < remainder ? 1 : 0)
    batches.push(items.slice(cursor, cursor + size))
    cursor += size
  }

  return batches
}
