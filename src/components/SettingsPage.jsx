import { Moon, Sun, Bell, Shield, Info, ChevronRight } from 'lucide-react'

export default function SettingsPage({ dark, onToggleDark }) {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your app preferences</p>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-label">Appearance</div>

        <div className="settings-card">
          <div className="settings-row" onClick={onToggleDark} style={{ cursor: 'pointer' }}>
            <div className="settings-row-left">
              <div className="settings-row-icon">
                {dark ? <Moon size={16} /> : <Sun size={16} />}
              </div>
              <div>
                <div className="settings-row-title">Dark Mode</div>
                <div className="settings-row-desc">Switch between light and dark theme</div>
              </div>
            </div>
            <div className={`toggle-track${dark ? ' on' : ''}`} />
          </div>
        </div>
      </div>

      {/* API */}
      <div className="settings-section">
        <div className="settings-section-label">API</div>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-left">
              <div className="settings-row-icon"><Shield size={16} /></div>
              <div>
                <div className="settings-row-title">API Endpoint</div>
                <div className="settings-row-desc">http://localhost:5000</div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: '#B0B7C3', flexShrink: 0 }} />
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <div className="settings-row-left">
              <div className="settings-row-icon"><Bell size={16} /></div>
              <div>
                <div className="settings-row-title">Model</div>
                <div className="settings-row-desc">Spam classifier — Naïve Bayes</div>
              </div>
            </div>
            <ChevronRight size={15} style={{ color: '#B0B7C3', flexShrink: 0 }} />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <div className="settings-section-label">About</div>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-left">
              <div className="settings-row-icon"><Info size={16} /></div>
              <div>
                <div className="settings-row-title">Version</div>
                <div className="settings-row-desc">1.0.0 — AI Spam Detector Project</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
