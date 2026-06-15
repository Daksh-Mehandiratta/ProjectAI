import { PenLine, Code2, BarChart3, Image, Search, FileText } from 'lucide-react'

const ICONS = { PenLine, Code2, BarChart3, Image, Search, FileText }

export default function FeatureCards({ featureCards, onCardClick }) {
  return (
    <div className="feature-scroll-wrap anim-2">
      <div className="feature-scroll">
        {featureCards.map(card => {
          const CardIcon = ICONS[card.icon]
          return (
            <div
              key={card.id}
              className="feature-chip"
              onClick={() => onCardClick && onCardClick(card)}
            >
              <div className="feature-chip-icon">
                {CardIcon && <CardIcon size={16} />}
              </div>
              <div>
                <div className="feature-chip-label">{card.label}</div>
                <div className="feature-chip-desc">{card.desc}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
