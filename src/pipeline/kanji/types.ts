export type JlptLevel = 'N5' | 'N4' | 'N3'

export interface KanjiItem {
  character: string
  onyomi: string[]
  kunyomi: string[]
  meaning: string
  level: JlptLevel
  jlptbenkyoUrl: string
  wanikaniUrl: string
}
