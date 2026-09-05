import { useState } from 'react'
import { loadName } from './lesson/name'
import { LessonMode } from './lesson/LessonMode'
import { ReviewMode } from './review/ReviewMode'
import { ExamMode } from './exam/ExamMode'
import { KnownMode } from './known/KnownMode'
import { BatchBrowser } from './scheduleBrowser/BatchBrowser'
import { BookIcon, BrushIcon, CalendarIcon, RefreshIcon, SealIcon } from './icons'

const TABS = [
  { name: 'Lesson', icon: BookIcon },
  { name: 'Review', icon: RefreshIcon },
  { name: 'Exam', icon: BrushIcon },
  { name: 'Known', icon: SealIcon },
  { name: 'Schedule', icon: CalendarIcon },
] as const

type Tab = (typeof TABS)[number]['name']

function App() {
  const [tab, setTab] = useState<Tab>('Lesson')
  const [userName, setUserName] = useState<string | null>(() => loadName(window.localStorage))
  const centered = tab === 'Lesson' || tab === 'Review' || tab === 'Exam'

  return (
    <>
      <main
        className={`mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8 pb-28 ${
          centered ? 'justify-center' : ''
        }`}
      >
        {tab === 'Lesson' && <LessonMode name={userName} onNameChange={setUserName} />}
        {tab === 'Review' && <ReviewMode />}
        {tab === 'Exam' && <ExamMode />}
        {tab === 'Known' && <KnownMode />}
        {tab === 'Schedule' && <BatchBrowser />}
      </main>

      {userName !== null && (
        <nav
          aria-label="Study modes"
          className="fixed inset-x-0 bottom-0 border-t border-line bg-paper/95 backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="mx-auto flex max-w-md">
            {TABS.map(({ name, icon: Icon }) => {
              const active = tab === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setTab(name)}
                  aria-pressed={active}
                  className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
                    active ? 'text-indigo' : 'text-ink-soft'
                  }`}
                >
                  <Icon aria-hidden="true" className="h-6 w-6" strokeWidth={active ? 2 : 1.6} />
                  {name}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </>
  )
}

export default App
