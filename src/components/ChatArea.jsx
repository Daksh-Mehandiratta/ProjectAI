import { Sparkles, User, Loader2, Globe } from 'lucide-react'

// ── Inline Markdown Renderer (no external packages needed) ────────────────────
function renderInline(text) {
  // Process inline: code, bold, italic
  const parts = []
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0, match, key = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const raw = match[0]
    if (raw.startsWith('`'))        parts.push(<code key={key++} className="md-code">{raw.slice(1, -1)}</code>)
    else if (raw.startsWith('**')) parts.push(<strong key={key++}>{raw.slice(2, -2)}</strong>)
    else if (raw.startsWith('*'))  parts.push(<em key={key++}>{raw.slice(1, -1)}</em>)
    last = match.index + raw.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function MarkdownBlock({ content }) {
  const lines  = content.split('\n')
  const output = []
  let   i      = 0

  while (i < lines.length) {
    const line = lines[i]

    // ── Code fence ─────────────────────────────────────────────────────────────
    if (line.trimStart().startsWith('```')) {
      const lang  = line.replace(/```/g, '').trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      output.push(
        <div key={i} className="md-code-block">
          {lang && <span className="md-code-lang">{lang}</span>}
          <pre><code>{codeLines.join('\n')}</code></pre>
        </div>
      )
      i++
      continue
    }

    // ── Headings ───────────────────────────────────────────────────────────────
    if (/^### /.test(line)) { output.push(<h3 key={i} className="md-h3">{renderInline(line.slice(4))}</h3>);  i++; continue }
    if (/^## /.test(line))  { output.push(<h2 key={i} className="md-h2">{renderInline(line.slice(3))}</h2>);  i++; continue }
    if (/^# /.test(line))   { output.push(<h1 key={i} className="md-h1">{renderInline(line.slice(2))}</h1>);  i++; continue }

    // ── Horizontal rule ────────────────────────────────────────────────────────
    if (/^---+$/.test(line.trim())) { output.push(<hr key={i} className="md-hr" />); i++; continue }

    // ── Bullet list ────────────────────────────────────────────────────────────
    if (/^[*\-] /.test(line)) {
      const items = []
      while (i < lines.length && /^[*\-] /.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      output.push(<ul key={`ul-${i}`} className="md-ul">{items}</ul>)
      continue
    }

    // ── Numbered list ──────────────────────────────────────────────────────────
    if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\. /, ''))}</li>)
        i++
      }
      output.push(<ol key={`ol-${i}`} className="md-ol">{items}</ol>)
      continue
    }

    // ── Blank line ─────────────────────────────────────────────────────────────
    if (line.trim() === '') { output.push(<div key={i} className="md-spacer" />); i++; continue }

    // ── Plain paragraph ────────────────────────────────────────────────────────
    output.push(<p key={i} className="md-p">{renderInline(line)}</p>)
    i++
  }
  return <div className="md-body">{output}</div>
}

// ── ChatArea ──────────────────────────────────────────────────────────────────
export default function ChatArea({ messages, isTyping, isSearching }) {
  return (
    <div className="chat-container anim-1">
      {messages.map((msg, idx) => (
        <div key={idx} className={`chat-bubble-wrapper ${msg.role}`}>
          <div className="chat-avatar">
            {msg.role === 'user' ? (
              <div className="user-avatar-small"><User size={13} /></div>
            ) : (
              <div className="ai-avatar-small"><Sparkles size={14} color="white" /></div>
            )}
          </div>
          <div className={`chat-bubble ${msg.role}`}>
            {msg.role === 'assistant'
              ? <MarkdownBlock content={msg.content} />
              : msg.content
            }
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="chat-bubble-wrapper assistant">
          <div className="chat-avatar">
            <div className="ai-avatar-small">
              {isSearching ? <Globe size={14} color="white" /> : <Sparkles size={14} color="white" />}
            </div>
          </div>
          <div className="chat-bubble assistant typing">
            <Loader2 size={16} className="spin" />
            {isSearching ? 'Searching the web...' : 'Thinking...'}
          </div>
        </div>
      )}
    </div>
  )
}
