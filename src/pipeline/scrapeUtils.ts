import { fileURLToPath } from 'node:url'
import type { JlptLevel } from './kanji/types'

export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3']

export function levelSlug(level: JlptLevel): string {
  return level.toLowerCase()
}

export async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
  }
  return response.text()
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * True when this module was invoked directly (`node thisFile.ts`) rather
 * than imported. Compares filesystem paths rather than raw `import.meta.url`
 * vs `process.argv[1]` strings, since the former is percent-encoded and the
 * latter isn't — a path containing a space (or other reserved character)
 * made the naive string comparison always false.
 */
export function isMainModule(moduleUrl: string): boolean {
  return process.argv[1] !== undefined && fileURLToPath(moduleUrl) === process.argv[1]
}
