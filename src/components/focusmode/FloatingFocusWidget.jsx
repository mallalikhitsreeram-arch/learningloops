import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Target, Minimize2, Maximize2, X, AlertTriangle, CheckCircle, Flame, Clock } from 'lucide-react';

const pad = n => String(n).padStart(2, '0');

const formatTime = (ms) => {
  if (ms <= 0) return '00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
};

export const FloatingFocusWidget = ({
  session,
  onViolation,
  onDismissViolation,
  onUpdateRemaining,
  onComplete,
  onEnd
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [violationToast, setViolationToast] = useState(null);

  const totalMs = session?.totalDurationMs || (
    session?.startTime && session?.endTime
      ? Math.max(new Date(session.endTime).getTime() - new Date(session.startTime).getTime(), 1000)
      : 30 * 60 * 1000
  );

  const initialRemaining = session?.remainingMs != null
    ? session.remainingMs
    : (session?.endTime ? Math.max(new Date(session.endTime).getTime() - Date.now(), 0) : totalMs);

  const [remainingMs, setRemainingMs] = useState(initialRemaining);

  const isAwayRef = useRef(false);
  const violationActiveRef = useRef(false);
  const lastTickRef = useRef(Date.now());
  const remainingMsRef = useRef(initialRemaining);

  // Sync remainingMs if session.remainingMs updates externally
  useEffect(() => {
    if (session?.remainingMs != null && Math.abs(session.remainingMs - remainingMsRef.current) > 2000) {
      setRemainingMs(session.remainingMs);
      remainingMsRef.current = session.remainingMs;
    }
  }, [session?.remainingMs]);

  // Calculate elapsed progress percentage based on actual focused time
  const elapsedMs = Math.max(0, totalMs - remainingMs);
  const progressPct = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  // ── 1. Countdown Timer (Actual focused time only) ──────────────────────────
  useEffect(() => {
    lastTickRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      // Only count down if NOT away, page is visible, and document is not hidden
      const isVisible = !document.hidden && document.visibilityState === 'visible';
      if (!isAwayRef.current && isVisible) {
        setRemainingMs(prev => {
          if (prev <= 0) return 0;
          const next = Math.max(0, prev - delta);
          remainingMsRef.current = next;

          if (onUpdateRemaining) {
            onUpdateRemaining(next);
          }

          if (next === 0) {
            onComplete();
          }
          return next;
        });
      }
    };

    const intervalId = setInterval(tick, 500);
    return () => clearInterval(intervalId);
  }, [onComplete, onUpdateRemaining]);

  // ── 2. Tab Switch & Blur Violation Detection ──────────────────────────────────
  const triggerViolation = useCallback(() => {
    if (violationActiveRef.current) return;
    violationActiveRef.current = true;

    onViolation();

    const newViolationCount = (session?.violations || 0) + 1;
    const limit = session?.violationLimit || 3;

    setViolationToast(`⚠️ Tab switch detected! Violations: ${newViolationCount}/${limit}`);
    setTimeout(() => {
      setViolationToast(null);
    }, 3500);

    setTimeout(() => {
      violationActiveRef.current = false;
    }, 2000);
  }, [onViolation, session?.violations, session?.violationLimit]);

  // ── 3. Page Visibility & Window Focus Listeners ───────────────────────────
  useEffect(() => {
    let blurTimeout = null;

    const handleLeave = () => {
      if (isAwayRef.current) return;
      isAwayRef.current = true;

      // Immediately pause timer and register violation
      triggerViolation();
    };

    const handleReturn = () => {
      if (document.hidden || document.visibilityState === 'hidden') return;

      if (isAwayRef.current) {
        isAwayRef.current = false;
        // CRITICAL: Reset last tick timestamp to NOW so all time spent outside is completely discarded
        lastTickRef.current = Date.now();

        if (onDismissViolation) {
          onDismissViolation();
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        handleLeave();
      } else {
        handleReturn();
      }
    };

    const handleWindowBlur = () => {
      blurTimeout = setTimeout(() => {
        // If focus shifted to an iframe inside Learning Loops (e.g. YouTube lesson), stay active
        if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
          return;
        }
        handleLeave();
      }, 60);
    };

    const handleWindowFocus = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      handleReturn();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [triggerViolation, onDismissViolation]);

  const violations = session?.violations || 0;
  const limit = session?.violationLimit || 3;

  return (
    <>
      {/* ── Optional Floating Violation Warning Toast ── */}
      {violationToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          background: '#FFF7ED',
          border: '1.5px solid #F97316',
          color: '#C2410C',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: '0.84rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{violationToast}</span>
        </div>
      )}

      {/* ── Main Floating Focus Widget Container ── */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>

        {/* ── 1. COLLAPSED STATE (Compact Floating Pill) ── */}
        {isCollapsed ? (
          <div
            onClick={() => setIsCollapsed(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 18px',
              borderRadius: '999px',
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--accent-primary)',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.22)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🎯</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: '800',
              fontSize: '0.95rem',
              color: 'var(--accent-primary)',
              letterSpacing: '0.04em'
            }}>
              {formatTime(remainingMs)}
            </span>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              borderLeft: '1px solid var(--border-subtle)',
              paddingLeft: '8px'
            }}>
              Focus
            </span>
          </div>
        ) : (

          /* ── 2. EXPANDED STATE (Detailed Productivity Card) ── */
          <div style={{
            width: '290px',
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--accent-primary)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            animation: 'fadeInUp 0.25s ease'
          }}>
            {/* Widget Header */}
            <div style={{
              padding: '12px 14px',
              background: 'linear-gradient(135deg, var(--accent-primary-light) 0%, var(--bg-surface-subtle) 100%)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1rem' }}>🎯</span>
                <span style={{
                  fontSize: '0.76rem',
                  fontWeight: '800',
                  color: 'var(--accent-primary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase'
                }}>
                  FOCUS MODE
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Minimize button */}
                <button
                  onClick={() => setIsCollapsed(true)}
                  title="Minimize Widget"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Minimize2 size={14} />
                </button>

                {/* Close / End Session button */}
                <button
                  onClick={onEnd}
                  title="End Focus Session"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--radius-xs)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Widget Body */}
            <div style={{ padding: '16px', textAlign: 'center' }}>
              {/* Countdown Timer Display */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '2.1rem',
                fontWeight: '800',
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
                lineHeight: '1.1'
              }}>
                {formatTime(remainingMs)}
              </div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '2px',
                marginBottom: '12px'
              }}>
                REMAINING
              </div>

              {/* Activity Label */}
              {session?.activity && (
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                  marginBottom: '12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {session.activity}
                </div>
              )}

              {/* Metrics Grid (Violations & Progress) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '8px 10px',
                background: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>Violations</div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    color: violations === 0 ? 'var(--accent-green)' : violations >= limit ? 'var(--accent-red)' : 'var(--accent-amber)'
                  }}>
                    {violations}/{limit}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600' }}>Progress</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                    {progressPct}%
                  </div>
                </div>
              </div>

              {/* Progress Bar Fill */}
              <div style={{
                height: '5px',
                width: '100%',
                background: 'var(--border-subtle)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '14px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'var(--accent-primary)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              {/* End Session Button */}
              <button
                onClick={onEnd}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-subtle)',
                  color: 'var(--accent-red)',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent-red-light)';
                  e.currentTarget.style.borderColor = 'var(--accent-red)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-surface-subtle)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                End Session
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
};
