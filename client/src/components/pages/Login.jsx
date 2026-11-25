import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Brand from '../Brand'
import { useAppContext } from '../../context/useAppContext'

export default function Login({ register = false }) {
  const { axios, setToken } = useAppContext()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const values = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true)
    setError('')
    try {
      const { data } = await axios.post(
        register ? '/api/user/register' : '/api/user/login',
        values,
      )
      if (!data.success) throw new Error(data.message)
      setToken(data.token)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      setBusy(false)
    }
  }
  return (
    <main className="auth-page">
      <Brand />
      <form className="auth-card" onSubmit={submit}>
        <p className="kicker">
          <i /> Your workspace
        </p>
        <h1>{register ? 'Create an account' : 'Welcome back'}</h1>
        {register && (
          <label>
            Name
            <input name="name" autoComplete="name" required />
          </label>
        )}
        <label>
          Email address
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete={register ? 'new-password' : 'current-password'}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button className="button orange" disabled={busy}>
          {busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}{' '}
          <span>→</span>
        </button>
        <p>
          {register ? 'Already have an account?' : 'New to QuickGPT?'}{' '}
          <Link state={location.state} to={register ? '/login' : '/signup'}>
            {register ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </form>
    </main>
  )
}
