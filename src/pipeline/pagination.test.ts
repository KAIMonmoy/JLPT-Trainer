import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseTotalPages } from './pagination'

function fixture(name: string): string {
  const path = fileURLToPath(new URL(`./kanji/__fixtures__/${name}`, import.meta.url))
  return readFileSync(path, 'utf8')
}

describe('parseTotalPages', () => {
  it('reads "Page X of Y" and returns Y', () => {
    expect(parseTotalPages(fixture('n3-page1.html'))).toBe(9)
  })

  it('returns 1 when no pagination text is present', () => {
    expect(parseTotalPages('<html><body>no pagination here</body></html>')).toBe(1)
  })
})
