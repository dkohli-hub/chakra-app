import { useState } from 'react'
import { authAPI } from '../services/api'

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  async function login(username, password) {
    const { data } = await authAPI.login(username, password)
    localStorage.setItem('token', data.access_token)
    setToken(data.access_token)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return { token, login, logout }
}
