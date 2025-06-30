import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Video,
  BookOpen,
  FileText,
  Bell,
  ChevronRight,
  Calendar,
  Heart,
  Stethoscope,
  Clock
} from 'lucide-react-native';
import { router } from 'expo-router';
import { usePet } from '@/contexts/PetContext';

const medicareOptions = [
  {
    id: '1',
    title: 'Vet Consultation',
    description: 'Connect with licensed veterinarians',
    icon: Video,
    color: '#8B5CF6',
    route: '/medicare/consultation',
    features: ['24/7 Available', 'Video Calls', 'Expert Advice'],
  },
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

export default function MedicareIndexScreen() {
  const { activePet } = usePet();

  const recentActivity = [
    {
      id: '1',
      type: 'consultation',
      title: 'Vet Consultation',
      subtitle: 'Completed with Dr. Sarah Wilson',
      date: '2 days ago',
      icon: Stethoscope,
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Vaccination Due',
      subtitle: 'Annual rabies shot for ' + (activePet?.name || 'your pet'),
      date: 'Tomorrow',
      icon: Calendar,
    },
    {
      id: '3',
      type: 'record',
      title: 'Lab Results Added',
      subtitle: 'Blood work results uploaded',
      date: '1 week ago',
      icon: FileText,
    },
  ];

  return (
    <LinearGradient
      colors={['#E6E6FA', '#F0F8FF']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Medicare Services</Text>
        <Text style={styles.subtitle}>
          Complete healthcare management for {activePet?.name || 'your pet'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Heart size={24} color="#EF4444" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color="#10B981" />
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={24} color="#8B5CF6" />
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
        </View>

        {/* Medicare Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Healthcare Services</Text>
          <View style={styles.optionsGrid}>
            {medicareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => router.push(option.route as any)}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
                    <option.icon size={24} color={option.color} />
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
                
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
                
                <View style={styles.featuresContainer}>
                  {option.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivity.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <item.icon size={16} color="#8B5CF6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
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
    color: '#374151',
    marginTop: 8,
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
  optionsGrid: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  featureTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 11,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
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
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  activitySubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#9CA3AF',
  },
  bottomSpacing: {
    height: 20,
  },
});