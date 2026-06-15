import { PanelLeft, Sun, Moon, LogOut, User } from 'lucide-react'
import ModelSelector from './ModelSelector'

export default function TopNavbar({ config, dark, onToggleDark, sidebarCollapsed, onExpandSidebar, user, onLogout }) {
  const { models } = config

  return (
    <header className="topbar">
      <div className="topbar-left">
        {sidebarCollapsed && (
          <button className="icon-btn" onClick={onExpandSidebar} title="Open sidebar">
            <PanelLeft size={15} />
          </button>
        )}
        <ModelSelector models={models} />
      </div>

      <div className="topbar-right">
        <button className="icon-btn" onClick={onToggleDark} title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {user && !user.guest && (
          <>
            <div className="user-chip" title={user.email}>
              <div className="user-chip-avatar">{user.initials || user.name?.[0]?.toUpperCase()}</div>
              <span className="user-chip-name">{user.name.split(' ')[0]}</span>
            </div>
            <button className="icon-btn" onClick={onLogout} title="Sign out">
              <LogOut size={15} />
            </button>
          </>
        )}

        {user && user.guest && (
          <button className="icon-btn" onClick={onLogout} title="Sign in">
            <User size={15} />
          </button>
        )}
      </div>
    </header>
  )
}
