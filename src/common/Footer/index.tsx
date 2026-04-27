import { useState, useEffect } from 'react'

import Logo from '../Logo'
import { maxWidth } from '@/styles'
import { cn } from '@/utils/helper'

const musicQuotes = [
  {
    quote: 'Music is the universal language of mankind.',
    author: 'Henry Wadsworth Longfellow',
  },
  {
    quote: 'Without music, life would be a mistake.',
    author: 'Friedrich Nietzsche',
  },
  {
    quote: 'Music can change the world because it can change people.',
    author: 'Bono',
  },
  {
    quote: 'Where words fail, music speaks.',
    author: 'Hans Christian Andersen',
  },
  {
    quote: 'Music is my religion.',
    author: 'Jimi Hendrix',
  },
  {
    quote: 'Music is the soundtrack of your life.',
    author: 'Dick Clark',
  },
  {
    quote: 'Music is the wine which inspires one to new generative processes.',
    author: 'Ludwig van Beethoven',
  },
  {
    quote: 'Music is the art which is most nigh to tears and memory.',
    author: 'Oscar Wilde',
  },
  {
    quote: 'Music is love in search of a word.',
    author: 'Sidney Lanier',
  },
  {
    quote: 'Music is the only language in which you cannot say a mean or sarcastic thing.',
    author: 'John Erskine',
  },
]

const Footer: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % musicQuotes.length)
    }, 8000) // Change quote every 8 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <footer className="bg-gradient-to-r from-green-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 lg:py-16 sm:py-10 xs:py-8 py-[30px] w-full">
      <div
        className={cn(
          maxWidth,
          'flex flex-col items-center lg:gap-12 md:gap-10 sm:gap-8 xs:gap-6 gap-4',
        )}
      >
        <Logo logoColor="text-gray-800 dark:text-white" />
        <div className="text-center max-w-3xl px-4">
          <blockquote className="text-gray-800 dark:text-white font-light italic md:text-xl sm:text-lg text-base leading-relaxed mb-4">
            "{musicQuotes[currentQuote].quote}"
          </blockquote>
          <cite className="text-gray-600 dark:text-gray-300 font-normal md:text-base sm:text-sm text-xs text-right block">
            — {musicQuotes[currentQuote].author}
          </cite>
        </div>
      </div>
    </footer>
  )
}

export default Footer
