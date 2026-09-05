import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { parseTotalPages } from '../pagination'
import { fetchPage, isMainModule, LEVELS, levelSlug, sleep } from '../scrapeUtils'
import { parseKanjiListPage } from './parseKanjiListPage'
import type { JlptLevel, KanjiItem } from './types'

function pageUrl(level: JlptLevel, page: number): string {
  const base = `https://jlptbenkyo.com/kanji/jlpt-${levelSlug(level)}/`
  return page === 1 ? base : `${base}page${page}/`
}

export async function scrapeKanjiLevel(level: JlptLevel): Promise<KanjiItem[]> {
  const firstPageHtml = await fetchPage(pageUrl(level, 1))
  const totalPages = parseTotalPages(firstPageHtml)

  const items: KanjiItem[] = [...parseKanjiListPage(firstPageHtml, level)]

  for (let page = 2; page <= totalPages; page++) {
    await sleep(250)
    const html = await fetchPage(pageUrl(level, page))
    items.push(...parseKanjiListPage(html, level))
  }

  return items
}

async function main() {
  const outDir = fileURLToPath(new URL('../../../data/kanji/', import.meta.url))
  await mkdir(outDir, { recursive: true })

  for (const level of LEVELS) {
    const items = await scrapeKanjiLevel(level)
    const outPath = new URL(`${levelSlug(level)}.json`, `file://${outDir}`)
    await writeFile(outPath, JSON.stringify(items, null, 2), 'utf8')
    console.log(`${level}: ${items.length} kanji -> ${outPath.pathname}`)
  }
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
