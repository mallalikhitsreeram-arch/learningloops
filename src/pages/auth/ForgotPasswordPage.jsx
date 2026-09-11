import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const ForgotPasswordPage = () => {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1: enter email, 2: enter code & new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('424242');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendInstructions = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    const res = await forgotPassword(email);
    setIsSubmitting(false);

    if (res.success) {
      setMessage(res.message);
      setStep(2);
    } else {
      setErrorMessage(res.error || 'Failed to send reset code.');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    const res = await resetPassword(email, code, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      setMessage(res.message);
      setStep(3); // Success
    } else {
      setErrorMessage(res.error || 'Failed to reset password.');
    }
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
        padding: '36px 32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#1E2022',
            color: '#fff',
            marginBottom: '12px'
          }}>
            <KeyRound size={24} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '800' }}>
            Reset Password
          </h2>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Recover access to your Learning Loops account.
          </p>
        </div>

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
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMessage}</span>
          </div>
        )}

        {message && step !== 3 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-sage-light)',
            color: 'var(--accent-sage)',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            <CheckCircle2 size={16} flexShrink={0} />
            <span>{message}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendInstructions} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Account Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="aarav.sharma@example.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
            >
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Instructions'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                Verification Code (Demo: 424242)
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.9rem', textAlign: 'center', letterSpacing: '0.15em' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
                New Password (min 6 characters)
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
            >
              <span>{isSubmitting ? 'Updating...' : 'Set New Password'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-sage-light)', color: 'var(--accent-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Password Reset Complete!</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '20px' }}>
              Your password has been successfully updated. You can now log in.
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>
              Proceed to Login
            </Link>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
