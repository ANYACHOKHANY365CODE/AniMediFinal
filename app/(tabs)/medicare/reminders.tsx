import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft,
  Plus,
  Bell,
  Calendar,
  Clock,
  Check,
  X,
  AlertCircle,
  Pill,
  Stethoscope,
  Scissors,
  Heart
} from 'lucide-react-native';
import { router } from 'expo-router';
import { usePet } from '@/contexts/PetContext';

interface NewReminder {
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'grooming';
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

export default function RemindersScreen() {
  const { activePet, addReminder, updateReminder } = usePet();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReminder, setNewReminder] = useState<NewReminder>({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'vaccination',
  });

  const mockReminders = activePet?.reminders || [
    {
      id: '1',
      title: 'Annual Vaccination',
      description: 'Rabies and DHPP vaccination due',
      date: '2024-02-15',
      type: 'vaccination' as const,
      completed: false,
    },
    {
      id: '2',
      title: 'Heartworm Medication',
      description: 'Monthly heartworm prevention',
      date: '2024-02-01',
      type: 'medication' as const,
      completed: true,
    },
    {
      id: '3',
      title: 'Dental Cleaning',
      description: 'Professional dental cleaning appointment',
      date: '2024-02-20',
      type: 'checkup' as const,
      completed: false,
    },
    {
      id: '4',
      title: 'Nail Trimming',
      description: 'Regular nail maintenance',
      date: '2024-02-10',
      type: 'grooming' as const,
      completed: false,
    },
  ];

  const upcomingReminders = mockReminders.filter(r => !r.completed && new Date(r.date) >= new Date());
  const completedReminders = mockReminders.filter(r => r.completed);
  const overdueReminders = mockReminders.filter(r => !r.completed && new Date(r.date) < new Date());

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (activePet) {
      addReminder(activePet.id, {
        ...newReminder,
        completed: false,
      });
    }

    setNewReminder({
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'vaccination',
    });
    setShowAddModal(false);
    Alert.alert('Success', 'Reminder added successfully!');
  };

  const handleCompleteReminder = (reminderId: string) => {
    if (activePet) {
      updateReminder(activePet.id, reminderId, true);
    }
    Alert.alert('Completed', 'Reminder marked as completed!');
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

  const ReminderCard = ({ reminder, isOverdue = false }: { reminder: any, isOverdue?: boolean }) => {
    const TypeIcon = getTypeIcon(reminder.type);
    const typeColor = getTypeColor(reminder.type);

    return (
      <View style={[styles.reminderCard, isOverdue && styles.overdueCard]}>
        <View style={styles.reminderHeader}>
          <View style={[styles.reminderTypeIcon, { backgroundColor: `${typeColor}20` }]}>
            <TypeIcon size={20} color={typeColor} />
          </View>
          <View style={styles.reminderInfo}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text style={styles.reminderDescription}>{reminder.description}</Text>
            <View style={styles.reminderMeta}>
              <Calendar size={12} color="#6B7280" />
              <Text style={[styles.reminderDate, isOverdue && styles.overdueText]}>
                {formatDate(reminder.date)}
              </Text>
              {isOverdue && <AlertCircle size={12} color="#EF4444" />}
            </View>
          </View>
          <View style={styles.reminderActions}>
            {!reminder.completed && (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteReminder(reminder.id)}
              >
                <Check size={16} color="#10B981" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#F0F8FF']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Health Reminders</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Plus size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{upcomingReminders.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{overdueReminders.length}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{completedReminders.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Overdue Reminders */}
        {overdueReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>
              Overdue ({overdueReminders.length})
            </Text>
            <View style={styles.remindersList}>
              {overdueReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} isOverdue />
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Upcoming ({upcomingReminders.length})
          </Text>
          <View style={styles.remindersList}>
            {upcomingReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </View>
        </View>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Completed ({completedReminders.length})
            </Text>
            <View style={styles.remindersList}>
              {completedReminders.map((reminder) => (
                <View key={reminder.id} style={[styles.reminderCard, styles.completedCard]}>
                  <View style={styles.reminderHeader}>
                    <View style={[styles.reminderTypeIcon, { backgroundColor: '#10B98120' }]}>
                      <Check size={20} color="#10B981" />
                    </View>
                    <View style={styles.reminderInfo}>
                      <Text style={[styles.reminderTitle, styles.completedText]}>
                        {reminder.title}
                      </Text>
                      <Text style={[styles.reminderDescription, styles.completedText]}>
                        {reminder.description}
                      </Text>
                      <View style={styles.reminderMeta}>
                        <Calendar size={12} color="#9CA3AF" />
                        <Text style={styles.completedDate}>
                          Completed on {formatDate(reminder.date)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <LinearGradient
          colors={['#E6E6FA', '#F0F8FF']}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Reminder</Text>
            <TouchableOpacity onPress={handleAddReminder}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Annual Vaccination"
                value={newReminder.title}
                onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                placeholder="Additional details..."
                value={newReminder.description}
                onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <View style={styles.typeSelector}>
                {reminderTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      newReminder.type === type.id && styles.selectedType
                    ]}
                    onPress={() => setNewReminder({ ...newReminder, type: type.id as any })}
                  >
                    <type.icon size={20} color={type.color} />
                    <Text style={styles.typeName}>{type.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Date *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                value={newReminder.date}
                onChangeText={(text) => setNewReminder({ ...newReminder, date: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Time (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="HH:MM"
                value={newReminder.time}
                onChangeText={(text) => setNewReminder({ ...newReminder, time: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 16,
  },
  remindersList: {
    gap: 12,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  completedCard: {
    opacity: 0.7,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  reminderDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  reminderDate: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  overdueText: {
    color: '#EF4444',
    fontFamily: 'Nunito-SemiBold',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  completedDate: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#9CA3AF',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  saveButton: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#8B5CF6',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#374151',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedType: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  typeName: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  bottomSpacing: {
    height: 20,
  },
});