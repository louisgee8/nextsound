import { useGlobalContext } from '@/context/globalContext'
import { useTheme } from '@/context/themeContext'
import { listItem, activeListItem } from '@/styles'
import type { ITheme } from '@/types'
import { cn } from '@/utils/helper'

const ThemeOption = ({ theme }: { theme: ITheme }) => {
  const { setTheme, theme: currTheme } = useTheme()
  const { setShowSidebar } = useGlobalContext()

  const { title } = theme

  const changeTheme = () => {
    setTheme(title)
    setShowSidebar(false)
  }

  return (
    <li>
      <button
        type="button"
        className={cn(listItem, theme.title === currTheme && activeListItem)}
        onClick={changeTheme}
      >
        {<theme.icon />}
        <span>{theme.title}</span>
      </button>
    </li>
  )
}

export default ThemeOption
