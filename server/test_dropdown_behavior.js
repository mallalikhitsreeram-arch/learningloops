import assert from 'assert';

console.log('=====================================================');
console.log('LEARNING LOOPS — HEADER DROPDOWN VERIFICATION SUITE');
console.log('=====================================================\n');

function createNavbarDropdownController() {
  let activeDropdown = null;
  const listeners = {
    mousedown: [],
    keydown: []
  };

  const documentMock = {
    addEventListener: (event, handler) => {
      listeners[event].push(handler);
    },
    removeEventListener: (event, handler) => {
      listeners[event] = listeners[event].filter(h => h !== handler);
    }
  };

  // Mock DOM elements & containers
  const containers = {
    notifications: { id: 'nav-notifications-container', contains: (el) => el?.closest?.('#nav-notifications-container') != null },
    profile: { id: 'nav-profile-container', contains: (el) => el?.closest?.('#nav-profile-container') != null },
    language: { id: 'nav-lang-container', contains: (el) => el?.closest?.('#nav-lang-container') != null },
    network: { id: 'nav-network-container', contains: (el) => el?.closest?.('#nav-network-container') != null },
    search: { id: 'nav-search-container', contains: (el) => el?.closest?.('#nav-search-container') != null }
  };

  const dropdownRefs = {
    notifications: { current: containers.notifications },
    profile: { current: containers.profile },
    language: { current: containers.language },
    network: { current: containers.network },
    search: { current: containers.search },
  };

  let activeCleanup = null;

  function syncEffect() {
    if (activeCleanup) {
      activeCleanup();
      activeCleanup = null;
    }

    if (!activeDropdown) return;

    const currentRef = dropdownRefs[activeDropdown];

    const handleClickOutside = (event) => {
      if (currentRef?.current && !currentRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    documentMock.addEventListener('mousedown', handleClickOutside);
    documentMock.addEventListener('keydown', handleKeyDown);

    activeCleanup = () => {
      documentMock.removeEventListener('mousedown', handleClickOutside);
      documentMock.removeEventListener('keydown', handleKeyDown);
    };
  }

  function setActiveDropdown(val) {
    activeDropdown = val;
    syncEffect();
  }

  function toggleDropdown(name) {
    setActiveDropdown(activeDropdown === name ? null : name);
  }

  function clickOutside(outsideElement) {
    for (const h of [...listeners.mousedown]) {
      h({ target: outsideElement });
    }
  }

  function pressEscape() {
    for (const h of [...listeners.keydown]) {
      h({ key: 'Escape' });
    }
  }

  return {
    get activeDropdown() { return activeDropdown; },
    get isNotificationsOpen() { return activeDropdown === 'notifications'; },
    get isProfileDropdownOpen() { return activeDropdown === 'profile'; },
    get isLangDropdownOpen() { return activeDropdown === 'language'; },
    get isNetworkDropdownOpen() { return activeDropdown === 'network'; },
    get isSearchDropdownOpen() { return activeDropdown === 'search'; },
    toggleDropdown,
    setActiveDropdown,
    clickOutside,
    pressEscape,
    containers
  };
}

// Elements mock helper
function makeElement(id, parentId = null) {
  return {
    id,
    closest: (selector) => {
      if (selector === `#${id}`) return true;
      if (parentId && selector === `#${parentId}`) return true;
      return null;
    }
  };
}

const notifBtn = makeElement('nav-notifications-btn', 'nav-notifications-container');
const notifDropdownInside = makeElement('nav-mark-all-read-btn', 'nav-notifications-container');
const profileBtn = makeElement('nav-profile-btn', 'nav-profile-container');
const profileDropdownInside = makeElement('nav-student-portal-btn', 'nav-profile-container');
const langBtn = makeElement('nav-lang-btn', 'nav-lang-container');
const networkBtn = makeElement('nav-network-btn', 'nav-network-container');
const dashboardArea = makeElement('dashboard-main-area');

let passCount = 0;
function testPass(desc) {
  passCount++;
  console.log(`  ✓ ${desc}`);
}

// ==========================================
// TEST 1: Click Notifications
// ==========================================
console.log('--- TEST 1: Click Notifications ---');
const nav = createNavbarDropdownController();
assert.strictEqual(nav.activeDropdown, null);
assert.strictEqual(nav.isNotificationsOpen, false);
assert.strictEqual(nav.isProfileDropdownOpen, false);

nav.toggleDropdown('notifications');
assert.strictEqual(nav.activeDropdown, 'notifications');
assert.strictEqual(nav.isNotificationsOpen, true, 'Notifications must be OPEN');
assert.strictEqual(nav.isProfileDropdownOpen, false, 'Profile must be CLOSED');
testPass('TEST 1: Notifications opens, Profile is closed');

// ==========================================
// TEST 2: With Notifications open, click Profile
// ==========================================
console.log('\n--- TEST 2: With Notifications open, click Profile ---');
nav.toggleDropdown('profile');
assert.strictEqual(nav.activeDropdown, 'profile');
assert.strictEqual(nav.isNotificationsOpen, false, 'Notifications must be CLOSED');
assert.strictEqual(nav.isProfileDropdownOpen, true, 'Profile must be OPEN');
testPass('TEST 2: Notifications closes, Profile opens');

// ==========================================
// TEST 3: With Profile open, click Notifications
// ==========================================
console.log('\n--- TEST 3: With Profile open, click Notifications ---');
nav.toggleDropdown('notifications');
assert.strictEqual(nav.activeDropdown, 'notifications');
assert.strictEqual(nav.isNotificationsOpen, true, 'Notifications must be OPEN');
assert.strictEqual(nav.isProfileDropdownOpen, false, 'Profile must be CLOSED');
testPass('TEST 3: Profile closes, Notifications opens');

// ==========================================
// TEST 4: Click the currently open dropdown button again
// ==========================================
console.log('\n--- TEST 4: Click currently open dropdown button again ---');
nav.toggleDropdown('notifications');
assert.strictEqual(nav.activeDropdown, null, 'Active dropdown must be null');
assert.strictEqual(nav.isNotificationsOpen, false, 'Notifications must be CLOSED');
assert.strictEqual(nav.isProfileDropdownOpen, false, 'Profile must be CLOSED');
testPass('TEST 4: Open dropdown toggles to closed on second click');

// ==========================================
// TEST 5: Open Notifications -> click dashboard outside
// ==========================================
console.log('\n--- TEST 5: Open Notifications -> click dashboard outside ---');
nav.toggleDropdown('notifications');
assert.strictEqual(nav.isNotificationsOpen, true);
// Click inside should NOT close
nav.clickOutside(notifDropdownInside);
assert.strictEqual(nav.isNotificationsOpen, true, 'Click inside notifications must NOT close dropdown');
testPass('Inside click preserves Notifications open state');
// Click outside on dashboard area
nav.clickOutside(dashboardArea);
assert.strictEqual(nav.activeDropdown, null, 'Active dropdown must become null on outside click');
assert.strictEqual(nav.isNotificationsOpen, false, 'Notifications must CLOSE on outside click');
testPass('TEST 5: Outside click closes Notifications dropdown');

// ==========================================
// TEST 6: Open Profile -> click dashboard outside
// ==========================================
console.log('\n--- TEST 6: Open Profile -> click dashboard outside ---');
nav.toggleDropdown('profile');
assert.strictEqual(nav.isProfileDropdownOpen, true);
// Click inside Profile dropdown
nav.clickOutside(profileDropdownInside);
assert.strictEqual(nav.isProfileDropdownOpen, true, 'Click inside profile must NOT close dropdown');
testPass('Inside click preserves Profile open state');
// Click outside on dashboard area
nav.clickOutside(dashboardArea);
assert.strictEqual(nav.activeDropdown, null);
assert.strictEqual(nav.isProfileDropdownOpen, false, 'Profile must CLOSE on outside click');
testPass('TEST 6: Outside click closes Profile dropdown');

// ==========================================
// TEST 7: Open any dropdown -> press ESC
// ==========================================
console.log('\n--- TEST 7: Open dropdown -> press ESC ---');
nav.toggleDropdown('notifications');
assert.strictEqual(nav.isNotificationsOpen, true);
nav.pressEscape();
assert.strictEqual(nav.activeDropdown, null);
assert.strictEqual(nav.isNotificationsOpen, false, 'ESC must close Notifications');
testPass('ESC closes Notifications');

nav.toggleDropdown('profile');
assert.strictEqual(nav.isProfileDropdownOpen, true);
nav.pressEscape();
assert.strictEqual(nav.activeDropdown, null);
assert.strictEqual(nav.isProfileDropdownOpen, false, 'ESC must close Profile');
testPass('ESC closes Profile');

nav.toggleDropdown('language');
assert.strictEqual(nav.isLangDropdownOpen, true);
nav.pressEscape();
assert.strictEqual(nav.activeDropdown, null);
assert.strictEqual(nav.isLangDropdownOpen, false, 'ESC must close Language');
testPass('ESC closes Language');

nav.toggleDropdown('network');
assert.strictEqual(nav.isNetworkDropdownOpen, true);
nav.pressEscape();
assert.strictEqual(nav.activeDropdown, null);
assert.strictEqual(nav.isNetworkDropdownOpen, false, 'ESC must close Network');
testPass('TEST 7: ESC closes any open dropdown');

// ==========================================
// TEST 8: Rapidly switch between dropdowns
// ==========================================
console.log('\n--- TEST 8: Rapidly switch between Notifications and Profile ---');
const sequence = ['notifications', 'profile', 'notifications', 'profile', 'notifications', 'language', 'network', 'profile'];
for (let i = 0; i < sequence.length; i++) {
  const target = sequence[i];
  nav.toggleDropdown(target);
  assert.strictEqual(nav.activeDropdown, target);
  
  // Mutual exclusivity invariant:
  const openCount = [
    nav.isNotificationsOpen,
    nav.isProfileDropdownOpen,
    nav.isLangDropdownOpen,
    nav.isNetworkDropdownOpen,
    nav.isSearchDropdownOpen
  ].filter(Boolean).length;

  assert.strictEqual(openCount, 1, `Exactly ONE dropdown can be open at step ${i}, got ${openCount}`);
  assert.strictEqual(!(nav.isNotificationsOpen && nav.isProfileDropdownOpen), true, 'Notifications and Profile can NEVER be simultaneously open');
}
testPass('TEST 8: Rapid switching guarantees strict mutual exclusivity (never two open simultaneously)');

console.log('\n=====================================================');
console.log(`ALL TESTS PASSED: ${passCount}/${passCount} checks verified successfully!`);
console.log('=====================================================\n');
