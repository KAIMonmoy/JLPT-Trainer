import { describe, expect, it } from 'vitest'
import { findPatternSpan } from './findPatternSpan'

describe('findPatternSpan', () => {
  it('finds a simple pattern that appears verbatim in the sentence', () => {
    const span = findPatternSpan('結局', '彼は結局来ませんでした。')
    expect(span).toEqual({ start: 2, end: 4 })
  })

  it('finds a pattern with okurigana verbatim', () => {
    const span = findPatternSpan('たびに', '国に帰るたびに、友達に会う。')
    expect(span).not.toBeNull()
    const sentence = '国に帰るたびに、友達に会う。'
    expect(sentence.slice(span!.start, span!.end)).toBe('たびに')
  })

  it('falls back to the longest literal fragment for templated patterns with placeholders', () => {
    // 'AにつれてB' has placeholder letters A/B; only 'につれて' is literal Japanese text.
    const span = findPatternSpan('AにつれてB', '時間が経つにつれて、彼の気持ちも変わった。')
    expect(span).not.toBeNull()
    const sentence = '時間が経つにつれて、彼の気持ちも変わった。'
    expect(sentence.slice(span!.start, span!.end)).toBe('につれて')
  })

  it('treats the wave dash (～) as a placeholder, matching the longer literal fragment', () => {
    // 'たり～たりする' has '～' as a placeholder between two literal fragments;
    // 'たりする' (4 chars) is longer than 'たり' (2) so it should be preferred.
    const span = findPatternSpan('たり～たりする', '休みの日は本を読んだりたりする。')
    expect(span).not.toBeNull()
    const sentence = '休みの日は本を読んだりたりする。'
    expect(sentence.slice(span!.start, span!.end)).toBe('たりする')
  })

  it('returns null when no fragment of the pattern can be located in the sentence', () => {
    const span = findPatternSpan('絶対にない', '今日は天気がいい。')
    expect(span).toBeNull()
  })
})
