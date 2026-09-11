import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Award,
  DownloadCloud,
  FileText,
  BarChart3,
  Trophy,
  Scroll,
  Bot,
  Bell,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Users,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Compass,
  Video
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const Sidebar = ({ activeTab, onSelectTab, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();

  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher';
  const isParent = currentUser?.role === 'parent';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {currentUser?.role?.toUpperCase() || 'USER'} PORTAL
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{ padding: '6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)' }}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <ul className="sidebar-nav-list" style={{ overflowY: 'auto' }}>
        {/* STUDENT NAVIGATION (Per Section 18) */}
        {isStudent && (
          <>
            <li>
              <button className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => onSelectTab('dashboard')}>
                <LayoutDashboard size={18} />
                {!isCollapsed && <span>{t('nav_dashboard')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'my_learning' ? 'active' : ''}`} onClick={() => onSelectTab('my_learning')}>
                <BookOpen size={18} color="var(--accent-primary)" />
                {!isCollapsed && <span>{t('nav_my_learning')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => onSelectTab('courses')}>
                <Compass size={18} />
                {!isCollapsed && <span>{t('nav_courses')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'practice' ? 'active' : ''}`} onClick={() => onSelectTab('practice')}>
                <CheckSquare size={18} />
                {!isCollapsed && <span>{t('nav_practice')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => onSelectTab('tests')}>
                <Award size={18} />
                {!isCollapsed && <span>{t('nav_tests')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'biweekly' ? 'active' : ''}`} onClick={() => onSelectTab('biweekly')}>
                <Award size={18} color="var(--accent-amber)" />
                {!isCollapsed && <span>{t('nav_biweekly')}</span>}
              </button>
            </li>
            <li>
              <button
                id="nav-interview-lab-btn"
                className={`nav-item-btn ${activeTab === 'interview_lab' ? 'active' : ''}`}
                onClick={() => onSelectTab('interview_lab')}
              >
                <Video size={18} color="var(--accent-primary)" />
                {!isCollapsed && <span>Interview Lab</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'downloads' ? 'active' : ''}`} onClick={() => onSelectTab('downloads')}>
                <DownloadCloud size={18} color="var(--accent-sage)" />
                {!isCollapsed && <span>{t('nav_downloads')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => onSelectTab('resources')}>
                <FileText size={18} />
                {!isCollapsed && <span>{t('nav_resources')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => onSelectTab('progress')}>
                <BarChart3 size={18} />
                {!isCollapsed && <span>{t('nav_progress')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => onSelectTab('achievements')}>
                <Trophy size={18} color="#D97706" />
                {!isCollapsed && <span>{t('nav_achievements')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'certificates' ? 'active' : ''}`} onClick={() => onSelectTab('certificates')}>
                <Scroll size={18} />
                {!isCollapsed && <span>{t('nav_certificates')}</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => onSelectTab('notifications')}>
                <Bell size={18} />
                {!isCollapsed && <span>{t('nav_notifications')}</span>}
              </button>
            </li>
          </>
        )}

        {/* TEACHER NAVIGATION */}
        {isTeacher && (
          <>
            <li>
              <button className={`nav-item-btn ${activeTab === 'teacher_overview' ? 'active' : ''}`} onClick={() => onSelectTab('teacher_overview')}>
                <GraduationCap size={18} />
                {!isCollapsed && <span>Class Dashboard</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'teacher_test_builder' ? 'active' : ''}`} onClick={() => onSelectTab('teacher_test_builder')}>
                <Award size={18} />
                {!isCollapsed && <span>Test Builder</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'teacher_analytics' ? 'active' : ''}`} onClick={() => onSelectTab('teacher_analytics')}>
                <BarChart3 size={18} />
                {!isCollapsed && <span>Class Analytics</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'teacher_resources' ? 'active' : ''}`} onClick={() => onSelectTab('teacher_resources')}>
                <FileText size={18} />
                {!isCollapsed && <span>Resource Uploads</span>}
              </button>
            </li>
          </>
        )}

        {/* PARENT NAVIGATION */}
        {isParent && (
          <>
            <li>
              <button className={`nav-item-btn ${activeTab === 'parent_dashboard' ? 'active' : ''}`} onClick={() => onSelectTab('parent_dashboard')}>
                <Users size={18} />
                {!isCollapsed && <span>Child Progress</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'parent_calendar' ? 'active' : ''}`} onClick={() => onSelectTab('parent_calendar')}>
                <BarChart3 size={18} />
                {!isCollapsed && <span>Attendance &amp; Calendar</span>}
              </button>
            </li>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <>
            <li>
              <button className={`nav-item-btn ${activeTab === 'admin_overview' ? 'active' : ''}`} onClick={() => onSelectTab('admin_overview')}>
                <LayoutDashboard size={18} color="var(--accent-primary)" />
                {!isCollapsed && <span>Admin Control Center</span>}
              </button>
            </li>
            <li>
              <button className={`nav-item-btn ${activeTab === 'admin_users' ? 'active' : ''}`} onClick={() => onSelectTab('admin_overview')}>
                <Users size={18} color="var(--accent-sage)" />
                {!isCollapsed && <span>User Accounts &amp; Roles</span>}
              </button>
            </li>
          </>
        )}

        {/* Universal Settings */}
        <li>
          <button className={`nav-item-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => onSelectTab('settings')}>
            <Settings size={18} />
            {!isCollapsed && <span>{t('nav_settings')}</span>}
          </button>
        </li>
      </ul>

      {/* Sidebar Footer (Bottom items per Section 18) */}
      <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginBottom: '10px' }}>
          <button
            className={`nav-item-btn ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => onSelectTab('help')}
            style={{ padding: '8px 12px' }}
          >
            <HelpCircle size={17} color="var(--accent-primary)" />
            {!isCollapsed && <span>{t('nav_help')}</span>}
          </button>

          {isStudent && (
            <button
              className={`nav-item-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => onSelectTab('profile')}
              style={{ padding: '8px 12px' }}
            >
              <User size={17} />
              {!isCollapsed && <span>{t('nav_profile')}</span>}
            </button>
          )}

          <button
            className="nav-item-btn"
            onClick={async () => {
              await logout(true);
              navigate('/login', { replace: true });
            }}
            style={{ padding: '8px 12px', color: 'var(--accent-crimson)' }}
            title="Secure Logout (Clear device cache)"
          >
            <LogOut size={17} />
            {!isCollapsed && <span>{t('nav_logout')}</span>}
          </button>
        </div>

        {!isCollapsed && currentUser && (
          <div className="user-profile-card">
            <img
              src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
              alt={currentUser.name}
              className="user-avatar"
            />
            <div className="user-details">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role-badge">{currentUser.role}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
