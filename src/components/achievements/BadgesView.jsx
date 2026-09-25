import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Award, Flame, CheckCircle, Zap, BookOpen, Compass, Scroll, Lock, Target, Rocket, Brain, FileText, Star, Calendar, GraduationCap } from 'lucide-react';
import { CertificateModal } from './CertificateModal.jsx';

// ─── Activity Badge Definitions ─────────────────────────────────────────────
// Each badge defines: id, name, emoji, icon, category, description,
// and a `check(data)` function that returns { unlocked, progress }
// based on REAL user activity data.
const ACTIVITY_BADGES = [
  {
    id: 'ab-focus-starter',
    name: 'Focus Starter',
    emoji: '🟢',
    icon: Target,
    iconColor: '#10B981',
    category: 'Focus',
    description: 'Complete your first Focus Mode session.',
    check: (d) => {
      const sessions = d.focusHistory.length;
      return { unlocked: sessions >= 1, progress: Math.min(100, sessions * 100) };
    },
  },
  {
    id: 'ab-focus-streak',
    name: 'Focus Streak',
    emoji: '🔥',
    icon: Flame,
    iconColor: '#F59E0B',
    category: 'Focus',
    description: 'Complete 5 Focus Mode sessions.',
    check: (d) => {
      const completed = d.focusHistory.filter(h => h.completed).length;
      return { unlocked: completed >= 5, progress: Math.min(100, Math.round((completed / 5) * 100)) };
    },
  },
  {
    id: 'ab-first-step',
    name: 'First Step',
    emoji: '🚀',
    icon: Rocket,
    iconColor: '#3B82F6',
    category: 'Milestone',
    description: 'Start your first lesson or learning activity.',
    check: (d) => {
      const hasLearning = d.totalLearningMinutes > 0 || d.coursesCompleted > 0;
      return { unlocked: hasLearning, progress: hasLearning ? 100 : 0 };
    },
  },
  {
    id: 'ab-quick-learner',
    name: 'Quick Learner',
    emoji: '🧠',
    icon: Brain,
    iconColor: '#8B5CF6',
    category: 'Learning',
    description: 'Accumulate 60 minutes of total learning time.',
    check: (d) => {
      const mins = d.totalLearningMinutes;
      return { unlocked: mins >= 60, progress: Math.min(100, Math.round((mins / 60) * 100)) };
    },
  },
  {
    id: 'ab-practice-pro',
    name: 'Practice Pro',
    emoji: '📚',
    icon: BookOpen,
    iconColor: '#10B981',
    category: 'Practice',
    description: 'Solve 50 practice problems.',
    check: (d) => {
      const solved = d.problemsSolved;
      return { unlocked: solved >= 50, progress: Math.min(100, Math.round((solved / 50) * 100)) };
    },
  },
  {
    id: 'ab-test-taker',
    name: 'Test Taker',
    emoji: '📝',
    icon: FileText,
    iconColor: '#06B6D4',
    category: 'Assessment',
    description: 'Complete your first test or exam.',
    check: (d) => {
      const tests = d.testsCompleted;
      return { unlocked: tests >= 1, progress: Math.min(100, tests > 0 ? 100 : 0) };
    },
  },
  {
    id: 'ab-perfect-score',
    name: 'Perfect Score',
    emoji: '💯',
    icon: Star,
    iconColor: '#EAB308',
    category: 'Performance',
    description: 'Score 90% or higher on any test.',
    check: (d) => {
      const score = d.averageTestScore;
      const hasPerfect = score >= 90;
      return { unlocked: hasPerfect, progress: Math.min(100, Math.round((score / 90) * 100)) };
    },
  },
  {
    id: 'ab-getting-serious',
    name: 'Getting Serious',
    emoji: '🎯',
    icon: Target,
    iconColor: '#2563EB',
    category: 'Learning',
    description: 'Accumulate 5 hours of total learning time.',
    check: (d) => {
      const mins = d.totalLearningMinutes;
      return { unlocked: mins >= 300, progress: Math.min(100, Math.round((mins / 300) * 100)) };
    },
  },
  {
    id: 'ab-7day-learner',
    name: '7-Day Learner',
    emoji: '📅',
    icon: Calendar,
    iconColor: '#F05D5E',
    category: 'Consistency',
    description: 'Maintain a 7-day learning streak.',
    check: (d) => {
      const streak = d.currentStreak;
      return { unlocked: streak >= 7, progress: Math.min(100, Math.round((streak / 7) * 100)) };
    },
  },
  {
    id: 'ab-consistency-champion',
    name: 'Consistency Champion',
    emoji: '🏆',
    icon: Trophy,
    iconColor: '#F59E0B',
    category: 'Consistency',
    description: 'Reach a 30-day learning streak.',
    check: (d) => {
      const best = Math.max(d.currentStreak, d.longestStreak);
      return { unlocked: best >= 30, progress: Math.min(100, Math.round((best / 30) * 100)) };
    },
  },
  {
    id: 'ab-course-complete',
    name: 'Course Complete',
    emoji: '🎓',
    icon: GraduationCap,
    iconColor: '#7C3AED',
    category: 'Coursework',
    description: 'Complete your first full course.',
    check: (d) => {
      const completed = d.coursesCompleted;
      return { unlocked: completed >= 1, progress: Math.min(100, completed > 0 ? 100 : 0) };
    },
  },
];

