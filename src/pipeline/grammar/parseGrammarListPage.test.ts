import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseGrammarListPage } from './parseGrammarListPage'

function fixture(name: string): string {
  const path = fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url))
  return readFileSync(path, 'utf8')
}

describe('parseGrammarListPage', () => {
  it('extracts every detail-page URL on a full page', () => {
    const urls = parseGrammarListPage(fixture('n3-page1.html'))
    expect(urls).toHaveLength(20)
    expect(urls[0]).toBe(
      'https://jlptbenkyo.com/japanese-grammar/%E7%B5%90%E5%B1%80-kekkyoku-meaning/',
    )
  })

  it('extracts fewer URLs from a partial last page', () => {
    const urls = parseGrammarListPage(fixture('n3-page10-last.html'))
    expect(urls).toHaveLength(7)
  })
})
