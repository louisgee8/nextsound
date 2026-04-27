import { m } from 'framer-motion'

import { useTheme } from '@/context/themeContext'
import { themeOptions } from '@/constants'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { cn } from '@/utils/helper'
import { useMotion } from '@/hooks/useMotion'
import { useOnKeyPress } from '@/hooks/useOnKeyPress'

const ThemeMenu = () => {
  const { theme, setTheme, setShowThemeOptions, closeMenu } = useTheme()
  const { zoomIn } = useMotion()

  const { ref } = useOnClickOutside({
    action: closeMenu,
  })

  useOnKeyPress({
    action: closeMenu,
    key: 'Escape',
  })

  const changeTheme = (theme: string) => {
    setTheme(theme)
    setShowThemeOptions(false)
  }

  return (
    <m.ul
      ref={ref}
      variants={zoomIn(0.9, 0.2)}
      initial="hidden"
      animate="show"
      exit="hidden"
      className="absolute top-[200%] right-[25%] bg-paper dark:bg-leather-elevated shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm"
    >
      {themeOptions.map((option, index) => (
        <li
          key={index}
          className={cn(
            'hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300',
            theme === option.title && 'bg-gray-100 dark:bg-gray-700',
          )}
        >
          <button
            name="theme"
            type="button"
            className={cn(
              'flex flex-row items-center gap-3 w-full font-medium py-2 px-4 text-[14px] text-gray-700 dark:text-gray-200',
              theme === option.title && 'text-gray-900 dark:text-white font-semibold',
            )}
            onClick={() => {
              changeTheme(option.title)
            }}
          >
            {<option.icon />}
            <span>{option.title}</span>
          </button>
        </li>
      ))}
    </m.ul>
  )
}

export default ThemeMenu
