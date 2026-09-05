import { describe, expect, it } from 'vitest'
import type { SrsItem } from '../srs/srsEngine'
import { emptyState, loadState, saveState, STORAGE_KEY } from './store'

class FakeStorage {
  private map = new Map<string, string>()
  getItem(key: string): string | null {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
}

describe('emptyState', () => {
  it('has no SRS items and no completed batches', () => {
    expect(emptyState()).toEqual({ srsState: {}, completedBatches: [] })
  })
})

describe('loadState', () => {
  it('returns empty state when nothing has been saved', () => {
    expect(loadState(new FakeStorage())).toEqual(emptyState())
  })

  it('returns empty state when the stored value is corrupt JSON', () => {
    const storage = new FakeStorage()
    storage.setItem(STORAGE_KEY, '{not json')
    expect(loadState(storage)).toEqual(emptyState())
  })

  it('falls back to empty fields when stored fields are valid JSON but the wrong shape', () => {
    const storage = new FakeStorage()
    storage.setItem(STORAGE_KEY, JSON.stringify({ srsState: [], completedBatches: {} }))
    expect(loadState(storage)).toEqual(emptyState())
  })

  it('round-trips a saved state', () => {
    const storage = new FakeStorage()
    const item: SrsItem = { stage: 'apprentice1', burned: false }
    const state = { srsState: { 'kanji:議': item }, completedBatches: [0, 1] }
    saveState(storage, state)
    expect(loadState(storage)).toEqual(state)
  })
})

describe('saveState', () => {
  it('persists under the shared storage key', () => {
    const storage = new FakeStorage()
    saveState(storage, { srsState: {}, completedBatches: [3] })
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual({
      srsState: {},
      completedBatches: [3],
    })
  })
})
