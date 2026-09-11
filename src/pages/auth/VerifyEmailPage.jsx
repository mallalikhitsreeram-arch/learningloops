import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const email = searchParams.get('email') || 'your account email';
  const [code, setCode] = useState('424242'); // Auto-fill demo verification code
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');
    setIsSubmitting(true);

    const res = await verifyEmail(email, code);
    setIsSubmitting(false);

    if (res.success) {
      setMessage('Email verified successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        if (res.role === 'teacher') navigate('/teacher', { replace: true });
        else if (res.role === 'parent') navigate('/parent', { replace: true });
        else navigate('/dashboard', { replace: true });
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Invalid verification code.');
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage('');
    const res = await resendVerification(email);
    setIsResending(false);
    setMessage(res.message || 'Verification code resent! Check your inbox.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '24px 16px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)',
        padding: '36px 32px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-primary-light)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Mail size={28} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          Please verify your email before continuing.
        </h2>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
          We sent a verification code to <strong>{email}</strong>. Please enter the 6-digit code below to unlock your Learning Loop dashboard.
        </p>

        {errorMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: '#FEE2E2',
            color: '#991B1B',
            fontSize: '0.82rem',
            margin: '16px 0',
            textAlign: 'left'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-sage-light)',
            color: 'var(--accent-sage)',
            fontSize: '0.82rem',
            margin: '16px 0',
            textAlign: 'left'
          }}>
            <CheckCircle2 size={16} flexShrink={0} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleVerify} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--accent-sage)', fontWeight: '600', marginBottom: '4px' }}>
              Demo Verification Code: <strong>424242</strong>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="424242"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '0.25em',
                fontWeight: '700'
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
          >
            <span>{isSubmitting ? 'Verifying...' : 'Verify & Continue to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '24px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResend}
            disabled={isResending}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <RefreshCw size={13} className={isResending ? 'spin-animation' : ''} />
            <span>Resend verification email</span>
          </button>

          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <ArrowLeft size={14} /> Return to login
          </Link>
        </div>
      </div>
    </div>
  );
};
