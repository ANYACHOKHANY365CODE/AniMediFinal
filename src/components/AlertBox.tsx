import React from 'react';

interface AlertBoxProps {
  open: boolean;
  type?: 'error' | 'success' | 'info' | 'confirm';
  title?: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const colors = {
  error: '#EF4444',
  success: '#10B981',
  info: '#3B82F6',
  confirm: '#8B5CF6',
};

const AlertBox: React.FC<AlertBoxProps> = ({
  open,
  type = 'info',
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        minWidth: 320,
        maxWidth: 400,
        padding: 32,
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        borderTop: `6px solid ${colors[type]}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {title && <h3 style={{ color: colors[type], fontWeight: 700, marginBottom: 12 }}>{title}</h3>}
        <div style={{ color: '#374151', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>{message}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {type === 'confirm' && (
            <button
              onClick={onClose}
              style={{
                background: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            style={{
              background: colors[type],
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBox; 