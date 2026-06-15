import { useState, useRef } from 'react'
import { Paperclip, Globe, Mic, ArrowUp, Plus } from 'lucide-react'

export default function PromptBox({ onSubmit, disabled }) {
  const [value, setValue]         = useState('')
  const [webSearch, setWebSearch] = useState(false)
  const textareaRef               = useRef(null)

  const handleSubmit = () => {
    if (!value.trim() || disabled) return
    onSubmit(value, webSearch)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`
  }

  return (
    <div className="prompt-box-v2 anim-2">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="prompt-textarea-v2"
        placeholder="Ask anything..."
        rows={1}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />

      {/* Bottom toolbar */}
      <div className="prompt-toolbar">
        <div className="prompt-toolbar-left">
          {/* + button */}
          <button className="ptool-btn" title="Add attachment" disabled={disabled}>
            <Plus size={16} />
          </button>

          {/* Web Search */}
          <button
            className={`ptool-btn ptool-toggle${webSearch ? ' active' : ''}`}
            onClick={() => !disabled && setWebSearch(w => !w)}
            disabled={disabled}
            title="Toggle web search"
          >
            <Globe size={14} />
            Web Search
          </button>

          {/* Attach */}
          <label className={`ptool-btn${disabled ? ' disabled' : ''}`} title="Attach file">
            <input type="file" style={{ display: 'none' }} disabled={disabled} />
            <Paperclip size={14} />
            Attach
          </label>
        </div>

        <div className="prompt-toolbar-right">
          {/* Mic */}
          <button className="ptool-btn ptool-icon" title="Voice input" disabled={disabled}>
            <Mic size={16} />
          </button>

          {/* Send */}
          <button
            className="send-btn-v2"
            disabled={!value.trim() || disabled}
            onClick={handleSubmit}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
