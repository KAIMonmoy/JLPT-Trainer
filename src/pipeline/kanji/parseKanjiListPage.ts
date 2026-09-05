import * as cheerio from 'cheerio'
import type { JlptLevel, KanjiItem } from './types'

const JLPTBENKYO_ORIGIN = 'https://jlptbenkyo.com'

function splitReadings(cell: string): string[] {
  const text = cell.trim()
  if (text === '' || text === '-') return []
  return text.split(',').map((reading) => reading.trim())
}

export function parseKanjiListPage(html: string, level: JlptLevel): KanjiItem[] {
  const $ = cheerio.load(html)

  return $('tbody tr')
    .map((_, row) => {
      const $row = $(row)
      const cells = $row.find('td')
      const character = $(cells[1]).text().trim()
      const onyomi = splitReadings($(cells[2]).text())
      const kunyomi = splitReadings($(cells[3]).text())
      const meaning = $(cells[4]).text().trim()
      const href = $row.attr('data-href') ?? ''

      const item: KanjiItem = {
        character,
        onyomi,
        kunyomi,
        meaning,
        level,
        jlptbenkyoUrl: new URL(href, JLPTBENKYO_ORIGIN).toString(),
        wanikaniUrl: `https://www.wanikani.com/kanji/${encodeURIComponent(character)}`,
      }
      return item
    })
    .get()
}
