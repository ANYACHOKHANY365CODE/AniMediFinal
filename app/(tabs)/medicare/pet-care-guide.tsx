import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LucideIcons from 'lucide-react-native';
import { router } from 'expo-router';
import { usePet } from '../../contexts/PetContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// --- TYPE DEFINITIONS ---
type IconName = keyof typeof LucideIcons;

interface CareTip {
  id: string;
  pet_id: string;
  user_id: string;
  type: 'do' | 'dont';
  category: string;
  title: string;
  description: string;
  icon: IconName;
}

// --- ICON MAPPING ---
// Allows storing icon names as strings in DB and rendering the component
const IconMap = LucideIcons;

// --- COMPONENTS ---
const PetCareSection = ({ pet }) => {
  const { user } = useAuth();
  const [careData, setCareData] = useState<{ dos: CareTip[], donts: CareTip[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'dos' | 'donts'>('dos');

  useEffect(() => {
    const loadCareGuide = async () => {
      if (!pet || !user) return;
      setIsLoading(true);

      const { data: existingTips, error } = await supabase
        .from('pet_care_guide')
        .select('*')
        .eq('pet_id', pet.id);
      
      if (error) {
        console.error("Error fetching care tips:", error);
        setIsLoading(false);
        return;
      }

      if (existingTips && existingTips.length > 0) {
        setCareData({
            dos: existingTips.filter(t => t.type === 'do'),
            donts: existingTips.filter(t => t.type === 'dont'),
        });
      } else {
        // No tips exist yet. The backend is generating them.
        // Set careData to null to show a message.
        setCareData(null);
      }
      setIsLoading(false);
    };

    loadCareGuide();
  }, [pet, user]);

  const renderItem = (item: CareTip) => {
    const IconComponent = IconMap[item.icon] || IconMap.HelpCircle;
    const color = item.type === 'do' ? '#10B981' : '#EF4444';
    return (
      <View key={item.id} style={styles.careItem}>
        <View style={[styles.itemIconContainer, { backgroundColor: `${color}20` }]}>
          <IconComponent size={24} color={color} />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Fetching Care Guide...</Text>
        </View>
    )
  }

  // If care data hasn't been generated yet, show a message.
  if (!careData) {
      return (
        <View style={styles.petSection}>
            <View style={styles.petHeader}>
            {pet.avatar_url ? (
            <Image source={{ uri: pet.avatar_url }} style={styles.petPhoto} />
            ) : (
            <View style={styles.petPhotoPlaceholder}>
                <Text style={styles.petEmoji}>{pet.type === 'dog' ? '🐕' : '🐱'}</Text>
            </View>
            )}
            <View>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petBreed}>{pet.breed}</Text>
            </View>
        </View>
        <View style={styles.generatingContainer}>
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text style={styles.generatingText}>
                Our AI is creating a personalized care guide for {pet.name}. This may take a moment. Please check back shortly!
            </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.petSection}>
      <View style={styles.petHeader}>
        {pet.avatar_url ? (
          <Image source={{ uri: pet.avatar_url }} style={styles.petPhoto} />
        ) : (
          <View style={styles.petPhotoPlaceholder}>
             <Text style={styles.petEmoji}>{pet.type === 'dog' ? '🐕' : '🐱'}</Text>
          </View>
        )}
        <View>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>{pet.breed}</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'dos' && styles.activeTab]}
          onPress={() => setSelectedTab('dos')}
        >
          <LucideIcons.CheckCircle size={20} color={selectedTab === 'dos' ? '#10B981' : '#9CA3AF'} />
          <Text style={[styles.tabText, selectedTab === 'dos' && styles.activeTabText]}>
            Do's ({careData?.dos.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'donts' && styles.activeTab]}
          onPress={() => setSelectedTab('donts')}
        >
          <LucideIcons.XCircle size={20} color={selectedTab === 'donts' ? '#EF4444' : '#9CA3AF'} />
          <Text style={[styles.tabText, selectedTab === 'donts' && styles.activeTabText]}>
            Don'ts ({careData?.donts.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {careData && (selectedTab === 'dos' ? careData.dos.map(renderItem) : careData.donts.map(renderItem))}
    </View>
  );
};

export default function PetCareGuideScreen() {
  const { pets, activePet, setActivePet, loading } = usePet();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  useEffect(() => {
    if (activePet) {
      setSelectedPetId(activePet.id);
    } else if (pets.length > 0) {
      setSelectedPetId(pets[0].id);
      setActivePet(pets[0].id);
    }
  }, [activePet, pets]);

  const selectedPet = pets.find(p => p.id === selectedPetId);

  return (
    <LinearGradient
      colors={['#F4F1FE', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <LucideIcons.ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.title}>Pet Care Guide</Text>
        </View>

        {loading ? (
           <View style={styles.fullScreenLoader}>
             <ActivityIndicator size="large" color="#8B5CF6" />
           </View>
        ) : pets.length > 0 ? (
          <>
            {pets.length > 1 && (
                <View style={styles.petSelectorContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {pets.map(pet => (
                    <TouchableOpacity
                        key={pet.id}
                        onPress={() => {
                          setSelectedPetId(pet.id);
                          setActivePet(pet.id);
                        }}
                        style={[
                        styles.petSelector,
                        selectedPetId === pet.id && styles.activePetSelector,
                        ]}
                    >
                        {pet.avatar_url ? (
                        <Image source={{ uri: pet.avatar_url }} style={styles.selectorPhoto} />
                        ) : (
                        <Text style={styles.selectorEmoji}>{pet.type === 'dog' ? '🐕' : '🐱'}</Text>
                        )}
                        <Text
                        style={[
                            styles.selectorName,
                            selectedPetId === pet.id && styles.activeSelectorName,
                        ]}
                        >
                        {pet.name}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
                </View>
            )}
            
            {selectedPet ? (
              <PetCareSection pet={selectedPet} />
            ) : (
              <Text>Select a pet to see their care guide.</Text>
            )}
          </>
        ) : (
            <View style={styles.emptyStateContainer}>
                <LucideIcons.ShieldQuestion size={64} color="#C4B5FD" />
                <Text style={styles.emptyStateTitle}>No Pets Found</Text>
                <Text style={styles.emptyStateText}>
                    Add a pet to your profile to receive a personalized care guide.
                </Text>
                <TouchableOpacity onPress={() => router.push('/profile-setup')} style={styles.addPetButton}>
                    <Text style={styles.addPetButtonText}>Add a Pet</Text>
                </TouchableOpacity>
            </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  petSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  petSelector: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  activePetSelector: {
    backgroundColor: '#E9E3FF',
    borderColor: '#8B5CF6'
  },
  selectorPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  selectorEmoji: {
    fontSize: 30,
    width: 50,
    height: 50,
    textAlign: 'center',
    lineHeight: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 4,
  },
  selectorName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  activeSelectorName: {
    color: '#8B5CF6',
    fontWeight: '700'
  },
  petSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  petPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  petPhotoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 36,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  petBreed: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#374151',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500'
  },
  generatingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  generatingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  careItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addPetButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  addPetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
}); 