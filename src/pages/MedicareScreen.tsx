import React, { useEffect, useState } from 'react';
import { Video, BookOpen, FileText, Bell, ChevronRight, Calendar, Heart, Stethoscope, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePet } from '../contexts/PetContext';
import { supabase, type VetBooking, type Reminder } from '../lib/supabase';

const medicareOptions = [
  {
    id: '2',
    title: 'Pet Care Guide',
    description: 'Essential dos and don\'ts for your pet',
    icon: BookOpen,
    color: '#10B981',
    route: '/medicare/pet-care-guide',
    features: ['Species Specific', 'Health Tips', 'Emergency Guide'],
  },
  {
    id: '3',
    title: 'Medical Records',
    description: 'Store and manage health documents',
    icon: FileText,
    color: '#F59E0B',
    route: '/medicare/records',
    features: ['OCR Scanning', 'Cloud Storage', 'Easy Access'],
  },
  {
    id: '4',
    title: 'Health Reminders',
    description: 'Never miss important appointments',
    icon: Bell,
    color: '#EF4444',
    route: '/medicare/reminders',
    features: ['Custom Alerts', 'Vaccination Schedule', 'Medication Tracking'],
  },
];

const MedicareScreen: React.FC = () => {
  const { activePet } = usePet();
  const [stats, setStats] = useState({ records: 0, upcoming: 0, consultations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicareData = async () => {
      if (!activePet) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
        const today = new Date().toISOString();

        const [recordsRes, upcomingBookingsRes, upcomingRemindersRes, pastBookingsRes] = await Promise.all([
          supabase.from('medical_records').select('*', { count: 'exact', head: true }).eq('pet_id', activePet.id),
          supabase.from('vet_bookings').select('*', { count: 'exact', head: true }).eq('pet_id', activePet.id).gte('appointment_date', today),
          supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('pet_id', activePet.id).eq('is_completed', false).gte('due_date', today),
          supabase.from('vet_bookings').select('*', { count: 'exact', head: true }).eq('pet_id', activePet.id).lt('appointment_date', today),
        ]);

        const { count: recordsCount, error: recordsError } = recordsRes;
        const { count: upcomingBookingsCount, error: upcomingBookingsError } = upcomingBookingsRes;
        const { count: upcomingRemindersCount, error: upcomingRemindersError } = upcomingRemindersRes;
        const { count: pastBookingsCount, error: pastBookingsError } = pastBookingsRes;

        if (recordsError || upcomingBookingsError || upcomingRemindersError || pastBookingsError) {
          throw new Error('Failed to fetch medicare data');
        }

        setStats({
          records: recordsCount || 0,
          upcoming: (upcomingBookingsCount || 0) + (upcomingRemindersCount || 0),
          consultations: pastBookingsCount || 0,
        });

      } catch (error) {
        console.error("Error fetching medicare stats:", error);
        setStats({ records: 0, upcoming: 0, consultations: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchMedicareData();
  }, [activePet]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 50%, #FFE5B4 100%)'
    }}>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{
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
            Medicare Services
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            fontFamily: 'Nunito',
            marginTop: '4px',
            margin: 0
          }}>
            Complete healthcare management for {activePet?.name || 'your pet'}
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            flex: 1,
            maxWidth: '400px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
          }}>
            <Heart size={24} color="#EF4444" style={{ margin: '0 auto 8px' }} />
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#374151',
              fontFamily: 'Nunito',
              marginTop: '8px'
            }}>
              {loading ? '...' : stats.records}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6B7280',
              fontFamily: 'Nunito',
              marginTop: '4px'
            }}>
              Records
            </div>
          </div>
          <div style={{
            flex: 1,
            maxWidth: '400px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
          }}>
            <Calendar size={24} color="#10B981" style={{ margin: '0 auto 8px' }} />
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#374151',
              fontFamily: 'Nunito',
              marginTop: '8px'
            }}>
              {loading ? '...' : stats.upcoming}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6B7280',
              fontFamily: 'Nunito',
              marginTop: '4px'
            }}>
              Upcoming
            </div>
          </div>
        </div>

        {/* Medicare Options */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            marginBottom: '16px'
          }}>
            Healthcare Services
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {medicareOptions.map((option, index) => {
              const IconComponent = option.icon;
              
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    to={option.route}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      className="card-hover"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '24px',
                          backgroundColor: `${option.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent size={24} color={option.color} />
                        </div>
                          <div>
                      <h3 style={{
                              fontSize: '16px',
                        fontWeight: '700',
                        color: '#374151',
                        fontFamily: 'Nunito',
                              margin: '0 0 4px 0'
                            }}>{option.title}</h3>
                      <p style={{
                        fontSize: '14px',
                              color: '#6B7280',
                              fontFamily: 'Nunito',
                              margin: 0
                            }}>{option.description}</p>
                          </div>
                        </div>
                        <ChevronRight size={20} color="#9CA3AF" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicareScreen;