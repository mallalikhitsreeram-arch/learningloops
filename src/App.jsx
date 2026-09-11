import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NetworkProvider, useNetwork } from './context/NetworkContext.jsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.jsx';
import { DataSaverProvider } from './context/DataSaverContext.jsx';

import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage.jsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.jsx';
import { StudentOnboardingPage } from './pages/auth/StudentOnboardingPage.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';

import { Navbar } from './components/layout/Navbar.jsx';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { OfflineBanner } from './components/layout/OfflineBanner.jsx';
import { HelpModal } from './components/layout/HelpModal.jsx';

import { KpiCards } from './components/dashboard/KpiCards.jsx';
import { DailyGoalCard } from './components/dashboard/DailyGoalCard.jsx';
import { ActivityCalendar } from './components/dashboard/ActivityCalendar.jsx';
import { ProgressCharts } from './components/dashboard/ProgressCharts.jsx';
import { SmartRecommendations } from './components/dashboard/SmartRecommendations.jsx';

import { CourseList } from './components/courses/CourseList.jsx';
import { CourseDetail } from './components/courses/CourseDetail.jsx';
import { PracticeView } from './components/practice/PracticeView.jsx';
import { TestList } from './components/tests/TestList.jsx';
import { LibraryView } from './components/library/LibraryView.jsx';
import { BadgesView } from './components/achievements/BadgesView.jsx';
import { SettingsView } from './components/settings/SettingsView.jsx';
import { ProfileView } from './components/profile/ProfileView.jsx';
import { InterviewLabView } from './components/interview/InterviewLabView.jsx';
import { OfflineDownloadsView } from './components/downloads/OfflineDownloadsView.jsx';

import { TeacherDashboard } from './components/teacher/TeacherDashboard.jsx';
import { ParentDashboard } from './components/parent/ParentDashboard.jsx';
import { AdminDashboard } from './components/admin/AdminDashboard.jsx';

import { OnboardingModal } from './components/auth/OnboardingModal.jsx';
import { FloatingAiAssistant } from './components/ai/FloatingAiAssistant.jsx';

