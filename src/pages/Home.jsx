import { useState } from 'react'
import MainFeature from '../components/MainFeature'
import getIcon from '../utils/iconUtils'

function Home() {
  const MoonIcon = getIcon('Moon')
  const SunIcon = getIcon('Sun')
  const StickyNoteIcon = getIcon('StickyNote')
  
  const [darkMode, setDarkMode] = useState(false)
  
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    
    // Add or remove dark class from document
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white dark:bg-surface-800 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <StickyNoteIcon className="text-primary h-7 w-7" />
            <h1 className="text-xl md:text-2xl font-bold text-primary">
              StickyPlan
            </h1>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? 
              <SunIcon className="h-5 w-5 text-yellow-400" /> : 
              <MoonIcon className="h-5 w-5 text-surface-600" />
            }
          </button>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <MainFeature />
      </main>
      
      <footer className="bg-white dark:bg-surface-800 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-surface-500 text-sm">
          &copy; {new Date().getFullYear()} StickyPlan - Your Personal Task Management Solution
        </div>
      </footer>
    </div>
  )
}

export default Home