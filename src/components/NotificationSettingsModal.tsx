import React, { useState } from 'react';
import { X, Bell, Mail, MessageCircle, Calendar, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import AlertBox from '../components/AlertBox';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    reminderNotifications: true,
    appointmentNotifications: true,
    healthTipsNotifications: true,
    marketingNotifications: false,
    emergencyNotifications: true
  });

  const [alert, setAlert] = useState({ open: false, type: 'info' as 'info' | 'error' | 'success' | 'confirm', title: '', message: '', onConfirm: undefined as (() => void) | undefined });

  const handleSave = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    setAlert({ open: true, type: 'success', title: 'Saved', message: 'Notification settings saved successfully!', onConfirm: undefined });
    onClose();
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
          maxHeight: '80vh',
          overflowY: 'auto'
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
            Notification Settings
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
          {/* Notification Methods */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              fontFamily: 'Nunito',
              marginBottom: '12px'
            }}>
              Notification Methods
            </h3>
            
            {[
              { key: 'emailNotifications', label: 'Email Notifications', icon: Mail, description: 'Receive notifications via email' },
              { key: 'pushNotifications', label: 'Push Notifications', icon: Bell, description: 'Browser and app notifications' },
              { key: 'smsNotifications', label: 'SMS Notifications', icon: MessageCircle, description: 'Text message notifications' }
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <IconComponent size={20} color="#6B7280" style={{ marginRight: '12px' }} />
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        fontFamily: 'Nunito',
                        margin: 0
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        fontFamily: 'Nunito',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '24px'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof typeof settings]}
                      onChange={() => toggleSetting(item.key as keyof typeof settings)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings[item.key as keyof typeof settings] ? '#8B5CF6' : '#CBD5E1',
                      borderRadius: '24px',
                        transition: '0.3s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: settings[item.key as keyof typeof settings] ? '23px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s'
                      }} />
                    </span>
                  </label>
                </div>
              );
            })}
          </div>

          {/* Notification Types */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              fontFamily: 'Nunito',
              marginBottom: '12px'
            }}>
              Notification Types
            </h3>
            
            {[
              { key: 'reminderNotifications', label: 'Health Reminders', icon: Calendar, description: 'Vaccination and medication reminders' },
              { key: 'appointmentNotifications', label: 'Appointments', icon: Calendar, description: 'Vet appointment confirmations and updates' },
              { key: 'healthTipsNotifications', label: 'Health Tips', icon: Heart, description: 'Weekly pet care tips and advice' },
              { key: 'emergencyNotifications', label: 'Emergency Alerts', icon: Bell, description: 'Critical health and safety alerts' },
              { key: 'marketingNotifications', label: 'Promotions', icon: Mail, description: 'Special offers and new features' }
            ].map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <IconComponent size={20} color="#6B7280" style={{ marginRight: '12px' }} />
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        fontFamily: 'Nunito',
                        margin: 0
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#6B7280',
                        fontFamily: 'Nunito',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <label style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '44px',
                    height: '24px'
                  }}>
                    <input
                      type="checkbox"
                      checked={settings[item.key as keyof typeof settings]}
                      onChange={() => toggleSetting(item.key as keyof typeof settings)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: settings[item.key as keyof typeof settings] ? '#8B5CF6' : '#CBD5E1',
                      borderRadius: '24px',
                      transition: '0.3s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: settings[item.key as keyof typeof settings] ? '23px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        transition: '0.3s'
                      }} />
                    </span>
                  </label>
                </div>
              );
            })}
          </div>

          <button
            id="save-btn-notifications"
            onClick={handleSave}
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
              cursor: 'pointer'
            }}
          >
            Save Settings
          </button>
        </div>
      </motion.div>
      <AlertBox open={alert.open} type={alert.type} title={alert.title} message={alert.message} onClose={() => setAlert({ ...alert, open: false })} onConfirm={alert.onConfirm} />
    </div>
  );
};

export default NotificationSettingsModal;