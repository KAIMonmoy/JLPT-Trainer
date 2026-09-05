import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseKanjiListPage } from './parseKanjiListPage'

function fixture(name: string): string {
  const path = fileURLToPath(new URL(`./__fixtures__/${name}`, import.meta.url))
  return readFileSync(path, 'utf8')
}

describe('parseKanjiListPage', () => {
  it('parses all 50 rows on a full page', () => {
    const items = parseKanjiListPage(fixture('n3-page1.html'), 'N3')
    expect(items).toHaveLength(50)
  })

  it('parses a single-reading, no-kunyomi row correctly', () => {
    const items = parseKanjiListPage(fixture('n3-page1.html'), 'N3')
    const gi = items.find((item) => item.character === '議')
    expect(gi).toEqual({
      character: '議',
      onyomi: ['ギ'],
      kunyomi: [],
      meaning: 'deliberation, consultation, debate, consideration',
      level: 'N3',
      jlptbenkyoUrl: 'https://jlptbenkyo.com/japanese-kanji/%E8%AD%B0-kanji-meaning/',
      wanikaniUrl: 'https://www.wanikani.com/kanji/%E8%AD%B0',
    })
  })

  it('splits multiple onyomi and kunyomi readings on comma', () => {
    const items = parseKanjiListPage(fixture('n3-page1.html'), 'N3')
    const ren = items.find((item) => item.character === '連')
    expect(ren?.onyomi).toEqual(['レン'])
    expect(ren?.kunyomi).toEqual(['つら.なる', 'つら.ねる', 'つ.れる', '-づ.れ'])

    const gou = items.find((item) => item.character === '合')
    expect(gou?.onyomi).toEqual(['ゴウ', 'ガッ', 'カッ'])
  })

  it('parses a partial last page without padding or dropping rows', () => {
    const items = parseKanjiListPage(fixture('n3-page9-last.html'), 'N3')
    expect(items).toHaveLength(3)
    for (const item of items) {
      expect(item.character).toMatch(/\S/)
    }
  })

  it('tags every item with the given level', () => {
    const items = parseKanjiListPage(fixture('n3-page1.html'), 'N3')
    expect(items.every((item) => item.level === 'N3')).toBe(true)
  })
})
