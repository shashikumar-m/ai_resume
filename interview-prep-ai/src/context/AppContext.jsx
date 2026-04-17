import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [mockHistory, setMockHistory] = useState([])
  const [resumeData, setResumeData] = useState(null)

  const addMockSession = (session) => {
    setMockHistory(prev => [session, ...prev])
  }

  return (
    <AppContext.Provider value={{ profile, setProfile, mockHistory, addMockSession, resumeData, setResumeData }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