// ─── Load Focus Mode History from localStorage ──────────────────────────────
function loadFocusHistory() {
  try {
    return JSON.parse(localStorage.getItem('ll_focus_history') || '[]');
  } catch {
    return [];
  }
}

export const BadgesView = () => {
  const [apiBadges, setApiBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [hoveredBadge, setHoveredBadge] = useState(null);

  useEffect(() => {
    // Fetch existing badges from the API
    fetch('/api/student/dashboard/usr-student-1')
      .then(res => res.json())
      .then(data => {
        if (data.badges) setApiBadges(data.badges);
        setDashboardData(data);
      })
      .catch(() => {});

    fetch('/api/certificates/usr-student-1')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCertificates(data);
      })
      .catch(() => {});
  }, []);

  // ── Compute activity badges from real data ──────────────────────────────────
  const activityBadges = useMemo(() => {
    const focusHistory = loadFocusHistory();

    // Extract activity data from dashboard API + localStorage focus data
    const activityData = {
      focusHistory,
      totalLearningMinutes:
        dashboardData?.profile?.totalLearningTimeMinutes ??
        dashboardData?.kpis?.totalLearningTimeMinutes ??
        dashboardData?.statistics?.learningTimeMinutes ?? 0,
      problemsSolved:
        dashboardData?.profile?.totalProblemsSolved ??
        dashboardData?.kpis?.totalProblemsSolved ??
        dashboardData?.statistics?.problemsSolved ?? 0,
      coursesCompleted:
        dashboardData?.profile?.coursesCompleted ??
        dashboardData?.kpis?.coursesCompleted ??
        dashboardData?.statistics?.coursesCompleted ?? 0,
      currentStreak:
        dashboardData?.profile?.currentStreak ??
        dashboardData?.kpis?.currentStreak ??
        dashboardData?.statistics?.learningStreak ?? 0,
      longestStreak:
        dashboardData?.profile?.longestStreak ??
        dashboardData?.kpis?.longestStreak ?? 0,
      averageTestScore:
        dashboardData?.profile?.averageTestScore ??
        dashboardData?.kpis?.averageTestScore ??
        dashboardData?.statistics?.averageTestScore ?? 0,
      testsCompleted:
        dashboardData?.recentTests?.length ?? 0,
    };

    return ACTIVITY_BADGES.map(badge => {
      const result = badge.check(activityData);
      return {
        ...badge,
        unlocked: result.unlocked,
        progress: result.progress,
      };
    });
  }, [dashboardData]);

  const totalUnlocked = apiBadges.filter(b => b.unlocked).length + activityBadges.filter(b => b.unlocked).length;
  const totalBadges = apiBadges.length + activityBadges.length;

  const getBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Flame': return <Flame size={20} color="#D97706" />;
      case 'Award': return <Award size={20} color="var(--accent-primary)" />;
      case 'CheckCircle': return <CheckCircle size={20} color="var(--accent-sage)" />;
      case 'Zap': return <Zap size={20} color="#EAB308" />;
      case 'BookOpen': return <BookOpen size={20} color="var(--accent-navy)" />;
      case 'Compass': return <Compass size={20} color="#8B5CF6" />;
      default: return <Trophy size={20} color="var(--accent-amber)" />;
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Existing API Badges Section (Preserved) ── */}
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Achievements &amp; Milestone Badges</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Recognition for consistency, problem solving, course completions, and assessment mastery.
            </p>
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-sage)' }}>
            {totalUnlocked} / {totalBadges} Unlocked
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {apiBadges.map((badge) => (
            <div
              key={badge.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                backgroundColor: badge.unlocked ? 'var(--bg-card)' : 'var(--bg-surface-subtle)',
                opacity: badge.unlocked ? 1 : 0.75,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: '42px', height: '42px',
                borderRadius: 'var(--radius-md)',
                background: badge.unlocked ? 'var(--bg-surface-subtle)' : 'var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {badge.unlocked ? getBadgeIcon(badge.icon) : <Lock size={18} color="var(--text-muted)" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {badge.category}
                  </span>
                  {badge.unlocked && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-sage)', fontWeight: '700' }}>✓ Earned</span>
                  )}
                </div>

                <h4 style={{ fontSize: '0.96rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {badge.name}
                </h4>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                  {badge.description}
                </p>

                {!badge.unlocked && (
                  <div style={{ marginTop: '8px' }}>
                    <div className="progress-track" style={{ height: '5px' }}>
                      <div className="progress-fill" style={{ width: `${badge.progress}%` }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {badge.progress}% completed
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── NEW: Activity Badges Section ── */}
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Activity Badges</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Earned through your real learning activity — Focus Mode, practice, tests, streaks, and course completions.
            </p>
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--accent-primary)' }}>
            {activityBadges.filter(b => b.unlocked).length} / {activityBadges.length} Earned
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {activityBadges.map((badge) => {
            const IconComp = badge.icon;
            const isHovered = hoveredBadge === badge.id;

            return (
              <div
                key={badge.id}
                onMouseEnter={() => setHoveredBadge(badge.id)}
                onMouseLeave={() => setHoveredBadge(null)}
                style={{
                  border: badge.unlocked
                    ? `1.5px solid ${badge.iconColor}40`
                    : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  backgroundColor: badge.unlocked
                    ? 'var(--bg-card)'
                    : 'var(--bg-surface-subtle)',
                  opacity: badge.unlocked ? 1 : 0.6,
                  transition: 'all 0.25s ease',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered && badge.unlocked
                    ? `0 6px 20px ${badge.iconColor}18`
                    : 'none',
                  cursor: 'default',
                }}
              >
                {/* Badge Icon */}
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  background: badge.unlocked
                    ? `${badge.iconColor}15`
                    : 'var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}>
                  {badge.unlocked ? (
                    <>
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        fontSize: '0.9rem',
                        lineHeight: 1,
                      }}>
                        {badge.emoji}
                      </span>
                      <IconComp size={20} color={badge.iconColor} />
                    </>
                  ) : (
                    <Lock size={18} color="var(--text-muted)" />
                  )}
                </div>

                {/* Badge Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      textTransform: 'uppercase',
                      fontWeight: '700',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.04em',
                    }}>
                      {badge.category}
                    </span>
                    {badge.unlocked ? (
                      <span style={{
                        fontSize: '0.68rem',
                        color: badge.iconColor,
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}>
                        <CheckCircle size={12} /> Earned
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}>
                        <Lock size={11} /> Locked
                      </span>
                    )}
                  </div>

                  <h4 style={{
                    fontSize: '0.96rem',
                    fontWeight: '700',
                    color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
                    marginTop: '3px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {badge.unlocked ? badge.emoji : '🔒'} {badge.name}
                  </h4>

                  <p style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2px',
                    lineHeight: '1.4',
                  }}>
                    {badge.description}
                  </p>

                  {/* Progress bar for locked badges */}
                  {!badge.unlocked && (
                    <div style={{ marginTop: '8px' }}>
                      <div className="progress-track" style={{ height: '5px' }}>
                        <div className="progress-fill" style={{
                          width: `${badge.progress}%`,
                          background: badge.iconColor,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginTop: '3px',
                      }}>
                        {badge.progress}% completed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Existing Certificates Section (Preserved) ── */}
      <div className="content-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Official Certificates</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Accredited credentials earned upon completing all lessons and passing final examinations.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {certificates.map((cert) => (
            <div key={cert.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: '700' }}>
                  <Scroll size={14} /> CERTIFIED
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginTop: '4px' }}>{cert.courseTitle}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Issued: {cert.completionDate} • Grade: {cert.score}
                </div>
              </div>

              <button className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.82rem', justifyContent: 'center' }} onClick={() => setActiveCertificate(cert)}>
                View &amp; Print Certificate
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeCertificate && (
        <CertificateModal certificate={activeCertificate} onClose={() => setActiveCertificate(null)} />
      )}
    </div>
  );
};
