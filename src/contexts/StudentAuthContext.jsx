import { createContext, useContext, useMemo, useState } from 'react'
import { getStudentToken, setStudentToken, studentLogin } from '../services/studentApi'

const StudentAuthContext = createContext(null)

export function StudentAuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getStudentToken())
  const [student, setStudent] = useState(null)

  async function login(email, password) {
    const data = await studentLogin(email, password)
    setStudentToken(data.token)
    setTokenState(data.token)
    setStudent(data.student || null)
    return data
  }

  function logout() {
    setStudentToken(null)
    setTokenState(null)
    setStudent(null)
  }

  const value = useMemo(
    () => ({
      token,
      student,
      login,
      logout,
      setStudent,
    }),
    [token, student]
  )

  return <StudentAuthContext.Provider value={value}>{children}</StudentAuthContext.Provider>
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext)
  if (!context) throw new Error('useStudentAuth must be used within StudentAuthProvider')
  return context
}
