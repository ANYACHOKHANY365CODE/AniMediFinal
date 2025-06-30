import React, { useState, useEffect } from 'react';
import { User, Heart, FileText, HelpCircle, LogOut, Edit, ChevronRight, Shield, Info, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { usePet } from '../contexts/PetContext';
import type { PetContextType } from '../contexts/PetContext';
import EditProfileModal from '../components/EditProfileModal';
import PetProfilesModal from '../components/PetProfilesModal';
import PrivacySettingsModal from '../components/PrivacySettingsModal';
import HelpSupportModal from '../components/HelpSupportModal';
import AboutModal from '../components/AboutModal';
import { useNavigate } from 'react-router-dom';
import AlertBox from '../components/AlertBox';

const ProfileScreen: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { pets, activePet, reminders } = usePet();
  const navigate = useNavigate();
  
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPetProfiles, setShowPetProfiles] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [alert, setAlert] = useState<{ open: boolean; type: string; title: string; message: string; onConfirm?: (() => void) | undefined }>({ open: false, type: 'info', title: '', message: '', onConfirm: undefined });
  const [recordCount, setRecordCount] = useState<number>(0);

  const profileOptions = [
    {
      id: '1',
      title: 'About the App',
      description: 'Learn about our mission and version',
      icon: Info,
      color: '#3B82F6',
      action: () => setShowAbout(true),
    },
    {
      id: '2',
      title: 'Security',
      description: 'Manage your password and account data',
      icon: Shield,
      color: '#8B5CF6',
      action: () => setShowPrivacy(true),
    },
    {
      id: '3',
      title: 'Help & Support',
      description: 'Get help and contact support',
      icon: HelpCircle,
      color: '#6B7280',
      action: () => setShowHelp(true),
    },
    {
      id: '4',
      title: 'Logout',
      description: 'Sign out from your account',
      icon: LogOut,
      color: '#EF4444',
      action: () => handleLogout(),
    },
  ];

  const handleLogout = () => {
    setAlert({
      open: true,
      type: 'confirm',
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      onConfirm: () => {
      logout();
        setAlert({ ...alert, open: false });
      }
    });
  };

  useEffect(() => {
    const fetchMedicalRecordCount = async () => {
      if (!activePet?.id) {
        setRecordCount(0);
        return;
      }
      try {
        const supabase = (await import('../lib/supabase')).supabase;
        const { data, error } = await supabase
          .from('medical_records')
          .select('*')
          .eq('pet_id', activePet.id);
        if (error) {
          setRecordCount(0);
        } else {
          setRecordCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (e) {
        setRecordCount(0);
      }
    };
    fetchMedicalRecordCount();
  }, [activePet]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 50%, #FFE5B4 100%)'
    }}>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '60px',
          paddingBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            margin: 0
          }}>
            Profile
          </h1>
        </div>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card-hover"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', marginRight: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '40px',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '40px',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <User size={32} color="#8B5CF6" />
                )}
              </div>
              <div 
                onClick={() => setShowEditProfile(true)}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '28px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <Edit size={16} color="#FFFFFF" />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                margin: 0
              }}>
                {profile?.name || user?.email?.split('@')[0] || 'Pet Owner'}
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                fontFamily: 'Nunito',
                marginTop: '4px',
                margin: 0
              }}>
                {user?.email || 'user@example.com'}
              </p>
              {profile?.location && (
                <p style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  fontFamily: 'Nunito',
                  margin: '8px 0 0 0',
                }}>
                  📍 {profile.location}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Pet Summary */}
        {activePet && activePet.id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card-hover"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                margin: 0
              }}>
                Active Pet
              </h3>
              <div 
                onClick={() => setShowPetProfiles(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#8B5CF6',
                  fontFamily: 'Nunito'
                }}>
                  Manage Pets ({pets.length})
              </span>
                <ChevronRight size={14} color="#8B5CF6" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {activePet.avatar_url ? (
                <img 
                  src={activePet.avatar_url} 
                  alt={activePet.name} 
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '22px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '22px',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {activePet.type === 'dog' ? '🐕' : '🐱'}
                </div>
              )}
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#374151',
                  fontFamily: 'Nunito',
                  margin: 0
                }}>
                  {activePet.name}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  fontFamily: 'Nunito',
                  marginTop: '2px',
                  margin: 0
                }}>
                  {activePet.breed} • {activePet.age} years old
                </p>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={12} color="#6B7280" />
                    <span style={{
                      fontSize: '11px',
                      color: '#6B7280',
                      fontFamily: 'Nunito'
                    }}>
                      {recordCount} records
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} color="#6B7280" />
                    <span style={{
                      fontSize: '11px',
                      color: '#6B7280',
                      fontFamily: 'Nunito'
                    }}>
                      {reminders.length} reminders
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Add Pet Button if no pets exist */}
        {(!pets || pets.length === 0) && (
          <button onClick={() => setShowPetProfiles(true)} style={{ width: '100%', margin: '20px 0', padding: '16px', background: '#8B5CF6', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
            Add a Pet
          </button>
        )}

        {/* Profile Options */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            marginBottom: '16px'
          }}>
            Account Settings
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profileOptions.map((option, index) => {
              const IconComponent = option.icon;
              
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={option.action}
                  className="card-hover"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: `${option.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <IconComponent size={20} color={option.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#374151',
                      fontFamily: 'Nunito',
                      margin: 0
                    }}>
                      {option.title}
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontFamily: 'Nunito',
                      marginTop: '2px',
                      margin: 0
                    }}>
                      {option.description}
                    </p>
                  </div>
                  <ChevronRight size={20} color="#9CA3AF" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
      />
      <PetProfilesModal 
        isOpen={showPetProfiles} 
        onClose={() => setShowPetProfiles(false)} 
      />
      <PrivacySettingsModal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
      />
      <HelpSupportModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <AlertBox
        open={alert.open}
        type={alert.type as any}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, open: false })}
        onConfirm={alert.onConfirm}
      />
    </div>
  );
};

export default ProfileScreen;