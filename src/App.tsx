import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { IntroPreloader } from './components/IntroPreloader'
import { MacBookSurface } from './components/MacBookSurface'

function App() {
  const [hasEntered, setHasEntered] = useState(false)

  return (
    <>
      <AnimatePresence mode="wait">
        {!hasEntered && <IntroPreloader key="intro" onOpen={() => setHasEntered(true)} />}
      </AnimatePresence>
      <div className="min-h-screen tracking-[-0.02em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <main><MacBookSurface /></main>
      </div>
    </>
  )
}

export default App
