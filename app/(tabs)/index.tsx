import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Bell, 
  Calendar, 
  Heart, 
  Stethoscope, 
  FileText, 
  Users,
  ArrowRight,
  AlertCircle,
  Star
} from 'lucide-react-native';
import { usePet } from '../../contexts/PetContext';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { activePet, pets } = usePet();
  const { user } = useAuth();

  const upcomingReminders = activePet?.reminders.filter(
    reminder => !reminder.completed && new Date(reminder.date) >= new Date()
  ).slice(0, 3) || [];

  const quickActions = [
    {
      id: '1',
      title: 'Vet Consultation',
      description: 'Book online consultation',
      icon: Stethoscope,
      color: '#8B5CF6',
      screen: '/medicare/consultation',
    },
    {
      id: '2',
      title: 'Medical Records',
      description: 'View & upload records',
      icon: FileText,
      color: '#10B981',
      screen: '/medicare/records',
    },
    {
      id: '3',
      title: 'Find Healthcare',
      description: 'Nearby facilities',
      icon: Heart,
      color: '#F59E0B',
      screen: '/healthcare',
    },
    {
      id: '4',
      title: 'Dog Walkers',
      description: 'Book walking service',
      icon: Users,
      color: '#EF4444',
      screen: '/dog-walkers',
    },
  ];

  return (
    <LinearGradient
      colors={['#E6E6FA', '#F0F8FF']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, {user?.name}!</Text>
            <Text style={styles.subGreeting}>How is {activePet?.name || 'your pet'} today?</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#8B5CF6" />
            {upcomingReminders.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{upcomingReminders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Pet Card */}
        {activePet && (
          <View style={styles.petCard}>
            <View style={styles.petInfo}>
              {activePet.photo ? (
                <Image source={{ uri: activePet.photo }} style={styles.petPhoto} />
              ) : (
                <View style={styles.petPhotoPlaceholder}>
                  <Text style={styles.petPhotoEmoji}>
                    {activePet.species === 'dog' ? '🐕' : '🐱'}
                  </Text>
                </View>
              )}
              <View style={styles.petDetails}>
                <Text style={styles.petName}>{activePet.name}</Text>
                <Text style={styles.petBreed}>{activePet.breed}</Text>
                <Text style={styles.petAge}>{activePet.age} years old • {activePet.weight}kg</Text>
              </View>
            </View>
            <View style={styles.healthStatus}>
              <View style={styles.healthIndicator}>
                <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.healthText}>Healthy</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.quickActionCard} onPress={() => router.push(action.screen as any)}>
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <action.icon size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.remindersContainer}>
              {upcomingReminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderCard}>
                  <View style={styles.reminderIconContainer}>
                    <Calendar size={16} color="#8B5CF6" />
                  </View>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderDate}>
                      {new Date(reminder.date).toLocaleDateString()}
                    </Text>
                  </View>
                  <AlertCircle size={16} color="#F59E0B" />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
          <View style={styles.healthTipCard}>
            <View style={styles.healthTipHeader}>
              <Star size={20} color="#F59E0B" />
              <Text style={styles.healthTipTitle}>Tip of the Day</Text>
            </View>
            <Text style={styles.healthTipText}>
              {activePet?.species === 'dog' 
                ? "Regular exercise is crucial for your dog's physical and mental health. Aim for at least 30 minutes of activity daily."
                : "Cats need mental stimulation too! Interactive toys and puzzle feeders can help keep your feline friend engaged and healthy."
              }
            </Text>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
  greeting: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  subGreeting: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  petCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  petPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petPhotoEmoji: {
    fontSize: 24,
  },
  petDetails: {
    marginLeft: 16,
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  petBreed: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
    marginTop: 2,
  },
  petAge: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  healthStatus: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  healthText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#10B981',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#8B5CF6',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  remindersContainer: {
    gap: 12,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reminderIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  reminderDate: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  healthTipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  healthTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthTipTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginLeft: 8,
  },
  healthTipText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});