// Requirement 1 & 6: Root route handler
const RootRedirect = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Loading LEARNING LOOPS...</div>
        </div>
      </div>
    );
  }

  // Unauthenticated user -> immediately show Login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Unverified user -> verify email
  if (currentUser.email_verified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(currentUser.email || '')}`} replace />;
  }

  // Authenticated user -> role dashboard or onboarding
  if (currentUser.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (currentUser.role === 'parent') return <Navigate to="/parent" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  if (currentUser.role === 'student' && currentUser.profileCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

// Protected Application Layout (Navbar + Sidebar + Sub-Routes)
const ProtectedAppLayout = () => {
  const { currentUser, getAuthHeaders, isOnboardingModalOpen, setIsOnboardingModalOpen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLessonContext, setActiveLessonContext] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [practiceTopic, setPracticeTopic] = useState(null);
  const [teacherSubTab, setTeacherSubTab] = useState('teacher_overview');

  // Student dashboard state
  const [dashboardData, setDashboardData] = useState(null);

  // Determine active tab from route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/my-learning') return 'my_learning';
    if (path.startsWith('/courses')) return 'courses';
    if (path.startsWith('/practice')) return 'practice';
    if (path.startsWith('/tests')) return 'tests';
    if (path.startsWith('/biweekly')) return 'biweekly';
    if (path.startsWith('/interview-lab')) return 'interview_lab';
    if (path.startsWith('/downloads')) return 'downloads';
    if (path.startsWith('/resources')) return 'resources';
    if (path.startsWith('/progress')) return 'progress';
    if (path.startsWith('/achievements')) return 'achievements';
    if (path.startsWith('/certificates')) return 'certificates';
    if (path.startsWith('/notifications')) return 'notifications';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/teacher')) return teacherSubTab || 'teacher_overview';
    if (path.startsWith('/parent')) return 'parent_dashboard';
    if (path.startsWith('/admin')) return 'admin_overview';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  const fetchDashboard = () => {
    if (currentUser && currentUser.role === 'student') {
      fetch('/api/student/me/dashboard', {
        headers: getAuthHeaders()
      })
        .then(res => {
          if (!res.ok) return null;
          return res.json();
        })
        .then(data => {
          if (data) setDashboardData(data);
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'student' && currentUser.profileCompleted === false) {
        navigate('/onboarding', { replace: true });
        return;
      }
      fetchDashboard();
    }
  }, [currentUser]);

  const handleTabSelect = (tab) => {
    if (tab === 'ai') {
      setIsAiModalOpen(true);
      return;
    }
    if (tab === 'help') {
      setIsHelpModalOpen(true);
      return;
    }

    setSelectedCourse(null);

    const routeMap = {
      'dashboard': '/dashboard',
      'my_learning': '/my-learning',
      'courses': '/courses',
      'practice': '/practice',
      'tests': '/tests',
      'biweekly': '/biweekly',
      'interview_lab': '/interview-lab',
      'downloads': '/downloads',
      'resources': '/resources',
      'progress': '/progress',
      'achievements': '/achievements',
      'certificates': '/certificates',
      'notifications': '/notifications',
      'settings': '/settings',
      'profile': '/profile',
      'teacher_overview': '/teacher',
      'teacher_classes': '/teacher',
      'teacher_tests': '/teacher',
      'teacher_analytics': '/teacher',
      'teacher_resources': '/teacher',
      'parent_dashboard': '/parent',
      'admin_overview': '/admin'
    };

    if (tab.startsWith('teacher_')) {
      setTeacherSubTab(tab);
    }

    const targetRoute = routeMap[tab] || `/${tab}`;
    navigate(targetRoute);
  };

  const handlePracticeWeakTopic = (topic) => {
    setPracticeTopic(topic);
    setSelectedCourse(null);
    navigate('/practice');
  };

  const handleSearchSelection = (item) => {
    if (item.category === 'courses') {
      fetch(`/api/courses/${item.id}`)
        .then(res => res.json())
        .then(course => {
          setSelectedCourse(course);
          navigate('/courses');
        })
        .catch(() => {
          setSelectedCourse(null);
          navigate('/courses');
        });
    } else if (item.category === 'practice') {
      handlePracticeWeakTopic(item.topic);
    } else if (item.category === 'resources') {
      setSelectedCourse(null);
      navigate('/resources');
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="main-content">
        {/* Top Navbar */}
        <Navbar
          onOpenAi={() => setIsAiModalOpen(true)}
          onSelectSearchResult={handleSearchSelection}
        />

        {/* Persistent Offline Banner */}
        <OfflineBanner
          onGoToDownloads={() => {
            setSelectedCourse(null);
            navigate('/downloads');
          }}
        />

        {/* Page Content */}
        <main className="page-wrapper">
          <Routes>
            {/* STUDENT PROTECTED ROUTES */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="dashboard-grid">
                  {/* Personalized Welcome Banner */}
                  <div className="dashboard-welcome-banner" style={{ marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      Welcome back, {dashboardData?.user?.name ? dashboardData.user.name.split(' ')[0] : (currentUser?.name ? currentUser.name.split(' ')[0] : 'Student')}!
                    </h1>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                      Here is your learning summary for today. Keep up your {dashboardData?.student?.learningStreak || dashboardData?.kpis?.currentStreak || 0}-day streak!
                    </p>
                  </div>
                  <KpiCards kpis={dashboardData?.kpis} student={dashboardData?.student} />
                  <DailyGoalCard
                    dailyGoal={dashboardData?.dailyGoal}
                    onContinueLearning={() => { setSelectedCourse(null); navigate('/courses'); }}
                    onPracticeNow={() => { setSelectedCourse(null); navigate('/practice'); }}
                  />
                  <SmartRecommendations
                    recommendations={dashboardData?.recommendations || []}
                    onAction={(rec) => {
                      if (rec.actionTopic) handlePracticeWeakTopic(rec.actionTopic);
                      else { setSelectedCourse(null); navigate('/courses'); }
                    }}
                  />
                  <ActivityCalendar history={dashboardData?.activityHistory || dashboardData?.activityCalendar || []} />
                  <ProgressCharts topicPerformance={dashboardData?.topicPerformance} onPracticeTopic={handlePracticeWeakTopic} />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/my-learning" element={
              <ProtectedRoute allowedRoles={['student']}>
                {selectedCourse ? (
                  <CourseDetail
                    course={selectedCourse}
                    onBack={() => {
                      setSelectedCourse(null);
                      setActiveLessonContext(null);
                    }}
                    onActiveContextChange={setActiveLessonContext}
                  />
                ) : (
                  <CourseList onSelectCourse={(c) => setSelectedCourse(c)} initialFilter="enrolled" />
                )}
              </ProtectedRoute>
            } />

            <Route path="/courses" element={
              <ProtectedRoute allowedRoles={['student']}>
                {selectedCourse ? (
                  <CourseDetail
                    course={selectedCourse}
                    onBack={() => {
                      setSelectedCourse(null);
                      setActiveLessonContext(null);
                    }}
                    onActiveContextChange={setActiveLessonContext}
                  />
                ) : (
                  <CourseList onSelectCourse={(c) => setSelectedCourse(c)} initialFilter="all" />
                )}
              </ProtectedRoute>
            } />

            <Route path="/practice" element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeView initialTopic={practiceTopic} />
              </ProtectedRoute>
            } />

            <Route path="/tests" element={
              <ProtectedRoute allowedRoles={['student']}>
                <TestList onPracticeWeak={handlePracticeWeakTopic} initialFilter="all" />
              </ProtectedRoute>
            } />

            <Route path="/biweekly" element={
              <ProtectedRoute allowedRoles={['student']}>
                <TestList onPracticeWeak={handlePracticeWeakTopic} initialFilter="biweekly" />
              </ProtectedRoute>
            } />

            <Route path="/interview-lab" element={
              <ProtectedRoute allowedRoles={['student']}>
                <InterviewLabView />
              </ProtectedRoute>
            } />

            <Route path="/downloads" element={
              <ProtectedRoute allowedRoles={['student']}>
                <OfflineDownloadsView
                  selectedCourse={selectedCourse}
                  onSelectCourse={(c) => setSelectedCourse(c)}
                  onBackCourse={() => {
                    setSelectedCourse(null);
                    setActiveLessonContext(null);
                  }}
                  onActiveContextChange={setActiveLessonContext}
                />
              </ProtectedRoute>
            } />

            <Route path="/resources" element={
              <ProtectedRoute allowedRoles={['student']}>
                <LibraryView />
              </ProtectedRoute>
            } />

            <Route path="/progress" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <ProgressCharts />
                  <ActivityCalendar history={dashboardData?.activityHistory || []} />
                </div>
              </ProtectedRoute>
            } />

            <Route path="/achievements" element={
              <ProtectedRoute allowedRoles={['student']}>
                <BadgesView />
              </ProtectedRoute>
            } />

            <Route path="/certificates" element={
              <ProtectedRoute allowedRoles={['student']}>
                <BadgesView />
              </ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute allowedRoles={['student']}>
                <div className="content-card" style={{ maxWidth: '860px', margin: '0 auto' }}>
                  <h2 className="section-title" style={{ marginBottom: '16px' }}>All Notifications &amp; Academic Alerts</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(dashboardData?.notifications || [
                      { id: '1', title: 'Bi-Weekly Assessment Due', desc: 'Bi-Weekly Assessment: C Core & Memory Diagnostics closes in 2 days.', time: '2h ago' },
                      { id: '2', title: 'Daily Streak Safeguard', desc: 'Complete 25m study today to safeguard your 12-day streak.', time: '4h ago' },
                      { id: '3', title: 'Resource Uploaded', desc: 'Prof. Ramanujan uploaded "C Pointer & Memory Guide (PDF)".', time: 'Yesterday' },
                      { id: '4', title: 'Official Certificate Accredited', desc: 'Certificate for Java Core & Enterprise is ready to view & download.', time: '3d ago' }
                    ]).map((n, idx) => (
                      <div key={idx} style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{n.title}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time || 'Recent'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ProfileView />
              </ProtectedRoute>
            } />

            {/* SHARED SETTINGS ROUTE */}
            <Route path="/settings" element={<SettingsView />} />

            {/* TEACHER PROTECTED ROUTE */}
            <Route path="/teacher/*" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard
                  activeTab={teacherSubTab}
                  onSubTabChange={(sub) => setTeacherSubTab(sub)}
                />
              </ProtectedRoute>
            } />

            {/* PARENT PROTECTED ROUTE */}
            <Route path="/parent/*" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard activeTab="parent_dashboard" />
              </ProtectedRoute>
            } />

            {/* ADMIN PROTECTED ROUTE */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Fallback to root redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onFinish={() => {
          setIsOnboardingModalOpen(false);
          fetchDashboard();
        }}
      />

      {/* Global Floating AI Assistant (Pinned to bottom-right across all Student Portal views) */}
      {currentUser?.role === 'student' && (
        <FloatingAiAssistant
          currentPath={location.pathname}
          selectedCourse={selectedCourse}
          activeLessonContext={activeLessonContext}
          isTestActive={location.pathname.startsWith('/tests')}
          onNavigateToPractice={handlePracticeWeakTopic}
          onNavigateToCourse={(course) => {
            setSelectedCourse(course);
            navigate('/courses');
          }}
          onNavigateToInterviewLab={() => {
            setSelectedCourse(null);
            setActiveLessonContext(null);
            navigate('/interview-lab');
          }}
        />
      )}

      {/* Help & FAQ Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NetworkProvider>
          <LanguageProvider>
            <DataSaverProvider>
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* PROTECTED ONBOARDING ROUTE */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <StudentOnboardingPage />
                    </ProtectedRoute>
                  }
                />

                {/* ROOT ROUTE: Opens /login if unauthenticated, or role dashboard if authenticated */}
                <Route path="/" element={<RootRedirect />} />

                {/* PROTECTED ROUTES: All internal pages guarded by ProtectedRoute */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <ProtectedAppLayout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </DataSaverProvider>
          </LanguageProvider>
        </NetworkProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
