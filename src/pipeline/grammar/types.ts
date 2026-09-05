import type { JlptLevel } from '../kanji/types'

export interface ExampleSentence {
  japanese: string
  english: string
  /** Character offset of the pattern occurrence within `japanese`, for blanking. Null if it could not be located. */
  blankStart: number | null
  blankEnd: number | null
}

export interface GrammarItem {
  pattern: string
  reading: string
  meaning: string
  level: JlptLevel
  jlptbenkyoUrl: string
  example: ExampleSentence
}
