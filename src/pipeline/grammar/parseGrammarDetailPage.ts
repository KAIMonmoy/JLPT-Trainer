import * as cheerio from 'cheerio'
import type { JlptLevel } from '../kanji/types'
import { findPatternSpan } from './findPatternSpan'
import type { GrammarItem } from './types'

export function parseGrammarDetailPage(
  html: string,
  level: JlptLevel,
  jlptbenkyoUrl: string,
): GrammarItem {
  const $ = cheerio.load(html)

  const header = $('h1').first()
  const pattern = header.text().trim()
  const readingRaw = header.parent().find('div').first().text().trim()
  const reading = readingRaw.replace(/^\(|\)$/g, '')
  const meaning = header.parent().parent().children().eq(1).text().trim()

  const firstSentenceBlock = $('.japanese-text.text-xl.font-medium').first()
  const japanese = firstSentenceBlock.text().trim()
  const english = firstSentenceBlock
    .closest('.flex-1.space-y-3')
    .find('.english-text')
    .first()
    .text()
    .trim()

  const span = findPatternSpan(pattern, japanese)

  return {
    pattern,
    reading,
    meaning,
    level,
    jlptbenkyoUrl,
    example: {
      japanese,
      english,
      blankStart: span?.start ?? null,
      blankEnd: span?.end ?? null,
    },
  }
}
