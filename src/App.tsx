import { useState } from 'react'
import { LessonMode } from './lesson/LessonMode'
import { ReviewMode } from './review/ReviewMode'
import { ExamMode } from './exam/ExamMode'
import { KnownMode } from './known/KnownMode'
import { BatchBrowser } from './scheduleBrowser/BatchBrowser'

const TABS = ['Lesson', 'Review', 'Exam', 'Known', 'Schedule'] as const
type Tab = (typeof TABS)[number]

function App() {
  const [tab, setTab] = useState<Tab>('Lesson')

  return (
    <>
      <nav>
        {TABS.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t}>
            {t}
          </button>
        ))}
      </nav>
      {tab === 'Lesson' && <LessonMode />}
      {tab === 'Review' && <ReviewMode />}
      {tab === 'Exam' && <ExamMode />}
      {tab === 'Known' && <KnownMode />}
      {tab === 'Schedule' && <BatchBrowser />}
    </>
  )
}

export default App
