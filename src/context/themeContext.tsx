import React, { useContext, useState, useEffect, useCallback } from 'react'
import { saveTheme, getTheme } from '@/utils/helper'

const context = React.createContext({
  setShowThemeOptions: (_prev: boolean) => {},
  showThemeOptions: false,
  openMenu: () => {},
  closeMenu: () => {},
  setTheme: (_newTheme: string) => {},
  theme: '',
})

interface Props {
  children: React.ReactNode
}

const initialTheme = getTheme()

const ThemeProvider = ({ children }: Props) => {
  const [showThemeOptions, setShowThemeOptions] = useState<boolean>(false)
  const [theme, setTheme] = useState<string>(initialTheme)

  const checkTheme = useCallback(() => {
    if (initialTheme) return
    setTheme('Dark')
    // checkSystemTheme();
  }, [])

  useEffect(() => {
    checkTheme()
  }, [checkTheme])

  useEffect(() => {
    if (theme === 'Dark') {
      document.documentElement.classList.add('dark')
      saveTheme('Dark')
    } else if (theme === 'Light') {
      document.documentElement.classList.remove('dark')
      saveTheme('Light')
    }
  }, [theme])

  const openMenu = () => {
    setShowThemeOptions(true)
  }

  const closeMenu = useCallback(() => {
    setShowThemeOptions(false)
  }, [])

  return (
    <context.Provider
      value={{
        showThemeOptions,
        openMenu,
        closeMenu,
        setTheme,
        theme,
        setShowThemeOptions,
      }}
    >
      {children}
    </context.Provider>
  )
}

export default ThemeProvider

export const useTheme = () => {
  return useContext(context)
}
