import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, RefreshCw, CheckCircle2, AlertCircle, Globe, ChevronDown, User, LogOut, Bell, BookOpen, CheckSquare, FileText, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNetwork } from '../../context/NetworkContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const Navbar = ({ onOpenAi, onSelectSearchResult }) => {
  const navigate = useNavigate();
  const { currentUser, switchRole, logout, setIsLoginModalOpen } = useAuth();
  const { networkMode, setMode, isEffectiveOnline, pendingCount, syncStatus, lastSyncTime, triggerSync } = useNetwork();
  const { lang, setLang, t } = useLanguage();

  // Single active dropdown state: null | 'notifications' | 'profile' | 'language' | 'network' | 'search'
  const [activeDropdown, setActiveDropdown] = useState(null);

  const isNetworkDropdownOpen = activeDropdown === 'network';
  const isLangDropdownOpen = activeDropdown === 'language';
  const isProfileDropdownOpen = activeDropdown === 'profile';
  const isNotificationsOpen = activeDropdown === 'notifications';
  const isSearchDropdownOpen = activeDropdown === 'search';

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => (prev === name ? null : name));
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Refs for outside click detection
  const searchRef = useRef(null);
  const networkRef = useRef(null);
  const notificationsRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    if (!activeDropdown) return;

    const dropdownRefs = {
      notifications: notificationsRef,
      profile: profileRef,
      language: langRef,
      network: networkRef,
      search: searchRef,
    };

    const handleClickOutside = (event) => {
      const currentRef = dropdownRefs[activeDropdown];
      if (currentRef?.current && !currentRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDropdown]);

  // Demo notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Bi-Weekly Assessment Due',
      desc: 'Bi-Weekly Assessment: C Core & Memory Diagnostics closes in 2 days.',
      time: '2h ago',
      type: 'test',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Daily Streak Safeguard',
      desc: 'You have 25m left to complete your daily target and extend your 12-day streak.',
      time: '4h ago',
      type: 'streak',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'Faculty Announcement',
      desc: 'Prof. Ramanujan uploaded "C Memory & Pointer Guide" (Compressed PDF).',
      time: 'Yesterday',
      type: 'resource',
      unread: true
    },
    {
      id: 'notif-4',
      title: 'Certificate Ready',
      desc: 'Official Certificate for Java Core & Enterprise is accredited and available.',
      time: '3d ago',
      type: 'certificate',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Search indexing
  const searchableIndex = [
    { title: 'C Programming', type: 'Course', category: 'courses', id: 'crs-c-lang' },
    { title: 'C++ Object-Oriented Programming', type: 'Course', category: 'courses', id: 'crs-cpp' },
    { title: 'Java Core & Enterprise', type: 'Course', category: 'courses', id: 'crs-java' },
    { title: 'Python Fundamentals & Scripting', type: 'Course', category: 'courses', id: 'crs-python' },
    { title: 'HTML & CSS Responsive Design', type: 'Course', category: 'courses', id: 'crs-html-css' },
    { title: 'JavaScript Modern ES6+ & Async', type: 'Course', category: 'courses', id: 'crs-javascript' },
    { title: 'SQL Database Design & Queries', type: 'Course', category: 'courses', id: 'crs-sql' },
    { title: 'Data Structures & Algorithms', type: 'Course', category: 'courses', id: 'crs-dsa' },
    { title: 'Full-Stack Web Development', type: 'Course', category: 'courses', id: 'crs-webdev' },
    { title: 'Introduction to Artificial Intelligence', type: 'Course', category: 'courses', id: 'crs-ai' },
    { title: 'Pointers & Dynamic Memory', type: 'Practice Topic', category: 'practice', topic: 'Pointers' },
    { title: 'Loops & Branching', type: 'Practice Topic', category: 'practice', topic: 'Loops' },
    { title: 'Arrays & Matrices', type: 'Practice Topic', category: 'practice', topic: 'Arrays' },
    { title: 'Functions & Call Stack', type: 'Practice Topic', category: 'practice', topic: 'Functions' },
    { title: 'CSS Flexbox & Responsive Layouts', type: 'Practice Topic', category: 'practice', topic: 'Flexbox' },
    { title: 'Async JS & Promises', type: 'Practice Topic', category: 'practice', topic: 'Async JS' },
    { title: 'C Pointers Quick Pocket Reference', type: 'Library Note', category: 'resources', id: 'res-c-pointers' },
    { title: 'HTML5 & CSS3 Cheatsheet', type: 'Library Note', category: 'resources', id: 'res-html-cheatsheet' }
  ];

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      if (activeDropdown === 'search') {
        setActiveDropdown(null);
      }
      return;
    }

    const q = val.toLowerCase();
    const matched = searchableIndex.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      (item.topic && item.topic.toLowerCase().includes(q))
    );
    setSearchResults(matched.slice(0, 6));
    setActiveDropdown('search');
  };

  const handleSelectSearch = (item) => {
    setActiveDropdown(null);
    setSearchQuery('');
    if (onSelectSearchResult) {
      onSelectSearchResult(item);
    }
  };

  return (
    <header className="navbar">
      {/* Brand & Tagline */}
      <div className="navbar-left">
        <div className="brand-badge">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
              <path d="M4 14l-3-3 3-3" />
              <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
              <path d="M20 10l3 3-3 3" />
            </svg>
          </div>
          <span>LEARNING LOOPS</span>
        </div>
        <span className="brand-tagline-sub" title="Platform philosophy">
          EVERY CONTRIBUTION COUNTS
        </span>
      </div>

      {/* Global Interactive Search */}
      <div className="navbar-center" ref={searchRef} style={{ position: 'relative' }}>
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            placeholder="Search courses, lessons, topics, practice..."
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setActiveDropdown('search'); }}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setActiveDropdown(null); }} style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Floating Search Results Dropdown */}
        {isSearchDropdownOpen && searchResults.length > 0 && (
          <div id="nav-search-dropdown" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            marginTop: '4px',
            zIndex: 60,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '6px 12px', background: 'var(--bg-surface-subtle)', fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Quick Suggestions
            </div>
            {searchResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectSearch(item)}
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.category === 'courses' && <BookOpen size={16} color="var(--accent-primary)" />}
                  {item.category === 'practice' && <CheckSquare size={16} color="var(--accent-sage)" />}
                  {item.category === 'resources' && <FileText size={16} color="var(--accent-navy)" />}
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.86rem', color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.type}</div>
                  </div>
                </div>
                <ArrowRight size={14} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connectivity, Sync, Streak & Profile */}
      <div className="navbar-right">
        {/* Network Mode Simulator & Real Indicator */}
        <div ref={networkRef} style={{ position: 'relative' }}>
          <button
            id="nav-network-btn"
            className="network-selector-pill"
            onClick={() => toggleDropdown('network')}
            title="Toggle network simulation (Online / Weak 2G / Offline)"
          >
            <span className={`status-dot ${networkMode}`} />
            <span>
              {networkMode === 'online' && 'ONLINE'}
              {networkMode === 'weak2g' && 'WEAK 2G'}
              {networkMode === 'offline' && 'OFFLINE'}
            </span>
            <ChevronDown size={14} />
          </button>

          {isNetworkDropdownOpen && (
            <div id="nav-network-dropdown" style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: '#fff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '6px',
              minWidth: '180px',
              zIndex: 50
            }}>
              <button
                style={{ width: '100%', padding: '8px 10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', borderRadius: '4px' }}
                onClick={() => { setMode('online'); setActiveDropdown(null); }}
              >
                <span className="status-dot online" /> 🟢 Online (Broadband)
              </button>
              <button
                style={{ width: '100%', padding: '8px 10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', borderRadius: '4px' }}
                onClick={() => { setMode('weak2g'); setActiveDropdown(null); }}
              >
                <span className="status-dot weak2g" /> 🟡 Weak 2G / Data Saver
              </button>
              <button
                style={{ width: '100%', padding: '8px 10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', borderRadius: '4px' }}
                onClick={() => { setMode('offline'); setActiveDropdown(null); }}
              >
                <span className="status-dot offline" /> 🔴 Disconnect / Offline Mode
              </button>
            </div>
          )}
        </div>

        {/* Sync Status Badge */}
        <div
          className={`sync-badge ${syncStatus}`}
          onClick={() => triggerSync(currentUser.id)}
          title={`Last sync: ${lastSyncTime}. Click to trigger sync now.`}
          style={{ cursor: 'pointer' }}
        >
          {syncStatus === 'syncing' ? (
            <>
              <RefreshCw size={13} className="spin-animation" />
              <span>{t('sync_syncing')}</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <AlertCircle size={13} />
              <span>{pendingCount} {t('sync_pending')}</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={13} />
              <span>{t('sync_synced')}</span>
            </>
          )}
        </div>

        {/* Streak Pill */}
        {currentUser.role === 'student' && (
          <div className="streak-pill" title="12-Day Active Learning Streak">
            <Flame size={15} color="#D97706" />
            <span>12 DAYS</span>
          </div>
        )}

        {/* Notifications Bell Dropdown */}
        <div ref={notificationsRef} style={{ position: 'relative' }}>
          <button
            id="nav-notifications-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => toggleDropdown('notifications')}
            title="Notifications & Reminders"
          >
            <Bell size={16} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: '700',
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div id="nav-notifications-dropdown" style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              background: '#fff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              width: '320px',
              zIndex: 55,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.86rem' }}>Notifications ({unreadCount} unread)</span>
                {unreadCount > 0 && (
                  <button id="nav-mark-all-read-btn" onClick={markAllRead} style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: n.unread ? 'var(--bg-surface-subtle)' : '#fff'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--text-primary)' }}>{n.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            id="nav-lang-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              fontWeight: '600',
              background: 'var(--bg-surface-subtle)'
            }}
            onClick={() => toggleDropdown('language')}
          >
            <Globe size={14} />
            <span>{lang === 'en' ? 'EN' : lang === 'te' ? 'తెలుగు' : 'हिन्दी'}</span>
          </button>

          {isLangDropdownOpen && (
            <div id="nav-lang-dropdown" style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: '#fff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '4px',
              minWidth: '120px',
              zIndex: 50
            }}>
              <button
                style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: lang === 'en' ? '700' : '400' }}
                onClick={() => { setLang('en'); setActiveDropdown(null); }}
              >
                English
              </button>
              <button
                style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: lang === 'te' ? '700' : '400' }}
                onClick={() => { setLang('te'); setActiveDropdown(null); }}
              >
                తెలుగు (Telugu)
              </button>
              <button
                style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: lang === 'hi' ? '700' : '400' }}
                onClick={() => { setLang('hi'); setActiveDropdown(null); }}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          )}
        </div>

        {/* User Role Switcher & Profile */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            id="nav-profile-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => toggleDropdown('profile')}
          >
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={currentUser?.name || 'User'}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
            />
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {isProfileDropdownOpen && currentUser && (
            <div id="nav-profile-dropdown" style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              background: '#fff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px',
              minWidth: '220px',
              zIndex: 50
            }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                <div style={{ fontWeight: '600', fontSize: '0.86rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Role: {currentUser.role?.toUpperCase()}</div>
              </div>

              {/* Role-Restricted Portal Link */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 10px', textTransform: 'uppercase', fontWeight: '700' }}>
                Portal:
              </div>

              {currentUser.role === 'student' && (
                <button
                  id="nav-student-portal-btn"
                  style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)' }}
                  onClick={() => {
                    setActiveDropdown(null);
                    navigate('/dashboard');
                  }}
                >
                  🎒 Student Portal
                </button>
              )}

              {currentUser.role === 'teacher' && (
                <button
                  id="nav-teacher-portal-btn"
                  style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)' }}
                  onClick={() => {
                    setActiveDropdown(null);
                    navigate('/teacher');
                  }}
                >
                  👨‍🏫 Teacher Portal
                </button>
              )}

              {currentUser.role === 'parent' && (
                <button
                  id="nav-parent-portal-btn"
                  style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)' }}
                  onClick={() => {
                    setActiveDropdown(null);
                    navigate('/parent');
                  }}
                >
                  👨‍👧 Parent Portal
                </button>
              )}

              {currentUser.role === 'admin' && (
                <button
                  id="nav-admin-portal-btn"
                  style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-primary)' }}
                  onClick={() => {
                    setActiveDropdown(null);
                    navigate('/admin');
                  }}
                >
                  🛡️ Admin Portal
                </button>
              )}

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                <button
                  style={{ width: '100%', padding: '6px 10px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--accent-crimson)', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={async () => {
                    setActiveDropdown(null);
                    await logout(true);
                    navigate('/login', { replace: true });
                  }}
                >
                  <LogOut size={13} /> {t('nav_logout')} (Clear Device)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
