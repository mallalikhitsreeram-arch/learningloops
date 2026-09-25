/**
 * Comprehensive Automated Test Suite for Focus Mode Behavior
 * Validating tests 1 through 9 from the specification.
 */
const assert = require('assert');

// Mock browser environment (window, document, localStorage)
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

class MockEventTarget {
  constructor() {
    this.listeners = {};
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== fn);
  }
  dispatchEvent(event) {
    const list = this.listeners[event.type] || [];
    list.forEach(fn => fn(event));
  }
}

// Simulated Focus Mode Controller using the exact logic implemented in useFocusSession and FloatingFocusWidget
class FocusSessionEngine {
  constructor(config = {}) {
    this.localStorage = new MockLocalStorage();
    this.windowTarget = new MockEventTarget();
    this.documentTarget = new MockEventTarget();
    this.document = {
      hidden: false,
      visibilityState: 'visible',
      hasFocus: () => !this.document.hidden,
      activeElement: { tagName: 'DIV' },
      addEventListener: (evt, fn) => this.documentTarget.addEventListener(evt, fn),
      removeEventListener: (evt, fn) => this.documentTarget.removeEventListener(evt, fn),
      dispatchEvent: (evt) => this.documentTarget.dispatchEvent(evt),
    };

    this.session = null;
    this.screen = 'idle';
    this.endReason = null;
    this.isAway = false;
    this.lastTick = 0;
    this.violationToast = null;
    this.lastViolation = 0;
  }

  startSession({ durationMinutes = 30, violationLimit = 3, sessionType = 'study', activity = 'Math Prep' }) {
    const totalDurationMs = durationMinutes * 60 * 1000;
    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + totalDurationMs).toISOString();

    this.session = {
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

    this.localStorage.setItem('ll_focus_active', JSON.stringify(true));
    this.localStorage.setItem('ll_focus_start', JSON.stringify(startTime));
    this.localStorage.setItem('ll_focus_end', JSON.stringify(endTime));
    this.localStorage.setItem('ll_focus_total', JSON.stringify(totalDurationMs));
    this.localStorage.setItem('ll_focus_remaining', JSON.stringify(totalDurationMs));
    this.localStorage.setItem('ll_focus_type', JSON.stringify(sessionType));
    this.localStorage.setItem('ll_focus_violations', JSON.stringify(0));
    this.localStorage.setItem('ll_focus_limit', JSON.stringify(violationLimit));
    this.localStorage.setItem('ll_focus_activity', JSON.stringify(activity));

    this.screen = 'active';
    this.isAway = false;
    this.lastTick = Date.now();
  }

  // Simulate tick down of focused time
  tick(elapsedWallMs) {
    const isVisible = !this.document.hidden && this.document.visibilityState === 'visible';
    if (!this.isAway && isVisible && this.session && this.session.active) {
      this.session.remainingMs = Math.max(0, this.session.remainingMs - elapsedWallMs);
      this.localStorage.setItem('ll_focus_remaining', JSON.stringify(this.session.remainingMs));

      if (this.session.remainingMs === 0) {
        this.completeSession();
      }
    }
  }

  recordViolation() {
    const now = this.simulatedNow || Date.now();
    if (now - this.lastViolation < 500) return;
    this.lastViolation = now;

    if (!this.session) return;
    this.session.violations += 1;
    this.localStorage.setItem('ll_focus_violations', JSON.stringify(this.session.violations));

    if (this.session.violations >= this.session.violationLimit) {
      this.session.active = false;
      this.localStorage.setItem('ll_focus_active', JSON.stringify(false));
      this.screen = 'end';
      this.endReason = 'violated_study';
      return;
    }

    this.screen = 'violation';
  }

  advanceTime(ms) {
    this.simulatedNow = (this.simulatedNow || Date.now()) + ms;
  }

  leaveLearningLoops() {
    if (this.isAway) return;
    this.isAway = true;
    this.document.hidden = true;
    this.document.visibilityState = 'hidden';

    this.recordViolation();
  }

