import n5Kanji from '../../data/kanji/n5.json'
import n4Kanji from '../../data/kanji/n4.json'
import n3Kanji from '../../data/kanji/n3.json'
import n5Grammar from '../../data/grammar/n5.json'
import n4Grammar from '../../data/grammar/n4.json'
import n3Grammar from '../../data/grammar/n3.json'
import type { KanjiItem } from '../pipeline/kanji/types'
import type { GrammarItem } from '../pipeline/grammar/types'
import type { JlptContent } from './buildJlptSchedule'

export const jlptContent: JlptContent = {
  N5: { kanji: n5Kanji as KanjiItem[], grammar: n5Grammar as GrammarItem[] },
  N4: { kanji: n4Kanji as KanjiItem[], grammar: n4Grammar as GrammarItem[] },
  N3: { kanji: n3Kanji as KanjiItem[], grammar: n3Grammar as GrammarItem[] },
}
