import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Camera, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AlertBox from './AlertBox';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          avatar_url: formData.avatar_url,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Replace alert() with AlertBox for error and success messages
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, avatar_url: e.target?.result as string });
      };
      reader.readAsDataURL(file);
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
            Edit Profile
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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Avatar Upload */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer'
              }}>
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={40} color="#8B5CF6" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                color: '#8B5CF6',
                fontSize: '14px',
                fontFamily: 'Nunito'
              }}>
                <Camera size={16} />
                Change Photo
              </div>
            </div>

            <div>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                fontFamily: 'Nunito',
                marginBottom: '8px',
                display: 'block'
              }}>
                Full Name *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #E5E7EB'
              }}>
                <User size={20} color="#6B7280" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  style={{
                    flex: 1,
                    marginLeft: '12px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                fontFamily: 'Nunito',
                marginBottom: '8px',
                display: 'block'
              }}>
                Email
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #E5E7EB'
              }}>
                <Mail size={20} color="#9CA3AF" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{
                    flex: 1,
                    marginLeft: '12px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    backgroundColor: 'transparent',
                    color: '#9CA3AF'
                  }}
                />
              </div>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                fontFamily: 'Nunito',
                marginTop: '4px',
                margin: 0
              }}>
                Email cannot be changed
              </p>
            </div>

            <div>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                fontFamily: 'Nunito',
                marginBottom: '8px',
                display: 'block'
              }}>
                Phone Number
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #E5E7EB'
              }}>
                <Phone size={20} color="#6B7280" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  style={{
                    flex: 1,
                    marginLeft: '12px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                fontFamily: 'Nunito',
                marginBottom: '8px',
                display: 'block'
              }}>
                Location
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #E5E7EB'
              }}>
                <MapPin size={20} color="#6B7280" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter your location"
                  style={{
                    flex: 1,
                    marginLeft: '12px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#9CA3AF' : '#8B5CF6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                fontFamily: 'Nunito',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;