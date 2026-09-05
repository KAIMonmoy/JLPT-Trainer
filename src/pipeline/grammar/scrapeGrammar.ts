import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { JlptLevel } from '../kanji/types'
import { parseTotalPages } from '../pagination'
import { fetchPage, isMainModule, LEVELS, levelSlug, sleep } from '../scrapeUtils'
import { parseGrammarDetailPage } from './parseGrammarDetailPage'
import { parseGrammarListPage } from './parseGrammarListPage'
import type { GrammarItem } from './types'

function listPageUrl(level: JlptLevel, page: number): string {
  const base = `https://jlptbenkyo.com/grammar/jlpt-${levelSlug(level)}/`
  return page === 1 ? base : `${base}page${page}/`
}

async function collectDetailUrls(level: JlptLevel): Promise<string[]> {
  const firstPageHtml = await fetchPage(listPageUrl(level, 1))
  const totalPages = parseTotalPages(firstPageHtml)

  const urls = [...parseGrammarListPage(firstPageHtml)]

  for (let page = 2; page <= totalPages; page++) {
    await sleep(250)
    const html = await fetchPage(listPageUrl(level, page))
    urls.push(...parseGrammarListPage(html))
  }

  return urls
}

export async function scrapeGrammarLevel(
  level: JlptLevel,
  onItem?: (item: GrammarItem) => void,
): Promise<GrammarItem[]> {
  const detailUrls = await collectDetailUrls(level)
  const items: GrammarItem[] = []

  for (const url of detailUrls) {
    await sleep(250)
    const html = await fetchPage(url)
    const item = parseGrammarDetailPage(html, level, url)
    items.push(item)
    onItem?.(item)
  }

  return items
}

async function main() {
  const outDir = fileURLToPath(new URL('../../../data/grammar/', import.meta.url))
  await mkdir(outDir, { recursive: true })

  for (const level of LEVELS) {
    const unresolved: string[] = []
    const items = await scrapeGrammarLevel(level, (item) => {
      if (item.example.blankStart === null) unresolved.push(item.pattern)
    })

    const outPath = new URL(`${levelSlug(level)}.json`, `file://${outDir}`)
    await writeFile(outPath, JSON.stringify(items, null, 2), 'utf8')
    console.log(`${level}: ${items.length} grammar points -> ${outPath.pathname}`)

    if (unresolved.length > 0) {
      console.warn(
        `${level}: could not locate the pattern span in ${unresolved.length} example sentence(s): ${unresolved.join(', ')}`,
      )
    }
  }
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
