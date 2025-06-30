import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User,
  Settings,
  Bell,
  Heart,
  FileText,
  HelpCircle,
  LogOut,
  Edit,
  ChevronRight,
  Shield,
  Star,
  Calendar
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';

const profileOptions = [
  {
    id: '1',
    title: 'Edit Profile',
    description: 'Update your personal information',
    icon: Edit,
    color: '#8B5CF6',
    action: 'edit-profile',
  },
  {
    id: '2',
    title: 'Pet Profiles',
    description: 'Manage your pet information',
    icon: Heart,
    color: '#10B981',
    action: 'pet-profiles',
  },
  {
    id: '3',
    title: 'Medical Records',
    description: 'Access all medical documents',
    icon: FileText,
    color: '#F59E0B',
    action: 'medical-records',
  },
  {
    id: '4',
    title: 'Notifications',
    description: 'Manage notification preferences',
    icon: Bell,
    color: '#EF4444',
    action: 'notifications',
  },
  {
    id: '5',
    title: 'Privacy & Security',
    description: 'Account security settings',
    icon: Shield,
    color: '#8B5CF6',
    action: 'privacy',
  },
  {
    id: '6',
    title: 'Help & Support',
    description: 'Get help and contact support',
    icon: HelpCircle,
    color: '#6B7280',
    action: 'help',
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { pets, activePet } = usePet();

  const handleOptionPress = (action: string) => {
    switch (action) {
      case 'edit-profile':
        Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
        break;
      case 'pet-profiles':
        Alert.alert('Pet Profiles', 'Pet profile management coming soon!');
        break;
      case 'medical-records':
        Alert.alert('Medical Records', 'Medical records access coming soon!');
        break;
      case 'notifications':
        Alert.alert('Notifications', 'Notification settings coming soon!');
        break;
      case 'privacy':
        Alert.alert('Privacy & Security', 'Privacy settings coming soon!');
        break;
      case 'help':
        Alert.alert('Help & Support', 'Help center coming soon!');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#F0F8FF']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={32} color="#8B5CF6" />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Edit size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Pet Owner'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              <View style={styles.membershipBadge}>
                <Star size={12} color="#F59E0B" />
                <Text style={styles.membershipText}>Premium Member</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pet Summary */}
        {activePet && (
          <View style={styles.petSummaryCard}>
            <View style={styles.petSummaryHeader}>
              <Text style={styles.petSummaryTitle}>Active Pet</Text>
              <TouchableOpacity>
                <Text style={styles.switchPetText}>Switch</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.petSummaryContent}>
              {activePet.photo ? (
                <Image source={{ uri: activePet.photo }} style={styles.petSummaryPhoto} />
              ) : (
                <View style={styles.petSummaryPhotoPlaceholder}>
                  <Text style={styles.petSummaryEmoji}>
                    {activePet.species === 'dog' ? '🐕' : '🐱'}
                  </Text>
                </View>
              )}
              <View style={styles.petSummaryInfo}>
                <Text style={styles.petSummaryName}>{activePet.name}</Text>
                <Text style={styles.petSummaryDetails}>
                  {activePet.breed} • {activePet.age} years old
                </Text>
                <View style={styles.petSummaryStats}>
                  <View style={styles.petStat}>
                    <FileText size={12} color="#6B7280" />
                    <Text style={styles.petStatText}>{activePet.medicalRecords.length} records</Text>
                  </View>
                  <View style={styles.petStat}>
                    <Calendar size={12} color="#6B7280" />
                    <Text style={styles.petStatText}>{activePet.reminders.length} reminders</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.optionsList}>
            {profileOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleOptionPress(option.action)}
              >
                <View style={[styles.optionIcon, { backgroundColor: `${option.color}20` }]}>
                  <option.icon size={20} color={option.color} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.appInfoCard}>
            <View style={styles.appInfoHeader}>
              <Heart size={24} color="#8B5CF6" />
              <Text style={styles.appInfoTitle}>AniMedi</Text>
            </View>
            <Text style={styles.appInfoDescription}>
              Your trusted companion for pet healthcare management. Version 1.0.0
            </Text>
            <View style={styles.appInfoLinks}>
              <TouchableOpacity style={styles.appInfoLink}>
                <Text style={styles.appInfoLinkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.appInfoLink}>
                <Text style={styles.appInfoLinkText}>Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.appInfoLink}>
                <Text style={styles.appInfoLinkText}>Rate App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  settingsButton: {
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
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    gap: 4,
  },
  membershipText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#F59E0B',
  },
  petSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  petSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  petSummaryTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  switchPetText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#8B5CF6',
  },
  petSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petSummaryPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  petSummaryPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  petSummaryEmoji: {
    fontSize: 20,
  },
  petSummaryInfo: {
    flex: 1,
  },
  petSummaryName: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  petSummaryDetails: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  petSummaryStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  petStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  petStatText: {
    fontSize: 11,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  optionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 16,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
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
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  optionDescription: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  appInfoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  appInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  appInfoTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginLeft: 12,
  },
  appInfoDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  appInfoLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  appInfoLink: {
    paddingVertical: 4,
  },
  appInfoLinkText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#8B5CF6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#EF4444',
  },
  bottomSpacing: {
    height: 20,
  },
});