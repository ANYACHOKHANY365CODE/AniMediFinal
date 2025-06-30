import React, { useEffect, useState } from 'react';
import { Bell, Calendar, Heart, Stethoscope, FileText, Users, ArrowRight, AlertCircle, Star, Clock, MapPin, User, TrendingUp, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../contexts/PetContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type VetBooking, type Reminder } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

const DashboardScreen: React.FC = () => {
  const { activePet, pets, reminders } = usePet();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({ appointments: 0, records: 0 });
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!activePet) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // --- Fetch Daily Tip ---
      try {
        let tipText = '';
        if (activePet) {
          const tipResponse = await fetch('/api/generate-tip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              species: activePet.type,
              petName: activePet.name,
              ownerName: profile?.name || 'the owner'
            })
          });
          const tipData = await tipResponse.json();
          tipText = tipResponse.ok ? tipData.tip : '';
        }
        setDailyTip(tipText || 'Keep your pet hydrated and active!');
      } catch (error) {
        setDailyTip('Keep your pet hydrated and active!');
      }

      // --- Fetch Upcoming Events ---
      try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 15);

        const [bookingsRes, remindersRes, recordsCountRes] = await Promise.all([
            supabase.from('vet_bookings').select('*', { count: 'exact' }).eq('pet_id', activePet.id).gte('appointment_date', today.toISOString()),
            supabase.from('reminders').select('*').eq('pet_id', activePet.id).eq('is_completed', false).gte('due_date', today.toISOString()).lte('due_date', futureDate.toISOString()),
            supabase.from('medical_records').select('*', { count: 'exact', head: true }).eq('pet_id', activePet.id)
        ]);

        const { data: bookings, error: bookingsError } = bookingsRes;
        const { data: reminders, error: remindersError } = remindersRes;
        const { count: recordsCount, error: recordsError } = recordsCountRes;

        if (bookingsError) throw bookingsError;
        if (remindersError) throw remindersError;
        if (recordsError) throw recordsError;
        
        setStatsData({
          appointments: bookings?.length || 0,
          records: recordsCount || 0,
        });

        const combinedEvents = [
            ...(bookings || []).map((a: VetBooking) => ({
                id: a.id,
                type: 'vet',
                title: a.consultation_type,
                subtitle: 'Vet Appointment',
                time: formatDistanceToNow(new Date(`${a.appointment_date}T${a.appointment_time}`), { addSuffix: true }),
                date: new Date(`${a.appointment_date}T${a.appointment_time}`),
                icon: Stethoscope,
                color: '#8B5CF6',
                urgent: new Date(`${a.appointment_date}T${a.appointment_time}`) < new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
            })),
            ...(reminders || []).map((r: Reminder) => ({
                id: r.id,
                type: 'reminder',
                title: r.title,
                subtitle: r.description || 'No description',
                time: formatDistanceToNow(new Date(r.due_date), { addSuffix: true }),
                date: new Date(r.due_date),
                icon: Calendar,
                color: '#F59E0B',
                urgent: new Date(r.due_date) < new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
            }))
        ];

        combinedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
        const now = new Date();
        const futureEvents = combinedEvents.filter(e => e.date > now);
        setUpcomingEvents(futureEvents);

      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        setUpcomingEvents([]);
        setStatsData({ appointments: 0, records: 0 });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [activePet]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
    }
  };

  // Get current time for greeting
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      id: '1',
      title: "Do's and Don'ts",
      description: 'Pet care tips',
      icon: FileText,
      color: '#8B5CF6',
      screen: '/dos-donts',
      gradient: 'from-purple-500 to-indigo-600',
    },
    {
      id: '2',
      title: 'Reminders',
      description: 'Manage reminders',
      icon: Calendar,
      color: '#10B981',
      screen: '/medicare/reminders',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: '3',
      title: 'Health Records',
      description: 'View & upload',
      icon: FileText,
      color: '#F59E0B',
      screen: '/medicare/records',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      id: '4',
      title: 'Healthcare',
      description: 'Nearby facilities',
      icon: Heart,
      color: '#EF4444',
      screen: '/healthcare',
      gradient: 'from-rose-500 to-pink-600',
    },
  ];

  const stats = [
    {
      label: 'Health Score',
      value: activePet && activePet.health_score != null ? `${activePet.health_score}%` : 'N/A',
      icon: Heart,
      color: '#10B981',
      trend: '',
    },
    {
      label: 'Reminders',
      value: reminders.length.toString(),
      icon: Calendar,
      color: '#8B5CF6',
      trend: '',
    },
    {
      label: 'Records',
      value: statsData.records.toString(),
      icon: FileText,
      color: '#F59E0B',
      trend: '',
    },
  ];

  const handleQuickAction = (screen: string) => {
    navigate(screen);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 100%)',
      paddingBottom: '20px'
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
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                margin: 0
              }}
            >
              {getGreeting()},
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                fontSize: '16px',
                color: '#6B7280',
                fontFamily: 'Nunito',
                margin: '4px 0 0 0'
              }}
            >
              {profile?.name || 'User'}
            </motion.p>
          </div>
        </div>
        {/* PWA Install Button */}
        {showInstall && (
          <button
            onClick={handlePWAInstall}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(90deg, #8B5CF6 0%, #10B981 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 28px',
              fontWeight: 800,
              fontSize: '18px',
              fontFamily: 'Nunito',
              margin: '0 auto 24px auto',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.12)',
              transition: 'background 0.2s',
              outline: 'none',
              minWidth: '260px',
              justifyContent: 'center',
            }}
          >
            <Download size={24} />
            <span>Install AniMedi App</span>
          </button>
        )}

        {/* Main Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Pet Card */}
          {activePet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="card-hover"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {activePet.avatar_url ? (
                  <img src={activePet.avatar_url} alt={activePet.name} style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '35px',
                    objectFit: 'cover',
                    marginRight: '20px',
                    border: '3px solid #fff'
                  }}/>
                ) : (
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '35px',
                    backgroundColor: '#E0E7FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    border: '3px solid #fff'
                  }}>
                    <User size={30} color="#8B5CF6" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#374151', margin: 0 }}>{activePet.name}</h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>{activePet.type} - {activePet.breed}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Daily Health Tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="card-hover"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
              marginBottom: '8px',
              marginTop: '-8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <Star size={20} color="#F59E0B" style={{ marginRight: '10px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', margin: 0 }}>
                Daily Health Tip
              </h4>
            </div>
            <p style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Nunito', margin: 0 }}>
              {dailyTip || 'Loading tip...'}
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="card-hover"
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '16px',
                    padding: '20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '20px',
                    backgroundColor: `${stat.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    border: `2px solid ${stat.color}50`
                  }}>
                    <IconComponent size={20} color={stat.color} />
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#374151',
                    fontFamily: 'Nunito',
                    marginBottom: '4px'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontFamily: 'Nunito',
                    marginBottom: '4px'
                  }}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                marginBottom: '16px'
              }}
            >
              Quick Actions
            </motion.h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    onClick={() => handleQuickAction(action.screen)}
                    className="card-hover"
                    style={{
                      background: `linear-gradient(135deg, ${action.color}10, ${action.color}05)`,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '16px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: `1px solid ${action.color}20`,
                      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '25px',
                      backgroundColor: `${action.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      border: `2px solid ${action.color}30`
                    }}>
                      <IconComponent size={24} color={action.color} />
                    </div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#374151',
                      fontFamily: 'Nunito',
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      {action.title}
                    </h4>
                    <p style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontFamily: 'Nunito',
                      margin: 0
                    }}>
                      {action.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}
            >
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                margin: 0
              }}>
                Upcoming Events
              </h2>
              <span
                onClick={() => navigate('/medicare/reminders')}
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#8B5CF6',
                  fontFamily: 'Nunito',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                View All
              </span>
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <p>Loading events...</p>
              ) : upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 4).map((event, index) => {
                  const IconComponent = event.icon;
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
                      className="card-hover"
                      style={{
                        backgroundColor: event.urgent ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
                        border: event.urgent ? '1px solid rgba(239, 68, 68, 0.2)' : 'none'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '20px',
                        backgroundColor: `${event.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        border: `2px solid ${event.color}30`
                      }}>
                        <IconComponent size={20} color={event.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#374151',
                          fontFamily: 'Nunito',
                          margin: 0
                        }}>
                          {event.title}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#6B7280',
                          fontFamily: 'Nunito',
                          marginTop: '2px',
                          margin: 0
                        }}>
                          {event.subtitle}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Clock size={14} color="#6B7280" />
                        <span style={{
                          fontSize: '12px',
                          color: '#6B7280',
                          fontFamily: 'Nunito',
                          fontWeight: '500'
                        }}>
                          {event.time}
                        </span>
                        {event.urgent && (
                          <AlertCircle size={16} color="#EF4444" className="pulse" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p>No upcoming events in the next 15 days.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;