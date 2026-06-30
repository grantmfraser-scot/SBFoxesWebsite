import { useState, useEffect } from 'react'
import axios from 'axios'

export function useApi(url, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    axios.get(url)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, deps)

  return { data, loading, error }
}

export const adminToken = {
  get: () => localStorage.getItem('foxes_admin_token'),
  set: (t) => localStorage.setItem('foxes_admin_token', t),
  clear: () => localStorage.removeItem('foxes_admin_token'),
}

export function authHeaders() {
  return { 'x-admin-token': adminToken.get() }
}
