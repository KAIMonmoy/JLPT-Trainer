import { describe, expect, it } from 'vitest'
import { generateSchedule } from './generateSchedule'

describe('generateSchedule', () => {
  it('covers every item exactly once', () => {
    const items = Array.from({ length: 23 }, (_, i) => i)
    const batches = generateSchedule(items, 5)
    expect(batches.flat().sort((a, b) => a - b)).toEqual(items)
  })

  it('produces exactly `days` batches', () => {
    const items = Array.from({ length: 10 }, (_, i) => i)
    expect(generateSchedule(items, 4)).toHaveLength(4)
  })

  it('divides evenly when the count is a multiple of the day count', () => {
    const items = Array.from({ length: 20 }, (_, i) => i)
    const batches = generateSchedule(items, 4)
    expect(batches.map((b) => b.length)).toEqual([5, 5, 5, 5])
  })

  it('spreads the remainder across the first batches, one extra item each', () => {
    // 23 items over 5 days: 3 days get 5, 2 days get 4
    const items = Array.from({ length: 23 }, (_, i) => i)
    const batches = generateSchedule(items, 5)
    expect(batches.map((b) => b.length)).toEqual([5, 5, 5, 4, 4])
  })

  it('preserves input order within and across batches', () => {
    const items = Array.from({ length: 9 }, (_, i) => i)
    const batches = generateSchedule(items, 3)
    expect(batches).toEqual([
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
    ])
  })

  it('is deterministic: the same input always produces the same batches, indexable by batch number', () => {
    const items = Array.from({ length: 17 }, (_, i) => i)
    const first = generateSchedule(items, 6)
    const second = generateSchedule(items, 6)
    expect(second).toEqual(first)
  })

  it('produces empty batches, not an error, if there are more days than items', () => {
    const items = [0, 1]
    const batches = generateSchedule(items, 4)
    expect(batches).toHaveLength(4)
    expect(batches.flat()).toEqual([0, 1])
    expect(batches.filter((b) => b.length === 0)).toHaveLength(2)
  })
})
