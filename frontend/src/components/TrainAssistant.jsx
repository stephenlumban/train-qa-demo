import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from './ui/button'

export default function TrainAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // BUG 1: Global keydown trap for 't', 'r', 'a', 'i', 'n'.
    // Calling preventDefault makes it impossible to type these letters in any input field!
    const handleKeyDown = (e) => {
      const triggerKeys = ['t', 'r', 'a', 'i', 'n']
      if (triggerKeys.includes(e.key.toLowerCase())) {
        e.preventDefault()
        if (e.key.toLowerCase() === 't') {
          setIsOpen(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    // BUG 2: Page unscrollable bug. Sets overflow hidden when open, but if the user
    // navigates to another page by clicking a link (due to React Router), this component is 
    // unmounted without removing the hidden style. The whole app becomes unscrollable.
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    // Missing cleanup return function to reset overflow on unmount.
  }, [isOpen])

  const goHome = () => {
    // BUG 3: Uses full page reload instead of React Router, losing state
    window.location.href = '/'
  }

  return (
    <>
      {/* BUG 4: Transparent overlay blocking clicks. 
          When closed, this div is still rendered and has z-index.
          It covers the bottom 24 w-full, blocking clicks on bottom elements of other pages. */}
      {!isOpen && (
        <div className="fixed bottom-0 left-0 w-full h-24 z-40 bg-transparent cursor-default pointer-events-auto" />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </button>

      {/* Assistant Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <MessageCircle size={18} />
              Train Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-4 flex-1 h-64 overflow-y-auto bg-gray-50">
            <div className="bg-gray-200 p-3 rounded-lg rounded-tl-none inline-block max-w-[80%] mb-4">
              <p className="text-sm text-gray-800">Hi! I'm your train assistant. Need help finding a train?</p>
            </div>
          </div>
          
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <Button onClick={goHome} className="w-full text-xs">
              Go Home (Full Reload)
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
