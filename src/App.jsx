import { useState, useEffect, useRef } from 'react'
import config from './config'
import LoginPage  from './components/LoginPage'
import Sidebar    from './components/Sidebar'
import TopNavbar  from './components/TopNavbar'
import PromptBox  from './components/PromptBox'
import FeatureCards from './components/FeatureCards'
import SpamDetector from './components/SpamDetector'
import ChatArea   from './components/ChatArea'
import SettingsPage from './components/SettingsPage'

const API = 'http://localhost:5000'

// ── Time-based greeting ────────────────────────────────────────────────────────
function getGreeting(name) {
  const hour = new Date().getHours()
  const nameStr = name ? `, ${name}` : ''
  if (hour < 12) return `Good morning${nameStr} 🌤️`
  if (hour < 17) return `Good afternoon${nameStr} 👋`
  if (hour < 21) return `Good evening${nameStr} 🌙`
  return `Good night${nameStr} 🌙`
}

export default function App() {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null)         // null = not loaded yet
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Try to restore session from localStorage
    const token    = localStorage.getItem('ai_token')
    const savedUser = localStorage.getItem('ai_user')

    if (token && savedUser) {
      // Verify token is still valid with the server
      fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.user) setUser(data.user)
          else { localStorage.removeItem('ai_token'); localStorage.removeItem('ai_user') }
        })
        .catch(() => {
          // Server offline — still use cached user from localStorage
          try { setUser(JSON.parse(savedUser)) } catch {}
        })
        .finally(() => setAuthChecked(true))
    } else {
      setAuthChecked(true)
    }
  }, [])

  const handleAuth = (loggedInUser) => setUser(loggedInUser)

  const handleLogout = () => {
    localStorage.removeItem('ai_token')
    localStorage.removeItem('ai_user')
    setUser(null)
    setMessages([])
  }

  // Chat state
  const [dark, setDark]           = useState(config.theme.defaultDark)
  const [collapsed, setCollapsed] = useState(false)
  const [activeNav, setActiveNav] = useState('models')
  const [messages, setMessages]       = useState([])
  const [isTyping, setIsTyping]       = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const endOfChatRef                  = useRef(null)

  useEffect(() => {
    document.body.className = dark ? 'dark' : ''
  }, [dark])

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleNewChat = () => {
    setMessages([])
    setIsTyping(false)
    setIsSearching(false)
    setActiveNav('models')
  }

  const handleLoadHistory = (item) => {
    // Simulate loading a past chat
    setMessages([
      { role: 'user',      content: item.text },
      { role: 'assistant', content: `This is a restored conversation about: **${item.text}**. Your full history would be loaded from storage here.` },
    ])
    setActiveNav('models')
  }

  const handlePromptSubmit = (text, webSearch = false) => {
    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsTyping(true)
    setIsSearching(webSearch)

    fetch('http://localhost:5000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages, webSearch }),
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`)
        return data
      })
      .then(data => {
        if (data.error) {
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error}` }])
          return
        }
        const reply = data.webSearched
          ? `🔍 *Web search used*\n\n${data.reply}`
          : data.reply
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      })
      .catch(err => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `❌ API Error: ${err.message}`
        }])
      })
      .finally(() => {
        setIsTyping(false)
        setIsSearching(false)
      })
  }

  const handleCardClick = (card) => {
    const prompts = {
      write:    'Write a professional bio for a software developer with 5 years of experience.',
      code:     'Write a Python function that sorts a list of dictionaries by a given key.',
      analyze:  'Analyze the pros and cons of using React vs Vue for a large-scale web application.',
      design:   'Describe a clean, modern UI design for a fintech mobile app dashboard.',
      research: 'What are the latest trends in artificial intelligence for 2025?',
      summarize:'Summarize the key differences between machine learning, deep learning, and AI.',
    }
    handlePromptSubmit(prompts[card.id] || `Help me with ${card.label.toLowerCase()}`)
  }

  const greeting = getGreeting(user?.guest ? '' : (user?.name || ''))

  // ── Auth guards ────────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F5F5F7' }}>
        <div style={{ width:32, height:32, border:'3px solid #E5E7EB', borderTopColor:'#1A1A2E', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (!user) {
    return <LoginPage onAuth={handleAuth} />
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        config={config}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onNewChat={handleNewChat}
        messages={messages}
        onLoadHistory={handleLoadHistory}
      />

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <TopNavbar
          config={config}
          dark={dark}
          onToggleDark={() => setDark(d => !d)}
          sidebarCollapsed={collapsed}
          onExpandSidebar={() => setCollapsed(false)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Content */}
        <div className="content-area">
          {activeNav === 'models' ? (
            <div className="chat-layout">
              {messages.length === 0 ? (

                /* ── Hero / Home view ── */
                <div className="hero-view-wrap">

                  <h1 className="hero-heading anim-1">{greeting}</h1>
                  <p className="hero-subtitle anim-1">{config.app.subtitle}</p>

                  {/* Feature chips */}
                  <FeatureCards featureCards={config.featureCards} onCardClick={handleCardClick} />

                  {/* Prompt box */}
                  <PromptBox onSubmit={handlePromptSubmit} disabled={isTyping} />

                  {/* Example prompts */}
                  <div className="examples-section anim-3">
                    <div className="examples-label">Try these examples</div>
                    <div className="examples-list">
                      {config.examplePrompts.map((ex, i) => (
                        <button
                          key={i}
                          className="example-pill"
                          onClick={() => handlePromptSubmit(ex)}
                        >
                          {ex}
                          <span className="example-arrow">↗</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              ) : (

                /* ── Active chat view ── */
                <div className="chat-view">
                  <div className="chat-scroll-area">
                    <ChatArea
                      messages={messages}
                      isTyping={isTyping}
                      isSearching={isSearching}
                    />
                    <div ref={endOfChatRef} />
                  </div>
                  <div className="chat-input-bar">
                    <PromptBox onSubmit={handlePromptSubmit} disabled={isTyping} />
                    <div className="disclaimer">
                      AI Studio · {config.app.disclaimer}
                    </div>
                  </div>
                </div>

              )}
            </div>
          ) : activeNav === 'tools' ? (
            <div className="section-scroll">
              <SpamDetector />
            </div>
          ) : activeNav === 'settings' ? (
            <div className="section-scroll">
              <SettingsPage dark={dark} onToggleDark={() => setDark(d => !d)} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
