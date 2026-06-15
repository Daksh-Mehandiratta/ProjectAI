import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const API              = 'http://localhost:5000'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// ── Google icon SVG ────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.6c0-1.6-.1-3.2-.4-4.6H24v8.7h13.1c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.4-10.6 7.4-17.3z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.2 1.5-5 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.6 14.8 48 24 48z" fill="#34A853"/>
      <path d="M10.8 28.8c-.5-1.5-.8-3-.8-4.8s.3-3.3.8-4.8V13H2.7C1 16.3 0 19.9 0 24s1 7.7 2.7 11l8.1-6.2z" fill="#FBBC04"/>
      <path d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.4 30.5 0 24 0 14.8 0 6.7 5.4 2.7 13l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z" fill="#EA4335"/>
    </svg>
  )
}

export default function LoginPage({ onAuth }) {
  const [mode, setMode]         = useState('home')   // 'home' | 'email' | 'register'
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const googleBtnRef            = useRef(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google || mode !== 'home') return

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleCredential,
    })
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      type:  'standard',
      theme: 'outline',
      size:  'large',
      text:  'continue_with',
      shape: 'rectangular',
      width: 320,
    })
  }, [mode])

  const handleGoogleCredential = async ({ credential }) => {
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/auth/google`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credential }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Google sign-in failed.'); return }
      localStorage.setItem('ai_token', data.token)
      localStorage.setItem('ai_user',  JSON.stringify(data.user))
      onAuth(data.user)
    } catch { setError('Cannot reach the server. Is Flask running?') }
    finally  { setLoading(false) }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const endpoint = mode === 'register' ? '/register' : '/login'
    const body     = mode === 'register' ? { name, email, password } : { email, password }
    try {
      const res  = await fetch(`${API}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      localStorage.setItem('ai_token', data.token)
      localStorage.setItem('ai_user',  JSON.stringify(data.user))
      onAuth(data.user)
    } catch { setError('Cannot reach the server. Is Flask running?') }
    finally  { setLoading(false) }
  }

  const handleGuest = () => {
    onAuth({ name: 'Guest', email: '', initials: 'G', guest: true })
  }

  const reset = (m) => { setMode(m); setError(''); setName(''); setEmail(''); setPassword('') }

  return (
    <div className="auth-grid-bg">
      <div className="auth-container">
        
        {/* Logo and Title */}
        <div className="auth-header">
          <div className="auth-logo-box">P</div>
          <h1 className="auth-title">Welcome back to Project-AI</h1>
        </div>

        {/* ── Home screen ── */}
        {mode === 'home' && (
          <div className="auth-actions">
            {GOOGLE_CLIENT_ID ? (
              <div ref={googleBtnRef} className="auth-google-wrap" />
            ) : (
              <button
                className="auth-btn-outline"
                onClick={() => setError('Add VITE_GOOGLE_CLIENT_ID to your .env to enable Google login')}
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            )}

            <button className="auth-btn-outline" onClick={() => reset('email')}>
              Sign in with Email
            </button>

            {error && <div className="auth-error-box">{error}</div>}

            <div className="auth-footer-links">
              <button className="auth-text-link" onClick={() => reset('register')}>Create an account</button>
              <span className="auth-dot">·</span>
              <button className="auth-text-link" onClick={handleGuest}>Skip for now</button>
            </div>
          </div>
        )}

        {/* ── Login / Register form ── */}
        {(mode === 'email' || mode === 'register') && (
          <form className="auth-form" onSubmit={handleEmailSubmit}>
            {mode === 'register' && (
              <input
                className="auth-input-field"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required autoFocus
              />
            )}

            <input
              className="auth-input-field"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus={mode === 'email'}
            />

            <div className="auth-pw-wrap">
              <input
                className="auth-input-field"
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="auth-pw-eye" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>

            {error && <div className="auth-error-box">{error}</div>}

            <button className="auth-btn-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin"/> : (mode === 'email' ? 'Sign in' : 'Create account')}
            </button>

            <div className="auth-footer-links">
              <button type="button" className="auth-text-link" onClick={() => reset('home')}>← Back</button>
              <span className="auth-dot">·</span>
              <button type="button" className="auth-text-link" onClick={() => reset(mode === 'email' ? 'register' : 'email')}>
                {mode === 'email' ? 'Create an account' : 'Sign in instead'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
