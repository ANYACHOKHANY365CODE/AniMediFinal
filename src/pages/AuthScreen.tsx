import React, { useState } from 'react';
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AlertBox from '../components/AlertBox';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, register, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      if (isLogin) {
        await login(email.trim(), password.trim());
      } else {
        await register(email.trim(), password.trim(), name.trim());
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {error && (
        <AlertBox
          open={!!error}
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Heart size={40} color="#8B5CF6" strokeWidth={2} />
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#8B5CF6',
              marginLeft: '12px',
              fontFamily: 'Nunito'
            }}>
              AniMedi
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            fontFamily: 'Nunito'
          }}>
            Your pet's health companion
          </p>
        </div>

        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '30px'
        }}>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: isLogin ? '#FFFFFF' : 'transparent',
              color: isLogin ? '#8B5CF6' : '#6B7280',
              fontWeight: '600',
              fontFamily: 'Nunito',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isLogin ? '0 2px 8px rgba(139, 92, 246, 0.1)' : 'none'
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: !isLogin ? '#FFFFFF' : 'transparent',
              color: !isLogin ? '#8B5CF6' : '#6B7280',
              fontWeight: '600',
              fontFamily: 'Nunito',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: !isLogin ? '0 2px 8px rgba(139, 92, 246, 0.1)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#374151',
              marginBottom: '8px',
              fontFamily: 'Nunito'
            }}>
              {isLogin ? 'Welcome Back!' : 'Join AniMedi!'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'Nunito'
            }}>
              {isLogin 
                ? 'Sign in to access your pet\'s health records'
                : 'Create an account to start managing your pet\'s health'
              }
            </p>
          </div>

          {!isLogin && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.1)'
            }}>
              <User size={20} color="#8B5CF6" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  flex: 1,
                  marginLeft: '12px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  fontFamily: 'Nunito',
                  color: '#374151',
                  backgroundColor: 'transparent'
                }}
              />
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <Mail size={20} color="#8B5CF6" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                marginLeft: '12px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: 'Nunito',
                color: '#374151',
                backgroundColor: 'transparent'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}>
            <Lock size={20} color="#8B5CF6" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (Minimum 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                flex: 1,
                marginLeft: '12px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: 'Nunito',
                color: '#374151',
                backgroundColor: 'transparent'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: '#fff', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, minHeight: 32 }}
            >
              {showPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-hover"
            style={{
              width: '100%',
              backgroundColor: '#8B5CF6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: 'Nunito',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading 
              ? (isLogin ? 'Signing In...' : 'Creating Account...') 
              : (isLogin ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
