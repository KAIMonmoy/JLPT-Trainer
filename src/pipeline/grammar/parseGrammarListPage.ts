import * as cheerio from 'cheerio'

const JLPTBENKYO_ORIGIN = 'https://jlptbenkyo.com'

export function parseGrammarListPage(html: string): string[] {
  const $ = cheerio.load(html)

  return $('.grammar-card a')
    .map((_, el) => {
      const href = $(el).attr('href') ?? ''
      return new URL(href, JLPTBENKYO_ORIGIN).toString()
    })
    .get()
}
