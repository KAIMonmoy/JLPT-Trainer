import { describe, expect, it } from 'vitest'
import { loadName, saveName } from './name'

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

describe('loadName', () => {
  it('returns null when no name has been saved', () => {
    expect(loadName(fakeStorage())).toBeNull()
  })

  it('returns the saved name', () => {
    const storage = fakeStorage()
    saveName(storage, 'Kaito')
    expect(loadName(storage)).toBe('Kaito')
  })
})
