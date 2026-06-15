import { useState } from 'react'
import {
  Plus, Search, MessageSquare, Wrench, Settings,
  ChevronsLeft, Clock, Library, Trash2, MoreHorizontal
} from 'lucide-react'

const NAV_ICONS = { MessageSquare, Wrench, Settings }

export default function Sidebar({
  config, collapsed, onToggleCollapse,
  activeNav, onNavChange, onNewChat,
  messages, onLoadHistory,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('history') // 'history' | 'library'
  const { chatHistory, sidebarNav } = config

  const filterHistory = (items) =>
    items.filter(i => i.text.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>

      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">AI</div>
          <span className="sidebar-logo-text">Project-AI</span>
        </div>
        <button className="sidebar-collapse-btn" onClick={onToggleCollapse} title="Collapse">
          <ChevronsLeft size={15} />
        </button>
      </div>

      {/* New Chat */}
      <button className="new-chat-btn" onClick={onNewChat}>
        <Plus size={14} /> New Chat
      </button>

      {/* Section tabs: History / Library */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab${activeSection === 'history' ? ' active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          <Clock size={13} /> History
        </button>
        <button
          className={`sidebar-tab${activeSection === 'library' ? ' active' : ''}`}
          onClick={() => setActiveSection('library')}
        >
          <Library size={13} /> Library
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Search size={13} className="sidebar-search-icon" />
        <input
          className="sidebar-search-input"
          placeholder={activeSection === 'history' ? 'Search history...' : 'Search library...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="sidebar-content">
        {activeSection === 'history' ? (
          <>
            {filterHistory(chatHistory.today).length > 0 && (
              <div className="history-group">
                <div className="history-group-label">Today</div>
                {filterHistory(chatHistory.today).map(item => (
                  <HistoryItem key={item.id} item={item} onLoadHistory={onLoadHistory} />
                ))}
              </div>
            )}
            {filterHistory(chatHistory.yesterday).length > 0 && (
              <div className="history-group">
                <div className="history-group-label">Yesterday</div>
                {filterHistory(chatHistory.yesterday).map(item => (
                  <HistoryItem key={item.id} item={item} onLoadHistory={onLoadHistory} />
                ))}
              </div>
            )}
            {filterHistory(chatHistory.previous).length > 0 && (
              <div className="history-group">
                <div className="history-group-label">Previous 7 days</div>
                {filterHistory(chatHistory.previous).map(item => (
                  <HistoryItem key={item.id} item={item} onLoadHistory={onLoadHistory} />
                ))}
              </div>
            )}
            {searchQuery && filterHistory([...chatHistory.today, ...chatHistory.yesterday, ...chatHistory.previous]).length === 0 && (
              <div className="sidebar-empty">No results for "{searchQuery}"</div>
            )}
          </>
        ) : (
          <div className="library-empty">
            <Library size={28} style={{ color: '#B0B7C3', marginBottom: 10 }} />
            <div style={{ fontSize: 13, color: '#7B8597' }}>Your saved chats appear here</div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="sidebar-nav">
        {sidebarNav.map(item => {
          const NavIcon = NAV_ICONS[item.icon]
          return (
            <div
              key={item.id}
              className={`nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => onNavChange(item.id)}
            >
              {NavIcon && <NavIcon size={15} />}
              {item.label}
            </div>
          )
        })}
      </nav>

    </aside>
  )
}

function HistoryItem({ item, onLoadHistory }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      className="history-item"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onLoadHistory && onLoadHistory(item)}
    >
      <span className="history-item-text">{item.text}</span>
      {hover && (
        <button
          className="history-item-action"
          onClick={e => { e.stopPropagation() }}
          title="More options"
        >
          <MoreHorizontal size={13} />
        </button>
      )}
    </div>
  )
}
