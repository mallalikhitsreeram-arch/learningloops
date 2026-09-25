import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, ShieldCheck, Award } from 'lucide-react';

export const FocusCompletionModal = ({ session, endReason, onClose }) => {
  const isViolated = endReason === 'violated_study' || endReason === 'violated_test';
  const isTestViolated = endReason === 'violated_test';

  const totalDurationMs = session?.totalDurationMs || (
    session?.startTime && session?.endTime
      ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
      : 30 * 60 * 1000
  );
  const durationMinutes = Math.max(1, Math.round(totalDurationMs / 60000));

  const remainingMs = session?.remainingMs ?? 0;
  const elapsedMs = isViolated ? Math.max(0, totalDurationMs - remainingMs) : totalDurationMs;
  const focusedMinutes = Math.max(0, Math.round(elapsedMs / 60000));
  const progressPct = isViolated
    ? Math.min(99, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)))
    : 100;

  const violations = session?.violations || 0;
  const limit = session?.violationLimit || 3;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '420px', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header Banner */}
        <div style={{
          padding: '24px 20px',
          textAlign: 'center',
          background: isViolated
            ? 'linear-gradient(180deg, rgba(239, 68, 68, 0.15) 0%, var(--bg-surface) 100%)'
            : 'linear-gradient(180deg, var(--accent-green-light) 0%, var(--bg-surface) 100%)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isViolated ? 'var(--accent-red, #EF4444)' : 'var(--accent-green)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: isViolated
              ? '0 4px 14px rgba(239, 68, 68, 0.3)'
              : '0 4px 14px rgba(16, 185, 129, 0.3)'
          }}>
            {isViolated ? <AlertTriangle size={30} /> : <CheckCircle2 size={32} />}
          </div>

          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>
            {isViolated ? '⚠️ Violation Limit Reached' : '🎉 Focus Session Complete'}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            {isViolated
              ? (isTestViolated ? 'Your test session has been submitted automatically.' : 'Interruption limit reached. Stay consistent next time!')
              : 'Great job! You stayed focused during your study session.'}
          </p>
        </div>

        {/* Modal Stats Body */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Time</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                {isViolated ? `${focusedMinutes}m` : `${durationMinutes}m`}
              </div>
            </div>

            <div style={{
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Violations</div>
              <div style={{
                fontSize: '0.95rem',
                fontWeight: '800',
                color: violations === 0 ? 'var(--accent-green)' : 'var(--accent-amber)',
                marginTop: '2px'
              }}>
                {violations}/{limit}
              </div>
            </div>

            <div style={{
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>Progress</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '2px' }}>
                {progressPct}%
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px 16px',
              fontSize: '0.9rem',
              fontWeight: '700'
            }}
          >
            {isViolated ? 'Close' : 'Close & Continue Learning'}
          </button>
        </div>
      </div>
    </div>
  );
};
