import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseGrammarDetailPage } from './parseGrammarDetailPage'

function fixture(name: string): string {
  const path = fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url))
  return readFileSync(path, 'utf8')
}

describe('parseGrammarDetailPage', () => {
  it('extracts pattern, reading, and meaning', () => {
    const item = parseGrammarDetailPage(
      fixture('detail-kekkyoku.html'),
      'N3',
      'https://jlptbenkyo.com/japanese-grammar/結局-kekkyoku-meaning/',
    )
    expect(item.pattern).toBe('結局')
    expect(item.reading).toBe('kekkyoku')
    expect(item.meaning).toBe('ultimately; in the end')
    expect(item.level).toBe('N3')
    expect(item.jlptbenkyoUrl).toBe(
      'https://jlptbenkyo.com/japanese-grammar/結局-kekkyoku-meaning/',
    )
  })

  it('extracts the first example sentence with an English translation and a located blank span', () => {
    const item = parseGrammarDetailPage(
      fixture('detail-kekkyoku.html'),
      'N3',
      'https://jlptbenkyo.com/japanese-grammar/結局-kekkyoku-meaning/',
    )
    expect(item.example.japanese).toBe('彼は結局来ませんでした。')
    expect(item.example.english).toBe("He didn't come in the end.")
    expect(item.example.blankStart).toBe(2)
    expect(item.example.blankEnd).toBe(4)
  })
})
