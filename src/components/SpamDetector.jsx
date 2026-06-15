import { useState } from 'react'
import { ShieldCheck, ShieldAlert, Loader2, Send, RotateCcw } from 'lucide-react'

const API_URL = 'http://localhost:5000/predict'

export default function SpamDetector() {
  const [message, setMessage]     = useState('')
  const [result, setResult]       = useState(null)   // { label, confidence, is_spam }
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  const analyze = async () => {
    if (!message.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res  = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not connect to API. Is api.py running?')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMessage('')
    setResult(null)
    setError(null)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) analyze()
  }

  return (
    <div className="spam-page">
      <div className="spam-header">
        <div className="spam-icon-wrap">
          <ShieldCheck size={28} color="white" />
        </div>
        <h1 className="spam-title">Spam Detector</h1>
        <p className="spam-subtitle">
          Paste any message and the AI will classify it as spam or legitimate.
        </p>
      </div>

      {/* Input Card */}
      <div className="spam-card">
        <label className="spam-label">Message to analyze</label>
        <textarea
          className="spam-textarea"
          placeholder="Type or paste a message here... (Ctrl+Enter to analyze)"
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
        />
        <div className="spam-actions">
          <button className="spam-reset-btn" onClick={reset} disabled={!message && !result}>
            <RotateCcw size={14} /> Reset
          </button>
          <button
            className="spam-analyze-btn"
            onClick={analyze}
            disabled={!message.trim() || loading}
          >
            {loading
              ? <><Loader2 size={15} className="spin" /> Analyzing...</>
              : <><Send size={15} /> Analyze Message</>
            }
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="spam-error">
          ⚠️ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`spam-result ${result.is_spam ? 'spam' : 'ham'}`}>
          <div className="spam-result-icon">
            {result.is_spam
              ? <ShieldAlert size={36} />
              : <ShieldCheck size={36} />
            }
          </div>
          <div className="spam-result-info">
            <div className="spam-result-label">
              {result.is_spam ? '🚨 SPAM' : '✅ LEGITIMATE'}
            </div>
            <div className="spam-result-message">"{result.message}"</div>
            <div className="spam-result-confidence">
              Confidence: <strong>{result.confidence}%</strong>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="confidence-bar-wrap">
            <div className="confidence-bar-track">
              <div
                className="confidence-bar-fill"
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <span className="confidence-bar-label">{result.confidence}%</span>
          </div>
        </div>
      )}

      {/* Examples */}
      <div className="spam-examples">
        <div className="spam-examples-label">Try an example:</div>
        <div className="spam-examples-list">
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="spam-example-btn" onClick={() => setMessage(ex.text)}>
              <span className={`ex-badge ${ex.type}`}>{ex.type}</span>
              {ex.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const EXAMPLES = [
  { type: 'spam', text: 'Congratulations! You won a $1000 gift card. Click here to claim now!' },
  { type: 'ham',  text: 'Hey, are you free for lunch tomorrow?' },
  { type: 'spam', text: 'Your account has been selected for a FREE iPhone. Reply YES to claim.' },
  { type: 'ham',  text: 'Don\'t forget the meeting is at 3 PM today.' },
]
