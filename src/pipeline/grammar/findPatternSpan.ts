export interface Span {
  start: number
  end: number
}

const PLACEHOLDER_TOKEN = /[A-Za-z0-9〇～〜\s（）()]+/g

function literalFragments(pattern: string): string[] {
  return pattern
    .split(PLACEHOLDER_TOKEN)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 0)
    .sort((a, b) => b.length - a.length)
}

/**
 * Locates the grammar pattern within an example sentence so it can be blanked
 * out for the MCQ. Falls back to the longest literal (non-placeholder)
 * fragment of the pattern for templated forms like "AにつれてB", since the
 * literal template itself never appears verbatim in real sentences.
 */
export function findPatternSpan(pattern: string, sentence: string): Span | null {
  const directIndex = sentence.indexOf(pattern)
  if (directIndex !== -1) {
    return { start: directIndex, end: directIndex + pattern.length }
  }

  for (const fragment of literalFragments(pattern)) {
    const index = sentence.indexOf(fragment)
    if (index !== -1) {
      return { start: index, end: index + fragment.length }
    }
  }

  return null
}
