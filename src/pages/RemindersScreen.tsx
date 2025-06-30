import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Bell, Calendar, Clock, Check, X, AlertCircle, Pill, Stethoscope, Scissors, Heart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../contexts/PetContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { requestAndSaveFcmToken } from '../lib/firebase';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  due_time: string | null;
  type: 'vaccination' | 'medication' | 'checkup' | 'grooming';
  is_completed: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_end_date?: string | null;
}

interface NewReminder {
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'grooming';
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_end_date?: string | null;
  custom_recurrence?: {
    interval?: number; // e.g. every X days/weeks/months
    unit?: 'days' | 'weeks' | 'months';
    weekdays?: string[]; // for custom weekly
  };
}

const reminderTypes = [
  {
    id: 'vaccination',
    name: 'Vaccination',
    icon: Stethoscope,
    color: '#8B5CF6',
  },
  {
    id: 'medication',
    name: 'Medication',
    icon: Pill,
    color: '#10B981',
  },
  {
    id: 'checkup',
    name: 'Checkup',
    icon: Heart,
    color: '#F59E0B',
  },
  {
    id: 'grooming',
    name: 'Grooming',
    icon: Scissors,
    color: '#EF4444',
  },
];

const RemindersScreen: React.FC = () => {
  const { activePet } = usePet();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState<NewReminder>({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'vaccination',
    is_recurring: false,
    recurrence_pattern: 'none',
    recurrence_end_date: '',
    custom_recurrence: {},
  });
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [notifStatus, setNotifStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReminders = async () => {
    if (!activePet?.id || !user?.id) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('pet_id', activePet.id)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      alert('Failed to fetch reminders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [activePet?.id, user?.id]);

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.date || !activePet?.id || !user?.id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const isRecurring = newReminder.recurrence_pattern && newReminder.recurrence_pattern !== 'none';
      const recurrencePattern = newReminder.recurrence_pattern === 'custom'
        ? JSON.stringify(newReminder.custom_recurrence)
        : newReminder.recurrence_pattern;
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          pet_id: activePet.id,
          user_id: user.id,
          title: newReminder.title,
          description: newReminder.description || null,
          due_date: newReminder.date,
          due_time: newReminder.time || null,
          type: newReminder.type,
          is_completed: false,
          is_recurring: isRecurring,
          recurrence_pattern: isRecurring ? recurrencePattern : null,
          recurrence_end_date: isRecurring && newReminder.recurrence_end_date ? newReminder.recurrence_end_date : null,
        })
        .select()
        .single();

      if (error) throw error;

      setReminders([...reminders, data]);
      setNewReminder({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'vaccination',
        is_recurring: false,
        recurrence_pattern: 'none',
        recurrence_end_date: '',
        custom_recurrence: {},
      });
      setShowAddModal(false);
      alert('Reminder added successfully!');
    } catch (error) {
      console.error('Error adding reminder:', error);
      alert('Failed to add reminder. Please try again.');
    }
  };

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setReminders(reminders.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, is_completed: true }
          : reminder
      ));
      alert('Reminder marked as completed!');
    } catch (error) {
      console.error('Error completing reminder:', error);
      alert('Failed to complete reminder. Please try again.');
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setReminders(reminders.filter(reminder => reminder.id !== reminderId));
      alert('Reminder deleted successfully!');
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Failed to delete reminder. Please try again.');
    }
  };

  const getTypeIcon = (type: string) => {
    const reminderType = reminderTypes.find(t => t.id === type);
    return reminderType?.icon || Bell;
  };

  const getTypeColor = (type: string) => {
    const reminderType = reminderTypes.find(t => t.id === type);
    return reminderType?.color || '#8B5CF6';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  interface ReminderCardProps {
    reminder: Reminder;
    isOverdue?: boolean;
  }

  const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, isOverdue = false }) => {
    const TypeIcon = getTypeIcon(reminder.type);
    const typeColor = getTypeColor(reminder.type);

    if (reminder.is_completed) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-hover"
          style={{ opacity: 0.7 }}
        >
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                backgroundColor: '#10B98120',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <Check size={20} color="#10B981" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#9CA3AF',
                  fontFamily: 'Nunito',
                  textDecoration: 'line-through',
                  margin: 0
                }}>
                  {reminder.title}
                </h3>
                {reminder.description && (
                  <p style={{
                    fontSize: '14px',
                    color: '#9CA3AF',
                    fontFamily: 'Nunito',
                    textDecoration: 'line-through',
                    marginTop: '2px',
                    margin: 0
                  }}>
                    {reminder.description}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '6px'
                }}>
                  <Calendar size={12} color="#9CA3AF" />
                  <span style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    fontFamily: 'Nunito'
                  }}>
                    Completed on {formatDate(reminder.due_date)}
                  </span>
                </div>
                {reminder.is_recurring && reminder.recurrence_pattern && (
                  <div style={{ fontSize: '12px', color: '#8B5CF6', fontFamily: 'Nunito', marginTop: 4 }}>
                    {reminder.recurrence_pattern === 'daily' && 'Repeats every day'}
                    {reminder.recurrence_pattern === 'weekly' && 'Repeats every week'}
                    {reminder.recurrence_pattern === 'monthly' && 'Repeats every month'}
                    {reminder.recurrence_end_date && ` until ${formatDate(reminder.recurrence_end_date)}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-hover"
      >
        <div style={{
          backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)',
          borderLeft: isOverdue ? '4px solid #EF4444' : 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '20px',
              backgroundColor: `${typeColor}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <TypeIcon size={20} color={typeColor} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                margin: 0
              }}>
                {reminder.title}
              </h3>
              {reminder.description && (
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontFamily: 'Nunito',
                  marginTop: '2px',
                  margin: 0
                }}>
                  {reminder.description}
                </p>
              )}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '6px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Calendar size={12} color="#6B7280" />
                  <span style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontFamily: 'Nunito'
                  }}>
                    {formatDate(reminder.due_date)}
                  </span>
                </div>
                {reminder.due_time && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} color="#6B7280" />
                    <span style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontFamily: 'Nunito'
                    }}>
                      {reminder.due_time}
                    </span>
                  </div>
                )}
              </div>
              {reminder.is_recurring && reminder.recurrence_pattern && (
                <div style={{ fontSize: '12px', color: '#8B5CF6', fontFamily: 'Nunito', marginTop: 4 }}>
                  {reminder.recurrence_pattern === 'daily' && 'Repeats every day'}
                  {reminder.recurrence_pattern === 'weekly' && 'Repeats every week'}
                  {reminder.recurrence_pattern === 'monthly' && 'Repeats every month'}
                  {reminder.recurrence_end_date && ` until ${formatDate(reminder.recurrence_end_date)}`}
                </div>
              )}
            </div>
            <button
              onClick={() => handleCompleteReminder(reminder.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              className="hover:bg-gray-100"
            >
              <Check size={20} color="#10B981" />
            </button>
            <button
              onClick={() => handleDeleteReminder(reminder.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                marginLeft: '4px'
              }}
              className="hover:bg-gray-100"
            >
              <Trash2 size={20} color="#EF4444" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Calculate filtered reminders
  const overdueReminders = reminders.filter(r => !r.is_completed && new Date(r.due_date) < new Date());
  const upcomingReminders = reminders.filter(r => !r.is_completed && new Date(r.due_date) >= new Date());
  const completedReminders = reminders.filter(r => r.is_completed);

  // When displaying reminders, only show those that are not completed
  const visibleReminders = reminders.filter(r => !r.is_completed);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 50%, #FFE5B4 100%)'
    }}>
      <div style={{ padding: '0 20px' }}>
        {/* Enable Push Notifications Button */}
        <button
          onClick={async () => {
            setLoading(true);
            setNotifStatus(null);
            if (user?.id) {
              const token = await requestAndSaveFcmToken(user.id);
              if (token) {
                setNotifStatus('Push notifications enabled and token saved!');
              } else {
                setNotifStatus('Failed to enable push notifications. Check console for errors.');
              }
            } else {
              setNotifStatus('You must be logged in to enable notifications.');
            }
            setLoading(false);
          }}
          disabled={loading}
          style={{
            background: 'linear-gradient(90deg, #8B5CF6 0%, #10B981 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 700,
            fontSize: '16px',
            fontFamily: 'Nunito',
            marginBottom: '20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
          }}
        >
          {loading ? 'Enabling...' : 'Enable Push Notifications'}
        </button>
        {notifStatus && (
          <div style={{ color: notifStatus.includes('enabled') ? 'green' : 'red', marginTop: 8 }}>{notifStatus}</div>
        )}
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '60px',
          paddingBottom: '20px'
        }}>
          <div
            onClick={() => navigate(-1)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={24} color="#374151" />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            margin: 0
          }}>
            Health Reminders
          </h1>
          <div
            onClick={() => setShowAddModal(true)}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '22px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)',
              cursor: 'pointer'
            }}
          >
            <Plus size={24} color="#8B5CF6" />
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#8B5CF6',
              fontFamily: 'Nunito'
            }}>
              {reminders.filter(r => !r.is_completed).length}
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
          <div style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#EF4444',
              fontFamily: 'Nunito'
            }}>
              {reminders.filter(r => !r.is_completed && new Date(r.due_date) < new Date()).length}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6B7280',
              fontFamily: 'Nunito',
              marginTop: '4px'
            }}>
              Overdue
            </div>
          </div>
          <div style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#10B981',
              fontFamily: 'Nunito'
            }}>
              {reminders.filter(r => r.is_completed).length}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6B7280',
              fontFamily: 'Nunito',
              marginTop: '4px'
            }}>
              Completed
            </div>
          </div>
        </div>

        {/* Overdue Reminders */}
        {overdueReminders.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px'
            }}>
              Overdue ({overdueReminders.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {overdueReminders.map((reminder: Reminder, index: number) => (
                <ReminderCard key={reminder.id} reminder={reminder} isOverdue={true} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Reminders */}
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '16px'
        }}>
          Upcoming ({upcomingReminders.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {upcomingReminders.map((reminder: Reminder, index: number) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px'
            }}>
              Completed ({completedReminders.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {completedReminders.map((reminder: Reminder, index: number) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
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
              <div
                onClick={() => setShowAddModal(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={20} color="#374151" />
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                margin: 0
              }}>
                Add Reminder
              </h2>
              <button
                onClick={handleAddReminder}
                style={{
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Nunito',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'Nunito',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Annual Vaccination"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none'
                  }}
                />
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
                  Description
                </label>
                <textarea
                  placeholder="Additional details..."
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
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
                  Type
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {reminderTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = newReminder.type === type.id;
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => setNewReminder({ ...newReminder, type: type.id as any })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                          border: isSelected ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isSelected ? '#8B5CF6' : '#374151',
                          fontFamily: 'Nunito',
                          cursor: 'pointer'
                        }}
                      >
                        <IconComponent size={20} color={type.color} />
                        {type.name}
                      </button>
                    );
                  })}
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
                  Date *
                </label>
                <input
                  type="date"
                  value={newReminder.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none'
                  }}
                />
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
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={newReminder.time}
                  min={newReminder.date === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0,5) : undefined}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none'
                  }}
                />
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
                  Repeat
                </label>
                <select
                  value={newReminder.recurrence_pattern || 'none'}
                  onChange={e => {
                    const val = e.target.value;
                    setNewReminder({
                      ...newReminder,
                      recurrence_pattern: val,
                      is_recurring: val !== 'none',
                      custom_recurrence: {},
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none',
                    marginBottom: '8px',
                  }}
                >
                  <option value="none">None</option>
                  <option value="daily">Every day</option>
                  <option value="weekly">Every week</option>
                  <option value="monthly">Every month</option>
                  <option value="custom">Custom</option>
                </select>
                {newReminder.recurrence_pattern === 'custom' && (
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: '15px', color: '#374151', fontFamily: 'Nunito', marginBottom: 4, display: 'block' }}>
                      Repeat every
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={newReminder.custom_recurrence?.interval || ''}
                      onChange={e => setNewReminder({
                        ...newReminder,
                        custom_recurrence: {
                          ...newReminder.custom_recurrence,
                          interval: parseInt(e.target.value) || 1,
                        },
                      })}
                      style={{
                        width: '60px',
                        padding: '8px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'Nunito',
                        outline: 'none',
                        marginRight: '8px',
                      }}
                    />
                    <select
                      value={newReminder.custom_recurrence?.unit || 'days'}
                      onChange={e => setNewReminder({
                        ...newReminder,
                        custom_recurrence: {
                          ...newReminder.custom_recurrence,
                          unit: e.target.value as 'days' | 'weeks' | 'months',
                        },
                      })}
                      style={{
                        padding: '8px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'Nunito',
                        outline: 'none',
                      }}
                    >
                      <option value="days">days</option>
                      <option value="weeks">weeks</option>
                      <option value="months">months</option>
                    </select>
                    {newReminder.custom_recurrence?.unit === 'weeks' && (
                      <div style={{ marginTop: 8 }}>
                        <label style={{ fontSize: '15px', color: '#374151', fontFamily: 'Nunito', marginBottom: 4, display: 'block' }}>
                          On (select weekdays):
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, idx) => (
                            <label key={day} style={{ fontSize: '14px', color: '#374151', fontFamily: 'Nunito' }}>
                              <input
                                type="checkbox"
                                checked={newReminder.custom_recurrence?.weekdays?.includes(idx.toString()) || false}
                                onChange={e => {
                                  const prev = newReminder.custom_recurrence?.weekdays || [];
                                  setNewReminder({
                                    ...newReminder,
                                    custom_recurrence: {
                                      ...newReminder.custom_recurrence,
                                      weekdays: e.target.checked
                                        ? [...prev, idx.toString()]
                                        : prev.filter(d => d !== idx.toString()),
                                    },
                                  });
                                }}
                                style={{ marginRight: 2 }}
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RemindersScreen;