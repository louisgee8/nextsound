import React, { useContext, useState } from 'react'

const context = React.createContext({
  showSidebar: false,
  setShowSidebar: (_prevValue: boolean) => {},
})

interface Props {
  children: React.ReactNode
}

const GlobalContextProvider = ({ children }: Props) => {
  const [showSidebar, setShowSidebar] = useState(false)

  return (
    <context.Provider
      value={{
        showSidebar,
        setShowSidebar,
      }}
    >
      {children}
    </context.Provider>
  )
}

export default GlobalContextProvider

export const useGlobalContext = () => {
  return useContext(context)
}
