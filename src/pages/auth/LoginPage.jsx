import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Shield,
  Check,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated, login, loginWithOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Check query param for pre-selected role
  const searchParams = new URLSearchParams(location.search);
  const urlRole = searchParams.get('role');
  const VALID_ROLES = ['student', 'teacher', 'parent'];

  const initialRole = VALID_ROLES.includes(urlRole) ? urlRole : 'student';
  const hasUrlRole = VALID_ROLES.includes(urlRole);

  // STEP 1 = Role Selection (3 cards across full page), STEP 2 = Authentication Form
  // ALWAYS initialize to Step 1 (the 1st page) every time the user visits
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Desktop / Mobile Preview Control ('desktop' | 'mobile')
  const [previewMode, setPreviewMode] = useState('desktop');

  // Login Method switch: 'credentials', 'phone'
  const [authMethod, setAuthMethod] = useState('credentials');

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone OTP
  const [phone, setPhone] = useState('+91 98765 43210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Feedback & Loading
  const [errorMessage, setErrorMessage] = useState('');
  const [roleMismatch, setRoleMismatch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectAfterLogin = (user) => {
    const role = user?.role || selectedRole;
    const isProfileDone = user?.profileCompleted !== false;

    if (role === 'student') {
      if (!isProfileDone) {
        navigate('/onboarding', { replace: true });
        return;
      }
      navigate('/dashboard', { replace: true });
      return;
    }

    if (role === 'teacher') {
      navigate('/teacher', { replace: true });
      return;
    }

    if (role === 'parent') {
      navigate('/parent', { replace: true });
      return;
    }

    if (role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setErrorMessage('');
    setRoleMismatch(false);
    setStep(2);
  };

  const handleMethodChange = (method) => {
    setAuthMethod(method);
    setErrorMessage('');
    setRoleMismatch(false);
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setRoleMismatch(false);

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({
        email: trimmedEmail,
        password,
        rememberMe,
        role: selectedRole
      });

      setIsSubmitting(false);

      if (res.unverified) {
        navigate(`/verify-email?email=${encodeURIComponent(res.email || trimmedEmail)}`);
        return;
      }

      if (res.success) {
        redirectAfterLogin(res.user);
      } else {
        setRoleMismatch(Boolean(res.roleMismatch));
        setErrorMessage(res.error || 'Email or password is incorrect.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Unable to connect to authentication service. Please check your network.');
    }
  };

  const handleSendOtp = async () => {
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        setErrorMessage(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMessage('Failed to send OTP. Please try again.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setRoleMismatch(false);

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginWithOtp({
        phone: phone.trim(),
        otp: otp.trim(),
        rememberMe,
        role: selectedRole
      });

      setIsSubmitting(false);

      if (res.unverified) {
        navigate(`/verify-email?email=${encodeURIComponent(res.email)}`);
        return;
      }

      if (res.success) {
        redirectAfterLogin(res.user);
      } else {
        setRoleMismatch(Boolean(res.roleMismatch));
        setErrorMessage(res.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Failed to verify OTP. Please try again.');
    }
  };

  // Role metadata helper
  const getRoleInfo = (r) => {
    switch (r) {
      case 'teacher':
        return {
          title: 'Teacher',
          icon: '👨‍🏫',
          desc: 'Lesson creation, test authoring & student analytics',
          accent: 'var(--accent-green)',
          bgLight: 'var(--accent-green-light)',
          badgeText: 'Educator & Faculty'
        };
      case 'parent':
        return {
          title: 'Parent',
          icon: '🧑',
          desc: 'Student activity monitoring & progress tracking',
          accent: 'var(--accent-amber)',
          bgLight: 'var(--accent-amber-light)',
          badgeText: 'Guardian & Parent'
        };
      case 'student':
      default:
        return {
          title: 'Student',
          icon: '🎓',
          desc: 'Interactive courses, adaptive tests & AI tutor',
          accent: 'var(--accent-primary)',
          bgLight: 'var(--accent-primary-light)',
          badgeText: 'Learner & Student'
        };
    }
  };

  const currentRoleInfo = getRoleInfo(selectedRole);

  // Layout container max-width depending on step and previewMode
  const containerMaxWidth = previewMode === 'mobile'
    ? '390px'
    : (step === 1 ? '1080px' : '520px');

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '32px 20px',
      boxSizing: 'border-box'
    }}>
      {/* ── Top Bar: Preview Mode Toggle & Theme Switcher ── */}
      <div style={{
        maxWidth: containerMaxWidth,
        width: '100%',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        transition: 'all 0.3s ease'
      }}>
        {/* Desktop / Mobile Preview Control */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setPreviewMode('desktop')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: previewMode === 'desktop' ? '700' : '600',
              background: previewMode === 'desktop' ? 'var(--accent-primary-light)' : 'transparent',
              color: previewMode === 'desktop' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🖥 Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('mobile')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: previewMode === 'mobile' ? '700' : '600',
              background: previewMode === 'mobile' ? 'var(--accent-primary-light)' : 'transparent',
              color: previewMode === 'mobile' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📱 Mobile</span>
          </button>
        </div>

        {/* Theme Toggle Button */}
        <button
          id="login-theme-toggle-btn"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{ width: '36px', height: '36px' }}
        >
          {theme === 'dark'
            ? <Sun size={16} style={{ color: '#FAAD30' }} />
            : <Moon size={16} />
          }
        </button>
      </div>

      {/* ── Main Container Card ── */}
      <div style={{
        maxWidth: containerMaxWidth,
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: previewMode === 'mobile' ? '28px' : 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: previewMode === 'mobile'
          ? '0 12px 32px rgba(0, 0, 0, 0.18)'
          : 'var(--shadow-lg)',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>

        {/* Brand Header */}
        <div style={{
          padding: previewMode === 'mobile' ? '24px 20px 20px' : '36px 40px 24px',
          textAlign: 'center',
          background: 'linear-gradient(180deg, var(--bg-surface-subtle) 0%, var(--bg-surface) 100%)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Logo */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1E2022',
            color: '#FFFFFF',
            marginBottom: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 12a5 5 0 0 1 5-5 5 5 0 0 1 5 5 5 5 0 0 1-5 5H4" />
              <path d="M4 14l-3-3 3-3" />
              <path d="M17 12a5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5h8" />
              <path d="M20 10l3 3-3 3" />
            </svg>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: previewMode === 'mobile' ? '1.6rem' : '2.1rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: '1.2'
          }}>
            LEARNING LOOPS
          </h1>

          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            fontSize: '0.74rem',
            fontWeight: '700',
            letterSpacing: '0.06em',
            color: 'var(--accent-primary)',
            textTransform: 'uppercase',
            backgroundColor: 'var(--accent-primary-light)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)'
          }}>
            WHERE YOUR EVERY CONTRIBUTION COUNTS
          </div>
        </div>

        {/* ── Content Area ── */}
        <div style={{ padding: previewMode === 'mobile' ? '20px 20px 28px' : '36px 40px 36px' }}>

          {/* ================================================================
              STEP 1: ROLE SELECTION — 3 PROMINENT HORIZONTAL CARDS ON DESKTOP
             ================================================================ */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: previewMode === 'mobile' ? '1.3rem' : '1.65rem',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  marginBottom: '8px'
                }}>
                  Select Your Learning Loops Portal
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                  Choose your account type below to proceed directly to secure sign in.
                </p>
              </div>

              {/* THREE ROLE CARDS (Student, Teacher, Parent ONLY) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: previewMode === 'mobile' ? '1fr' : 'repeat(3, 1fr)',
                gap: '20px',
                marginBottom: '16px'
              }}>

                {/* CARD 1: Student */}
                <div
                  id="role-card-student"
                  onClick={() => handleSelectRole('student')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px 22px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(43, 108, 176, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Badge & Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: 'var(--accent-primary)',
                        backgroundColor: 'var(--accent-primary-light)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Student Portal
                      </span>
                      <span style={{ fontSize: '2rem', lineHeight: '1' }}>🎓</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Student
                    </h3>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                      Personalized learning paths, interactive syllabus courses, adaptive testing, and AI study assistant.
                    </p>

                    {/* Capabilities list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {[
                        'Interactive video & text lessons',
                        'Adaptive practice & test builder',
                        'Gamified XP, streaks & certificates'
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Check size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'var(--accent-primary)',
                      color: '#FFFFFF',
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Continue as Student</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* CARD 2: Teacher */}
                <div
                  id="role-card-teacher"
                  onClick={() => handleSelectRole('teacher')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px 22px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-green)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(46, 125, 50, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Badge & Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: 'var(--accent-green)',
                        backgroundColor: 'var(--accent-green-light)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Teacher Portal
                      </span>
                      <span style={{ fontSize: '2rem', lineHeight: '1' }}>👨‍🏫</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Teacher
                    </h3>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                      AI lesson planning, test authoring, classroom diagnostics, and student performance tracking.
                    </p>

                    {/* Capabilities list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {[
                        'AI-assisted lesson & quiz builder',
                        'Classroom performance diagnostics',
                        'Curriculum & resource distribution'
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Check size={14} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'var(--accent-green)',
                      color: '#FFFFFF',
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Continue as Teacher</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* CARD 3: Parent */}
                <div
                  id="role-card-parent"
                  onClick={() => handleSelectRole('parent')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px 22px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-amber)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    {/* Badge & Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: 'var(--accent-amber)',
                        backgroundColor: 'var(--accent-amber-light)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        Parent Portal
                      </span>
                      <span style={{ fontSize: '2rem', lineHeight: '1' }}>🧑</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Parent
                    </h3>

                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                      Real-time visibility into student academic progress, attendance, and learning activity.
                    </p>

                    {/* Capabilities list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {[
                        'Student progress & subject metrics',
                        'Study time & attendance visibility',
                        'Homework & assessment alerts'
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <Check size={14} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'var(--accent-amber)',
                      color: '#FFFFFF',
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Continue as Parent</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ================================================================
              STEP 2: AUTHENTICATION SCREEN
             ================================================================ */}
          {step === 2 && (
            <div>
              {/* Locked Role Indicator + "← Change Role" */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: currentRoleInfo.bgLight,
                border: `1px solid ${currentRoleInfo.accent}40`,
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{currentRoleInfo.icon}</span>
                  <div>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: currentRoleInfo.accent,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase'
                    }}>
                      Signing in as {currentRoleInfo.title}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {currentRoleInfo.desc}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setStep(1); setErrorMessage(''); setRoleMismatch(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentRoleInfo.accent,
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ← Change Role
                </button>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Sign in to Learning Loops
                </p>
              </div>

              {/* Authentication Method Tabs: Email & Password | Phone + OTP */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '4px',
                background: 'var(--bg-surface-subtle)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px'
              }}>
                <button
                  type="button"
                  id="tab-credentials-btn"
                  style={{
                    padding: '8px 0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: authMethod === 'credentials' ? '700' : '600',
                    background: authMethod === 'credentials' ? 'var(--bg-surface)' : 'transparent',
                    color: authMethod === 'credentials' ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: authMethod === 'credentials' ? 'var(--shadow-sm)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handleMethodChange('credentials')}
                >
                  Email &amp; Password
                </button>

                <button
                  type="button"
                  id="tab-phone-btn"
                  style={{
                    padding: '8px 0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: authMethod === 'phone' ? '700' : '600',
                    background: authMethod === 'phone' ? 'var(--bg-surface)' : 'transparent',
                    color: authMethod === 'phone' ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: authMethod === 'phone' ? 'var(--shadow-sm)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => handleMethodChange('phone')}
                >
                  Phone + OTP
                </button>
              </div>

              {/* Error Alert Banner */}
              {errorMessage && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: roleMismatch ? '#FFF7ED' : '#FEE2E2',
                  color: roleMismatch ? '#C2410C' : '#991B1B',
                  border: `1px solid ${roleMismatch ? '#FED7AA' : '#FECACA'}`,
                  fontSize: '0.82rem',
                  lineHeight: '1.4',
                  marginBottom: '16px'
                }}>
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: '700', marginBottom: '2px' }}>
                      {roleMismatch ? 'Portal Role Mismatch' : 'Authentication Notice'}
                    </div>
                    <div>{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* 1. EMAIL & PASSWORD LOGIN FORM */}
              {authMethod === 'credentials' && (
                <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label htmlFor="login-email-input" style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="email"
                        required
                        id="login-email-input"
                        placeholder={
                          selectedRole === 'student'
                            ? 'STU1001 or likhit.malla@example.edu'
                            : selectedRole === 'teacher'
                            ? 'ramanujan@loops-college.edu'
                            : 'rajesh.sharma@example.com'
                        }
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrorMessage(''); }}
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 38px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.15s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label htmlFor="login-password-input" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                        Password
                      </label>
                      <Link to="/forgot-password" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                        Forgot password?
                      </Link>
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        id="login-password-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorMessage(''); }}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 38px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.88rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'border-color 0.15s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          color: 'var(--text-muted)',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        id="login-remember-me"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span>Remember me on this device</span>
                    </label>
                  </div>

                  {/* Sign in Button */}
                  <button
                    type="submit"
                    id="sign-in-btn"
                    className="btn-primary"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px 16px',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      marginTop: '4px',
                      opacity: isSubmitting ? 0.75 : 1,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                        <span>Signing you in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in to Learning Loops →</span>
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>
                      Create Account / Register
                    </Link>
                  </div>
                </form>
              )}

              {/* 2. PHONE + OTP AUTH */}
              {authMethod === 'phone' && (
                <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label htmlFor="login-phone-input" style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                      Mobile Phone Number
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          id="login-phone-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px 10px 38px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        id="send-otp-btn"
                        className="btn-secondary"
                        onClick={handleSendOtp}
                        style={{ fontSize: '0.82rem', whiteSpace: 'nowrap', padding: '0 14px' }}
                      >
                        {otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--accent-sage)', fontWeight: '600', marginBottom: '6px' }}>
                        OTP request sent. Enter the code received on your mobile.
                      </div>
                      <input
                        type="text"
                        required
                        id="login-otp-input"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '1rem',
                          letterSpacing: '0.2em',
                          textAlign: 'center',
                          fontWeight: '700',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    id="sign-in-otp-btn"
                    className="btn-primary"
                    disabled={!otpSent || isSubmitting}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px 16px',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      opacity: (!otpSent || isSubmitting) ? 0.75 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                        <span>Signing you in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in to Learning Loops →</span>
                      </>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>
                      Create Account / Register
                    </Link>
                  </div>
                </form>
              )}

              {/* 3. CONTINUE WITH GOOGLE */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or continue with</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                </div>

                <button
                  type="button"
                  id="google-signin-btn"
                  disabled
                  title="Google sign-in requires Google OAuth setup"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.86rem',
                    fontWeight: '600',
                    cursor: 'not-allowed',
                    opacity: 0.65
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>(setup required)</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── Footer: Subtle Discreet Admin Portal Link ── */}
        <div style={{
          padding: '14px 20px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.78rem'
        }}>
          <Link
            to="/admin-login"
            style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Shield size={13} />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
