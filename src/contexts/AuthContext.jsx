import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem('adminToken'))
  const [user, setUser] = useState(null)

  const setToken = useCallback((newToken, userData) => {
    if (newToken) {
      localStorage.setItem('adminToken', newToken)
      setTokenState(newToken)
      setUser(userData || null)
    } else {
      localStorage.removeItem('adminToken')
      setTokenState(null)
      setUser(null)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
  }, [setToken])

  return (
    <AuthContext.Provider value={{ token, user, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
