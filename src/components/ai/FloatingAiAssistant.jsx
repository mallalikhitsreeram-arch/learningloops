import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, X, Minus, User, WifiOff, Target, ArrowRight, BookOpen, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const FloatingAiAssistant = ({
  currentPath = '',
  selectedCourse = null,
  activeLessonContext = null,
  isTestActive = false,
  onNavigateToPractice,
  onNavigateToCourse,
  onNavigateToInterviewLab
}) => {
  const { currentUser, getAuthHeaders } = useAuth();
  const { isEffectiveOnline } = useNetwork();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const studentId = currentUser?.id || currentUser?.code || 'guest';
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Student';

  // Initial welcome message per student
  const defaultInitialMessage = {
    id: 'welcome',
    role: 'assistant',
    text: `Hi ${firstName}! 👋\nWhat would you like to work on today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // Chat conversation state preserved per student session
  const [messages, setMessages] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`ll_ai_chat_${studentId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [defaultInitialMessage];
  });

  // Keep chat history isolated when user changes
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(`ll_ai_chat_${studentId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `Hi ${firstName}! 👋\nWhat would you like to work on today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [studentId, firstName]);

  // Save conversation in session storage
  useEffect(() => {
    try {
      if (studentId && messages.length > 0) {
        sessionStorage.setItem(`ll_ai_chat_${studentId}`, JSON.stringify(messages));
      }
    } catch {
      // ignore
    }
  }, [messages, studentId]);

  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Close panel on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Dynamic quick suggestions based on lesson/video context
  const isInLesson = Boolean(activeLessonContext?.lessonTitle);
  const quickSuggestions = isInLesson
    ? [
        "Explain this video",
        "Give me notes",
        "Quiz me on this topic",
        "Explain this in simple terms",
        "Give me important points"
      ]
    : [
        "What should I study today?",
        "Explain my weak topics",
        "Create a study plan",
        "Help with this course",
        "Prepare me for an interview"
      ];

  const handleSendMessage = async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: timeStr
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    // Build context
    const pageContext = {
      path: currentPath,
      courseTitle: activeLessonContext?.courseTitle || selectedCourse?.title || null,
      courseId: activeLessonContext?.courseId || selectedCourse?.id || null,
      lessonTitle: activeLessonContext?.lessonTitle || null,
      lessonId: activeLessonContext?.lessonId || null,
      videoTitle: activeLessonContext?.videoTitle || null,
      youtubeVideoId: activeLessonContext?.youtubeVideoId || null,
      activeMediaTab: activeLessonContext?.activeMediaTab || null,
      isTestActive: Boolean(isTestActive)
    };

    if (isEffectiveOnline) {
      try {
        const res = await fetch('/api/ai/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            query: q,
            pageContext
          })
        });

        const data = await res.json();
        const botReply = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: data.reply || "I've analyzed your learning records. Ask me what to study today or how to practice your weak topics!",
          actionTopic: data.actionTopic,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botReply]);
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text: "I experienced a brief connection delay. Based on your cached profile, focusing 30 minutes on your lowest scoring topic will best safeguard your learning streak.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } else {
      // Offline fallback tutor
      setTimeout(() => {
        let offlineText = `⚡ Offline Mode: Based on your locally stored records for ${firstName}, your highest leverage activity is reviewing your downloaded lessons and practicing core problem sets.`;
        let actTopic = null;

        if (isInLesson) {
          offlineText = `⚡ Offline Mode: You are viewing "${activeLessonContext.lessonTitle}". While YouTube video streaming requires internet connectivity, all lesson Text & Notes, code examples, and practice diagnostics are fully saved and accessible offline!`;
        } else if (q.toLowerCase().includes('study') || q.toLowerCase().includes('today')) {
          offlineText = `Based on your cached diagnostic profile, spending 30 minutes on your key focus areas will safeguard your progress. You have downloaded modules ready for offline study!`;
          actTopic = 'Core Fundamentals';
        } else if (q.toLowerCase().includes('weak')) {
          offlineText = `Offline Diagnostic: Review your previously downloaded assessment summaries to reinforce topics with scores under 75%.`;
        }

        setMessages(prev => [
          ...prev,
          {
            id: `off-${Date.now()}`,
            role: 'assistant',
            text: offlineText,
            actionTopic: actTopic,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 300);
    }

    setIsLoading(false);
  };

  const handleActionClick = (actionTopic) => {
    if (!actionTopic) return;
    if (onNavigateToPractice) {
      onNavigateToPractice(actionTopic);
      // Close panel after navigation so student views the practice page
      setIsOpen(false);
    }
  };

  return (
    <>
      <style>{`
        /* Floating Button Glowing Pulse Animation */
        @keyframes aiGlowPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(217, 107, 67, 0.45), 0 4px 14px rgba(0, 0, 0, 0.12);
          }
          50% {
            box-shadow: 0 0 0 7px rgba(217, 107, 67, 0.18), 0 6px 18px rgba(217, 107, 67, 0.28);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(217, 107, 67, 0), 0 4px 14px rgba(0, 0, 0, 0.12);
          }
        }

        @keyframes aiPanelSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .floating-ai-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: var(--radius-full, 9999px);
          background: #ffffff;
          color: var(--accent-primary, #D96B43);
          border: 1.5px solid var(--accent-primary, #D96B43);
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          animation: aiGlowPulse 2.8s infinite ease-in-out;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
        }

        .floating-ai-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 0 16px rgba(217, 107, 67, 0.5), 0 8px 22px rgba(0, 0, 0, 0.16);
        }

        .floating-ai-btn:active {
          transform: translateY(0) scale(0.97);
        }

        .floating-ai-btn.active-open {
          background: var(--accent-primary, #D96B43);
          color: #ffffff;
          border-color: var(--accent-primary, #D96B43);
          box-shadow: 0 4px 18px rgba(217, 107, 67, 0.35);
          animation: none;
        }

        .floating-ai-panel {
          position: fixed;
          bottom: 82px;
          right: 24px;
          width: 384px;
          max-width: calc(100vw - 32px);
          height: 530px;
          max-height: calc(100vh - 110px);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid var(--border-subtle, #E2E8F0);
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.14), 0 2px 10px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          animation: aiPanelSlideUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 480px) {
          .floating-ai-btn {
            bottom: 16px;
            right: 16px;
            padding: 9px 14px;
            font-size: 0.85rem;
          }
          .floating-ai-panel {
            bottom: 74px;
            right: 12px;
            left: 12px;
            width: auto;
            max-width: none;
            height: calc(100vh - 96px);
          }
          .floating-ai-btn-text-full {
            display: none;
          }
          .floating-ai-btn-text-short {
            display: inline;
          }
        }

        @media (min-width: 481px) {
          .floating-ai-btn-text-full {
            display: inline;
          }
          .floating-ai-btn-text-short {
            display: none;
          }
        }
      `}</style>

      {/* FLOATING AI CHAT PANEL */}
      {isOpen && (
        <div
          ref={panelRef}
          className="floating-ai-panel"
          role="dialog"
          aria-label="Learning AI Assistant Panel"
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
              background: 'linear-gradient(180deg, #FFFFFF 0%, var(--bg-surface-subtle, #F8FAFC) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'var(--accent-primary-light, rgba(217, 107, 67, 0.12))',
                  color: 'var(--accent-primary, #D96B43)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(217, 107, 67, 0.25)',
                  boxShadow: '0 2px 6px rgba(217, 107, 67, 0.15)'
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.94rem', color: 'var(--text-primary, #1E293B)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>✨ Learning AI</span>
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary, #64748B)' }}>
                  Your personal learning assistant
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                aria-label="Minimize Learning AI"
                style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  color: 'var(--text-muted, #94A3B8)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-surface-subtle)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Minus size={16} />
              </button>
              <button
                id="close-floating-ai-btn"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                aria-label="Close Learning AI"
                style={{
                  padding: '6px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  color: 'var(--text-muted, #94A3B8)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEE2E2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Context Notice (If on course, test, or offline) */}
          {!isEffectiveOnline && (
            <div style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '6px 14px', fontSize: '0.74rem', color: '#9A3412', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <WifiOff size={13} />
              <span>Offline Assistant • Using cached diagnostic data</span>
            </div>
          )}

          {activeLessonContext?.lessonTitle ? (
            <div style={{ background: '#FFF7ED', borderBottom: '1px solid #FED7AA', padding: '5px 14px', fontSize: '0.73rem', color: '#C2410C', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Video size={12} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Lesson: <strong>{activeLessonContext.lessonTitle}</strong> {activeLessonContext.videoTitle ? `• ${activeLessonContext.videoTitle}` : ''}
              </span>
            </div>
          ) : selectedCourse && (
            <div style={{ background: '#F0FDF4', borderBottom: '1px solid #DCFCE7', padding: '5px 14px', fontSize: '0.73rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={12} />
              <span>Context: Active Course — <strong>{selectedCourse.title}</strong></span>
            </div>
          )}

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: 'var(--bg-app, #F8FAFC)'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%'
                }}
              >
                {m.role === 'assistant' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--accent-primary-light, rgba(217, 107, 67, 0.12))',
                      color: 'var(--accent-primary, #D96B43)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      border: '1px solid rgba(217, 107, 67, 0.25)'
                    }}
                  >
                    <Bot size={14} />
                  </div>
                )}

                <div
                  style={{
                    background: m.role === 'user' ? 'var(--accent-primary, #D96B43)' : '#ffffff',
                    color: m.role === 'user' ? '#ffffff' : 'var(--text-primary, #1E293B)',
                    padding: '10px 13px',
                    borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '0.84rem',
                    lineHeight: '1.48',
                    whiteSpace: 'pre-wrap',
                    boxShadow: m.role === 'user' ? '0 2px 8px rgba(217, 107, 67, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.05)',
                    border: m.role === 'user' ? 'none' : '1px solid var(--border-subtle, #E2E8F0)'
                  }}
                >
                  <div>{m.text}</div>

                  {/* Action button if topic recommended */}
                  {m.actionTopic && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        onClick={() => handleActionClick(m.actionTopic)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.76rem',
                          fontWeight: '600',
                          background: m.role === 'user' ? '#ffffff' : 'var(--accent-primary, #D96B43)',
                          color: m.role === 'user' ? 'var(--accent-primary, #D96B43)' : '#ffffff',
                          border: 'none',
                          borderRadius: 'var(--radius-sm, 6px)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <Target size={12} />
                        <span>Practice {m.actionTopic} Now</span>
                        <ArrowRight size={11} />
                      </button>
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: '0.66rem',
                      color: m.role === 'user' ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted, #94A3B8)',
                      textAlign: 'right',
                      marginTop: '4px'
                    }}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {m.role === 'user' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--border-subtle, #E2E8F0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <User size={14} color="var(--text-secondary, #64748B)" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  color: 'var(--text-secondary, #64748B)',
                  fontSize: '0.78rem',
                  padding: '6px 10px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  width: 'fit-content',
                  border: '1px solid var(--border-subtle, #E2E8F0)'
                }}
              >
                <Sparkles size={13} color="var(--accent-primary, #D96B43)" className="spin-animation" />
                <span>Analyzing your learning records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills */}
          <div
            style={{
              padding: '7px 12px',
              borderTop: '1px solid var(--border-subtle, #E2E8F0)',
              background: '#ffffff',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {quickSuggestions.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  background: 'var(--bg-surface-subtle, #F8FAFC)',
                  fontSize: '0.73rem',
                  fontWeight: '500',
                  color: 'var(--text-secondary, #475569)',
                  border: '1px solid var(--border-subtle, #E2E8F0)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-primary-light, rgba(217, 107, 67, 0.1))';
                  e.currentTarget.style.color = 'var(--accent-primary, #D96B43)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary, #D96B43)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface-subtle, #F8FAFC)';
                  e.currentTarget.style.color = 'var(--text-secondary, #475569)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle, #E2E8F0)';
                }}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--border-subtle, #E2E8F0)',
              background: '#ffffff',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              id="floating-ai-input"
              className="search-input"
              placeholder="Ask me anything..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.84rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, #E2E8F0)',
                background: 'var(--bg-surface-subtle, #F8FAFC)'
              }}
            />
            <button
              type="submit"
              id="floating-ai-send-btn"
              disabled={!inputQuery.trim() || isLoading}
              aria-label="Send message to Learning AI"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: inputQuery.trim() && !isLoading ? 'var(--accent-primary, #D96B43)' : 'var(--bg-surface-subtle, #E2E8F0)',
                color: inputQuery.trim() && !isLoading ? '#ffffff' : 'var(--text-muted, #94A3B8)',
                border: 'none',
                cursor: inputQuery.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING AI BUTTON (Bottom-Right) */}
      <button
        id="floating-ai-trigger-btn"
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className={`floating-ai-btn ${isOpen ? 'active-open' : ''}`}
        aria-label="Open Learning AI"
        aria-expanded={isOpen}
        title="Open Learning AI Assistant"
      >
        <Sparkles size={16} />
        <span className="floating-ai-btn-text-full">✨ AI Assistant</span>
        <span className="floating-ai-btn-text-short">✨ AI</span>
      </button>
    </>
  );
};