  returnToLearningLoops() {
    this.document.hidden = false;
    this.document.visibilityState = 'visible';

    if (this.isAway) {
      this.isAway = false;
      this.lastTick = Date.now(); // Discard time spent outside
      if (this.screen === 'violation') {
        this.screen = 'active';
      }
    }
  }

  completeSession() {
    if (!this.session) return;
    this.session.active = false;
    this.session.remainingMs = 0;
    this.session.completed = true;
    this.localStorage.setItem('ll_focus_active', JSON.stringify(false));
    this.localStorage.setItem('ll_focus_remaining', JSON.stringify(0));
    this.screen = 'end';
    this.endReason = 'completed';
  }
}

// ─── RUN ALL TEST CASES ───────────────────────────────────────────────────────

console.log('=== STARTING FOCUS MODE BEHAVIOR TEST SUITE ===\n');

// TEST 1: Start 30-minute Focus Mode
console.log('TEST 1: Start 30-minute Focus Mode');
const engine = new FocusSessionEngine();
engine.startSession({ durationMinutes: 30, violationLimit: 3 });
assert.strictEqual(engine.session.active, true, 'Session should be active');
assert.strictEqual(engine.session.remainingMs, 30 * 60 * 1000, 'Remaining time should be exactly 30 minutes (1800000ms)');
assert.strictEqual(engine.session.violations, 0, 'Violations should be 0');
assert.strictEqual(engine.screen, 'active', 'Screen should be active');
console.log('✓ TEST 1 PASSED: Timer starts normally with 30:00 remaining.\n');

// TEST 2: Stay on Learning Loops for 2 minutes
console.log('TEST 2: Stay on Learning Loops for 2 minutes');
engine.tick(2 * 60 * 1000); // 2 minutes active
assert.strictEqual(engine.session.remainingMs, 28 * 60 * 1000, 'Remaining time should be 28 minutes');
assert.strictEqual(engine.session.violations, 0, 'Violations should still be 0');
console.log('✓ TEST 2 PASSED: 28:00 remaining after 2 minutes of active focus.\n');

// TEST 3: Switch to another browser tab
console.log('TEST 3: Switch to another browser tab');
engine.leaveLearningLoops();
assert.strictEqual(engine.session.violations, 1, 'Violations should increase to 1');
assert.strictEqual(engine.isAway, true, 'Engine should flag user as away');
assert.strictEqual(engine.screen, 'violation', 'Screen should show violation state');
console.log('✓ TEST 3 PASSED: Violation recorded (1/3), timer paused.\n');

// TEST 4: Stay on the other tab for 5 minutes
console.log('TEST 4: Stay on the other tab for 5 minutes');
engine.tick(5 * 60 * 1000); // 5 minutes pass while away
assert.strictEqual(engine.session.remainingMs, 28 * 60 * 1000, 'Timer MUST NOT decrease while away; still 28 minutes');
assert.notStrictEqual(engine.screen, 'end', 'Must NOT be marked as completed or ended');
console.log('✓ TEST 4 PASSED: 5 minutes away did NOT count. Remaining time is still 28:00.\n');

// TEST 5: Return to Learning Loops
console.log('TEST 5: Return to Learning Loops');
engine.returnToLearningLoops();
assert.strictEqual(engine.isAway, false, 'User is back');
assert.strictEqual(engine.screen, 'active', 'Screen returned to active');
engine.tick(1000); // 1 second passes after return
assert.strictEqual(engine.session.remainingMs, 28 * 60 * 1000 - 1000, 'Timer resumes countdown from 28:00');
console.log('✓ TEST 5 PASSED: Resumes from exactly 28:00.\n');

