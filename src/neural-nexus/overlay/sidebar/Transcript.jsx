import React, { useEffect, useRef, useState } from 'react'
import useDashboardStore from '../../store/useDashboardStore'
import { colors } from '../../utils/colors'

const TYPING_SPEED = 12 // ms per character

const TypewriterText = ({ text, onComplete }) => {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    const interval = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= text.length) {
        setDisplayed(text)
        clearInterval(interval)
        if (onComplete) onComplete()
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, TYPING_SPEED)
    return () => clearInterval(interval)
  }, [text])

  const showCursor = displayed.length < text.length

  return (
    <span>
      {displayed}
      {showCursor && (
        <span
          style={{
            display: 'inline-block',
            width: 5,
            height: 10,
            background: colors.cyanPrimary,
            marginLeft: 1,
            animation: 'nn-cursor-blink 0.6s step-end infinite',
            verticalAlign: 'middle',
          }}
        />
      )}
    </span>
  )
}

const Transcript = () => {
  const messages = useDashboardStore((s) => s.messages)
  const addMessage = useDashboardStore((s) => s.addMessage)
  const scrollRef = useRef(null)

  // Auto-cycle messages
  useEffect(() => {
    const interval = setInterval(() => {
      addMessage()
    }, 4500)
    // Add first message immediately
    addMessage()
    return () => clearInterval(interval)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const cursorKeyframes = `
    @keyframes nn-cursor-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `

  const getSpeakerColor = (speaker) => {
    if (speaker === 'DR. CHEN') return colors.cyanPrimary
    if (speaker === 'AI NEXUS') return colors.purpleNeural
    return colors.textSecondary
  }

  return (
    <div
      style={{
        background: colors.panelBg,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 8,
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxHeight: 150,
        overflow: 'hidden',
        position: 'relative',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 100%)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}
    >
      <style>{cursorKeyframes}</style>

      {/* Gradient mask at top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 30,
          background: 'linear-gradient(to bottom, rgba(10,20,35,0.9), transparent)',
          borderRadius: '8px 8px 0 0',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={scrollRef}
        className="nn-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          paddingTop: 16,
        }}
      >
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1
          const isAI = msg.speaker === 'AI NEXUS'

          return (
            <div
              key={msg.timestamp + '-' + i}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                lineHeight: 1.5,
                color: colors.textSecondary,
                animation: 'nn-msg-fadein 0.4s ease-out',
              }}
            >
              <span
                style={{
                  color: getSpeakerColor(msg.speaker),
                  fontWeight: 700,
                  fontSize: 8,
                  letterSpacing: '0.06em',
                }}
              >
                {msg.speaker}:
              </span>{' '}
              {isLast && isAI ? (
                <TypewriterText text={msg.text} />
              ) : (
                <span>{msg.text}</span>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes nn-msg-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Transcript
