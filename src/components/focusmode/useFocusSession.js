import { useState, useEffect, useCallback, useRef } from 'react';

// ─── localStorage keys ────────────────────────────────────────────────────────
const LS = {
  ACTIVE:      'll_focus_active',
  START:       'll_focus_start',
  END:         'll_focus_end',
  TOTAL:       'll_focus_total',
  REMAINING:   'll_focus_remaining',
  TYPE:        'll_focus_type',
  VIOLATIONS:  'll_focus_violations',
  LIMIT:       'll_focus_limit',
  ACTIVITY:    'll_focus_activity',
  SUBMITTED:   'll_focus_submitted',
  HISTORY:     'll_focus_history',
};

const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};
const load = (key, def = null) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : def;
  } catch { return def; }
};
const clear = (keys) => keys.forEach(k => localStorage.removeItem(k));

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useFocusSession = () => {
  // ── Restore from localStorage on mount ──────────────────────────────────────
  const restoreOrDefault = () => {
    const active = load(LS.ACTIVE, false);
    if (!active) return null;

    const totalDurationMs = load(LS.TOTAL, null);
    let remainingMs = load(LS.REMAINING, null);

    // If remainingMs was never saved, calculate fallback
    if (remainingMs === null) {
      const endStr = load(LS.END);
      const startStr = load(LS.START);
      if (endStr && startStr) {
        remainingMs = Math.max(new Date(endStr).getTime() - new Date(startStr).getTime(), 0);
      } else {
        remainingMs = 30 * 60 * 1000;
      }
    }

    // A session is ONLY completed if actual focused time completed (remainingMs <= 0).
    // Wall-clock time elapsed while page/tab was closed or inactive does NOT count!
    if (remainingMs <= 0) {
      const hist = load(LS.HISTORY, []);
      const start = load(LS.START);
      const now = Date.now();
      const durationMs = totalDurationMs || (start ? (now - new Date(start).getTime()) : 0);
      hist.unshift({
        date: new Date(start || now).toLocaleDateString('en-IN'),
        duration: Math.round(durationMs / 60000),
        violations: load(LS.VIOLATIONS, 0),
        type: load(LS.TYPE, 'study'),
        activity: load(LS.ACTIVITY, ''),
        completed: true,
        timestamp: start || new Date().toISOString(),
      });
      save(LS.HISTORY, hist.slice(0, 30));
      clear([LS.ACTIVE, LS.START, LS.END, LS.TOTAL, LS.REMAINING, LS.TYPE, LS.VIOLATIONS, LS.LIMIT, LS.ACTIVITY, LS.SUBMITTED]);
      return null;
    }

    return {
      active: true,
      startTime: load(LS.START),
      endTime: load(LS.END),
      totalDurationMs: totalDurationMs || remainingMs,
      remainingMs,
      sessionType: load(LS.TYPE, 'study'),
      violations: load(LS.VIOLATIONS, 0),
      violationLimit: load(LS.LIMIT, 3),
      activity: load(LS.ACTIVITY, 'Learning Session'),
      submitted: load(LS.SUBMITTED, false),
    };
  };

  const [session, setSession] = useState(restoreOrDefault);

  // derived state
  const [screen, setScreen] = useState(() => {
    const s = restoreOrDefault();
    return s ? 'active' : 'idle'; // 'idle' | 'setup' | 'active' | 'violation' | 'end'
  });
  const [endReason, setEndReason] = useState(null); // 'completed' | 'violated_study' | 'violated_test' | 'manual'
  const lastViolationRef = useRef(0);

  // ── Start a new session ──────────────────────────────────────────────────────
  const startSession = useCallback((config) => {
    const { sessionType, durationMinutes, violationLimit, activity } = config;
    const totalDurationMs = durationMinutes * 60 * 1000;
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + totalDurationMs).toISOString();

    const sess = {
      active: true,
      startTime,
      endTime,
      totalDurationMs,
      remainingMs: totalDurationMs,
      sessionType,
      violations: 0,
      violationLimit,
      activity,
      submitted: false,
    };

    save(LS.ACTIVE, true);
    save(LS.START, startTime);
    save(LS.END, endTime);
    save(LS.TOTAL, totalDurationMs);
    save(LS.REMAINING, totalDurationMs);
    save(LS.TYPE, sessionType);
    save(LS.VIOLATIONS, 0);
    save(LS.LIMIT, violationLimit);
    save(LS.ACTIVITY, activity);
    save(LS.SUBMITTED, false);

    setSession(sess);
    setScreen('active');
  }, []);

  // ── Update Remaining Time (synchronized to localStorage) ─────────────────────
  const updateRemaining = useCallback((newRemainingMs) => {
    save(LS.REMAINING, newRemainingMs);
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, remainingMs: newRemainingMs };
    });
  }, []);

  // ── Record a violation (debounced) ────────────────────────────────────────────
  const recordViolation = useCallback(() => {
    const now = Date.now();
    if (now - lastViolationRef.current < 1500) return; // 1.5-sec debounce
    lastViolationRef.current = now;

    setSession(prev => {
      if (!prev) return prev;
      const newCount = (prev.violations || 0) + 1;
      save(LS.VIOLATIONS, newCount);

      if (newCount >= prev.violationLimit) {
        // Limit reached
        const isTestType = ['mock_test', 'exam', 'practice'].includes(prev.sessionType);
        if (isTestType) {
          save(LS.SUBMITTED, true);
          save(LS.ACTIVE, false);
          setScreen('end');
          setEndReason('violated_test');
          _saveHistory(prev, newCount, false);
          return { ...prev, violations: newCount, submitted: true };
        } else {
          save(LS.ACTIVE, false);
          setScreen('end');
          setEndReason('violated_study');
          _saveHistory(prev, newCount, false);
          return { ...prev, violations: newCount };
        }
      }

      setScreen('violation');
      return { ...prev, violations: newCount };
    });
  }, []);

  // ── Dismiss violation modal — return to active ──────────────────────────────
  const dismissViolation = useCallback(() => {
    setScreen(prev => (prev === 'violation' ? 'active' : prev));
  }, []);

  // ── Timer expired naturally after full actual focused time ───────────────────
  const completeSession = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      save(LS.ACTIVE, false);
      save(LS.REMAINING, 0);
      _saveHistory(prev, prev.violations, true);
      return { ...prev, remainingMs: 0, completed: true };
    });
    setScreen('end');
    setEndReason('completed');
    clear([LS.ACTIVE, LS.START, LS.END, LS.TOTAL, LS.REMAINING, LS.TYPE, LS.VIOLATIONS, LS.LIMIT, LS.ACTIVITY, LS.SUBMITTED]);
  }, []);

  // ── Manual end (abandon) ─────────────────────────────────────────────────────
  const endSession = useCallback((reason = 'manual') => {
    setSession(prev => {
      if (prev) _saveHistory(prev, prev?.violations || 0, false);
      return null;
    });
    save(LS.ACTIVE, false);
    clear([LS.ACTIVE, LS.START, LS.END, LS.TOTAL, LS.REMAINING, LS.TYPE, LS.VIOLATIONS, LS.LIMIT, LS.ACTIVITY, LS.SUBMITTED]);
    setScreen('idle');
    setEndReason(reason);
  }, []);

  // ── Open setup modal ─────────────────────────────────────────────────────────
  const openSetup = useCallback(() => setScreen('setup'), []);
  const closeSetup = useCallback(() => setScreen('idle'), []);

  // ── History ──────────────────────────────────────────────────────────────────
  const getHistory = useCallback(() => load(LS.HISTORY, []), []);

  return {
    session,
    screen,
    endReason,
    startSession,
    updateRemaining,
    recordViolation,
    dismissViolation,
    completeSession,
    endSession,
    openSetup,
    closeSetup,
    getHistory,
  };
};

// ─── Internal helper ──────────────────────────────────────────────────────────
function _saveHistory(sess, violations, completed) {
  try {
    const hist = load(LS.HISTORY, []);
    const totalMs = sess.totalDurationMs || (sess.endTime && sess.startTime ? new Date(sess.endTime) - new Date(sess.startTime) : 0);
    const focusedMs = completed ? totalMs : Math.max(0, totalMs - (sess.remainingMs || 0));
    hist.unshift({
      date: new Date(sess.startTime || Date.now()).toLocaleDateString('en-IN'),
      duration: Math.round(focusedMs / 60000),
      violations,
      type: sess.sessionType,
      activity: sess.activity,
      completed,
      timestamp: sess.startTime || new Date().toISOString(),
    });
    save(LS.HISTORY, hist.slice(0, 30));
  } catch {}
}
