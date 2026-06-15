import { useState, useRef, useEffect } from 'react'
import { Cpu, ChevronDown, ChevronUp, Check } from 'lucide-react'

export default function ModelSelector({ models }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(models[0])
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="model-btn" onClick={() => setOpen(o => !o)}>
        <span className="model-dot" />
        {selected.name}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="model-dropdown">
          {models.map(m => (
            <div
              key={m.id}
              className={`model-option${selected.id === m.id ? ' selected' : ''}`}
              onClick={() => { setSelected(m); setOpen(false) }}
            >
              <div className="model-option-icon">
                <Cpu size={15} />
              </div>
              <div>
                <div className="model-option-name">{m.name}</div>
                <div className="model-option-desc">{m.desc}</div>
              </div>
              <span className="model-badge">{m.badge}</span>
              {selected.id === m.id && (
                <Check size={13} style={{ color: '#5A6070', marginLeft: 4 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
