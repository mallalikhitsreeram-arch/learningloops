import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-subtle)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Verifying LEARNING LOOPS session...
          </div>
        </div>
      </div>
    );
  }

  // Requirement 2: Protected route gateway - unauthenticated visitors go to /login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Requirement 5: If account is unverified, block access to any protected dashboard
  if (currentUser.email_verified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(currentUser.email || '')}`} replace />;
  }

  // Role authorization: if route is restricted to specific roles
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else if (currentUser.role === 'parent') {
      return <Navigate to="/parent" replace />;
    } else if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};
