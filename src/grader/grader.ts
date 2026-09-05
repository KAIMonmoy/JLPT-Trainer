const FUZZY_THRESHOLD = 0.9

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

const HIRAGANA_START = 0x3041
const HIRAGANA_END = 0x3096

/** Converts hiragana characters to their katakana equivalents; everything else (including ー) passes through unchanged. */
export function toKatakana(value: string): string {
  return Array.from(value)
    .map((char) => {
      const code = char.codePointAt(0)!
      return code >= HIRAGANA_START && code <= HIRAGANA_END ? String.fromCodePoint(code + 0x60) : char
    })
    .join('')
}

function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const distances: number[][] = Array.from({ length: rows }, (_, i) => {
    const row = new Array<number>(cols).fill(0)
    row[0] = i
    return row
  })
  for (let j = 0; j < cols; j++) distances[0][j] = j

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      distances[i][j] = Math.min(
        distances[i - 1][j] + 1,
        distances[i][j - 1] + 1,
        distances[i - 1][j - 1] + cost,
      )
    }
  }

  return distances[rows - 1][cols - 1]
}

export function similarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length)
  if (maxLength === 0) return 1
  const distance = levenshteinDistance(a, b)
  return 1 - distance / maxLength
}

export function isExactMatch(expected: string, actual: string): boolean {
  return normalize(expected) === normalize(actual)
}

export function isFuzzyMatch(expected: string, actual: string): boolean {
  return similarity(normalize(expected), normalize(actual)) >= FUZZY_THRESHOLD
}
