import React, { useState } from 'react';
import { X, Lock, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AlertBox from '../components/AlertBox';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: 'info' as 'info' | 'error' | 'success' | 'confirm', title: '', message: '', onConfirm: undefined as (() => void) | undefined });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleResetPassword = async () => {
    if (!user) {
      setAlert({ open: true, type: 'error', title: 'Not logged in', message: 'You must be logged in to reset your password.', onConfirm: undefined });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setAlert({ open: true, type: 'error', title: 'Error', message: 'Error sending password reset email: ' + error.message, onConfirm: undefined });
    } else {
      setAlert({ open: true, type: 'success', title: 'Email Sent', message: 'A password reset link has been sent to your email.', onConfirm: undefined });
    onClose();
    }
  };

  const handleAccountDeletion = async () => {
    setConfirmDelete(true);
  };

  const confirmAccountDeletion = async () => {
    setConfirmDelete(false);
    setAlert({ open: true, type: 'info', title: 'Deleting Account', message: 'Deleting your account...', onConfirm: undefined });
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session. Please log in again.');
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account.');
      }
      setAlert({ open: true, type: 'success', title: 'Deleted', message: 'Account deleted successfully.', onConfirm: undefined });
      await logout();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setAlert({ open: true, type: 'error', title: 'Error', message: errorMessage, onConfirm: undefined });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            margin: 0
          }}>
            Security
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: '#F3F4F6',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} color="#374151" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Account Security */}
          <div>
            <div style={{
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <Lock size={18} color="#6B7280" style={{ marginRight: '12px' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'Nunito'
                }}>
                  Password
                </span>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                fontFamily: 'Nunito',
                  margin: 0,
                  paddingLeft: '30px'
              }}>
                  Reset your account password
              </p>
              </div>
              <button onClick={handleResetPassword} style={{
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: 'Nunito',
                cursor: 'pointer'
              }}>
                Reset Password
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#EF4444',
              fontFamily: 'Nunito',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={18}/> Danger Zone
            </h3>
            
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
               <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <Trash2 size={18} color="#EF4444" style={{ marginRight: '12px' }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'Nunito'
                }}>
                    Delete Account
                </span>
              </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontFamily: 'Nunito',
                  margin: 0,
                  paddingLeft: '30px'
                }}>
                  Permanently delete your account
                </p>
              </div>
              <button id="logout-btn-privacy" onClick={handleAccountDeletion} disabled={isDeleting} style={{
                backgroundColor: isDeleting ? '#F87171' : '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: '600',
                fontFamily: 'Nunito',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
              }}>
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            </div>
          </div>
        </div>
      </motion.div>
      <AlertBox open={alert.open} type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ ...alert, open: false })} onConfirm={alert.onConfirm} />
      {confirmDelete && (
        <AlertBox open={true} type="confirm" title="Confirm Deletion" message="Are you sure you want to delete your account? This action cannot be undone." onClose={() => setConfirmDelete(false)} onConfirm={confirmAccountDeletion} />
      )}
    </div>
  );
};

export default PrivacySettingsModal;