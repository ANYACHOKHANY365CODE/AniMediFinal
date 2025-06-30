import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // The user is already in a temporary authenticated state.
    // We can directly call updateUser.
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (updateError) {
      setError(`Error updating password: ${updateError.message}`);
    } else {
      setSuccess("Your password has been reset successfully! Redirecting to login...");
      setTimeout(() => navigate('/auth'), 3000);
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
      <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
        <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            marginBottom: '16px'
          }}>
          Reset Your Password
        </h1>
        <p style={{
            fontSize: '16px',
            color: '#6B7280',
            fontFamily: 'Nunito',
            marginBottom: '32px'
        }}>
            Enter your new password below.
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}/>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 16px 16px 50px',
                border: '1px solid #D1D5DB',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'Nunito',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
             <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
            </button>
          </div>
          <div style={{ position: 'relative' }}>
          <Lock size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}/>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 16px 16px 50px',
                border: '1px solid #D1D5DB',
                borderRadius: '12px',
                fontSize: '16px',
                fontFamily: 'Nunito',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {error && <p style={{ color: 'red', fontSize: '14px', margin: 0 }}>{error}</p>}
          {success && <p style={{ color: 'green', fontSize: '14px', margin: 0 }}>{success}</p>}

          <button type="submit" disabled={loading} style={{
            backgroundColor: loading ? '#D1D5DB' : '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: 'Nunito',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '16px'
          }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordScreen; 