import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePet } from '../contexts/PetContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, isLoading } = useAuth();
  const { pets } = usePet();
  const location = useLocation();

  // Show loading state only during initial load
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 100%)'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#8B5CF6',
          fontFamily: 'Nunito',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div className="loading-spinner" style={{
            width: '30px',
            height: '30px',
            border: '3px solid #E6E6FA',
            borderTop: '3px solid #8B5CF6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '10px'
          }} />
          Loading...
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // If not logged in, redirect to /auth
  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // If logged in but has no pets, only allow /profile-setup
  if (user && (!pets || pets.length === 0)) {
    if (location.pathname !== '/profile-setup') {
      return <Navigate to="/profile-setup" replace />;
    }
  }

  // If not requireAuth and user is logged in, redirect to /medicare
  if (!requireAuth && user) {
    return <Navigate to="/medicare" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 