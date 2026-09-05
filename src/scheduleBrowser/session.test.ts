import { describe, expect, it } from 'vitest'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { Batch, ScheduleEntry } from '../schedule/types'
import { clampBatchNumber, currentBatchNumber } from './session'

function kanji(character: string): ScheduleEntry {
  const item: KanjiItem = {
    character,
    onyomi: ['ギ'],
    kunyomi: [],
    meaning: 'deliberation',
    level: 'N3',
    jlptbenkyoUrl: 'https://jlptbenkyo.com/k',
    wanikaniUrl: 'https://wanikani.com/k',
  }
  return { kind: 'kanji', item }
}

describe('clampBatchNumber', () => {
  const schedule: Batch[] = [[kanji('一')], [kanji('二')], [kanji('三')]]

  it('clamps to 0 at the start', () => {
    expect(clampBatchNumber(-1, schedule)).toBe(0)
  })

  it('clamps to the last index at the end', () => {
    expect(clampBatchNumber(10, schedule)).toBe(2)
  })

  it('leaves an in-range number unchanged', () => {
    expect(clampBatchNumber(1, schedule)).toBe(1)
  })
})

describe('currentBatchNumber', () => {
  const schedule: Batch[] = [[kanji('一')], [kanji('二')], [kanji('三')]]

  it('is the lowest-numbered uncompleted batch', () => {
    expect(currentBatchNumber(schedule, [0])).toBe(1)
  })

  it('is the final batch once every batch is completed', () => {
    expect(currentBatchNumber(schedule, [0, 1, 2])).toBe(2)
  })

  it('is 0 when nothing has been completed', () => {
    expect(currentBatchNumber(schedule, [])).toBe(0)
  })
})
