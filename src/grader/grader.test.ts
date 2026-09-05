import { describe, expect, it } from 'vitest'
import { isExactMatch, isFuzzyMatch, similarity } from './grader'

describe('isExactMatch', () => {
  it('matches identical strings', () => {
    expect(isExactMatch('ギ', 'ギ')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isExactMatch('Kekkyoku', 'kekkyoku')).toBe(true)
  })

  it('ignores leading/trailing whitespace', () => {
    expect(isExactMatch('  ギ ', 'ギ')).toBe(true)
  })

  it('fails on a genuinely different reading', () => {
    expect(isExactMatch('ギ', 'チ')).toBe(false)
  })

  it('fails on partial overlap', () => {
    expect(isExactMatch('けっきょく', 'けっきょくは')).toBe(false)
  })
})

describe('similarity', () => {
  it('is 1 for identical strings', () => {
    expect(similarity('deliberation', 'deliberation')).toBe(1)
  })

  it('is 0 for completely different strings of the same length', () => {
    expect(similarity('abc', 'xyz')).toBe(0)
  })

  it('is between 0 and 1 for a partial match', () => {
    const s = similarity('deliberation', 'deliberetion')
    expect(s).toBeGreaterThan(0)
    expect(s).toBeLessThan(1)
  })
})

describe('isFuzzyMatch (~90% threshold)', () => {
  it('passes on an exact match', () => {
    expect(isFuzzyMatch('deliberation', 'deliberation')).toBe(true)
  })

  it('passes on a single-character typo in a long word', () => {
    // 'deliberation' (12 chars) vs 'deliberetion' (12 chars, 1 substitution)
    // similarity = 1 - 1/12 ≈ 0.917, above the 0.9 threshold
    expect(isFuzzyMatch('deliberation', 'deliberetion')).toBe(true)
  })

  it('fails on a short word with one wrong character', () => {
    // 'cure' vs 'core': similarity = 1 - 1/4 = 0.75, below threshold
    expect(isFuzzyMatch('cure', 'core')).toBe(false)
  })

  it('fails on a wholly different meaning', () => {
    expect(isFuzzyMatch('cure', 'discussion')).toBe(false)
  })

  it('is case-insensitive and whitespace-trimmed like exact match', () => {
    expect(isFuzzyMatch('  Cure ', 'cure')).toBe(true)
  })

  it('flips at the threshold boundary', () => {
    // 10-char words: 1 substitution -> 0.9 similarity (pass), 2 -> 0.8 (fail)
    const base = 'abcdefghij'
    const oneOff = 'abcdefghix' // 1 substitution -> similarity 0.9
    const twoOff = 'abcdefghxx' // 2 substitutions -> similarity 0.8
    expect(isFuzzyMatch(base, oneOff)).toBe(true)
    expect(isFuzzyMatch(base, twoOff)).toBe(false)
  })
})