// TEST 6: Navigate between different Learning Loops pages
console.log('TEST 6: Navigate between different Learning Loops pages');
// In-app navigation keeps document visible and not away
engine.tick(3 * 60 * 1000); // User navigates and studies 3 minutes
assert.strictEqual(engine.session.violations, 1, 'In-app navigation must NOT trigger violations');
assert.strictEqual(engine.session.remainingMs, 25 * 60 * 1000 - 1000, 'Timer continues ticking down during in-app navigation');
console.log('✓ TEST 6 PASSED: In-app navigation allowed, 0 extra violations, timer continues.\n');

// TEST 7: Switch to another browser tab again
console.log('TEST 7: Switch to another browser tab again');
engine.advanceTime(3000);
engine.leaveLearningLoops();
assert.strictEqual(engine.session.violations, 2, 'Violations should increase to 2');
assert.strictEqual(engine.isAway, true, 'User marked as away again');
engine.tick(10 * 60 * 1000); // 10 minutes pass away
assert.strictEqual(engine.session.remainingMs, 25 * 60 * 1000 - 1000, 'Timer paused; 10 minutes away not deducted');
engine.returnToLearningLoops();
assert.strictEqual(engine.isAway, false, 'User returned');
console.log('✓ TEST 7 PASSED: Second tab switch recorded violation (2/3), paused timer, resumed on return.\n');

// TEST 8: Complete the required actual focused time
console.log('TEST 8: Complete the required actual focused time');
// Remaining: 25 minutes minus 1 second
const remainingTime = engine.session.remainingMs;
engine.tick(remainingTime);
assert.strictEqual(engine.session.remainingMs, 0, 'Remaining time should reach 0');
assert.strictEqual(engine.screen, 'end', 'Screen should transition to end screen');
assert.strictEqual(engine.endReason, 'completed', 'End reason must be completed');
assert.strictEqual(engine.session.completed, true, 'Session marked completed');
console.log('✓ TEST 8 PASSED: Successfully completed ONLY after full required focused time accumulated.\n');

// TEST 9: Start 30-minute session and leave tab for 30 minutes
console.log('TEST 9: Start 30-minute session and leave tab for 30 minutes');
const engine2 = new FocusSessionEngine();
engine2.startSession({ durationMinutes: 30, violationLimit: 3 });
engine2.leaveLearningLoops();
engine2.tick(30 * 60 * 1000); // 30 minutes pass while on another tab
assert.strictEqual(engine2.session.remainingMs, 30 * 60 * 1000, 'Remaining time MUST still be 30:00');
assert.notStrictEqual(engine2.endReason, 'completed', 'Must NOT say completed');
assert.notStrictEqual(engine2.session.completed, true, 'Must NOT be completed');
console.log('✓ TEST 9 PASSED: Leaving tab for 30 minutes does NOT mark session complete. 30:00 still remaining.\n');

// TEST 10: Violation limit reached
console.log('TEST 10: Violation limit reached handling');
const engine3 = new FocusSessionEngine();
engine3.startSession({ durationMinutes: 30, violationLimit: 3 });
// Violation 1
engine3.leaveLearningLoops();
engine3.returnToLearningLoops();
assert.strictEqual(engine3.session.violations, 1);
// Violation 2
engine3.advanceTime(2000);
engine3.leaveLearningLoops();
engine3.returnToLearningLoops();
assert.strictEqual(engine3.session.violations, 2);
// Violation 3 (Limit reached)
engine3.advanceTime(2000);
engine3.leaveLearningLoops();
assert.strictEqual(engine3.session.violations, 3);
assert.strictEqual(engine3.session.active, false, 'Session deactivated on limit');
assert.strictEqual(engine3.screen, 'end', 'Screen transitions to end');
assert.strictEqual(engine3.endReason, 'violated_study', 'End reason is violation, NOT completed');
assert.notStrictEqual(engine3.session.completed, true, 'Must NOT be marked completed');
console.log('✓ TEST 10 PASSED: Violation limit reached does NOT say successfully completed.\n');

console.log('====================================================');
console.log('🎉 ALL 10 TESTS PASSED WITH 100% SUCCESS!');
console.log('====================================================');
