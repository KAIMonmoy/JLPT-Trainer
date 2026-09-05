import { buildJlptSchedule } from './buildJlptSchedule'
import { jlptContent } from './loadContent'

/** The full, fixed batch schedule for the real N5->N4->N3 content, computed once at module load. */
export const jlptSchedule = buildJlptSchedule(jlptContent)
