import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Stethoscope, 
  Heart, 
  Pill, 
  Scissors,
  ChevronRight,
  Filter
} from 'lucide-react-native';

interface HealthcareFacility {
  id: string;
  name: string;
  type: 'diagnostic' | 'paramedic' | 'pharmacy' | 'neutering';
  address: string;
  phone: string;
  rating: number;
  reviews: number;
  distance: string;
  isOpen: boolean;
  specialties?: string[];
}

const mockFacilities: HealthcareFacility[] = [
  {
    id: '1',
    name: 'VetCare Animal Hospital',
    type: 'diagnostic',
    address: '123 Pet Street, Downtown',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    reviews: 245,
    distance: '0.8 km',
    isOpen: true,
    specialties: ['X-Ray', 'Ultrasound', 'Blood Tests', 'MRI'],
  },
  {
    id: '2',
    name: 'Emergency Pet Clinic',
    type: 'paramedic',
    address: '456 Animal Ave, Midtown',
    phone: '+1 (555) 987-6543',
    rating: 4.6,
    reviews: 189,
    distance: '1.2 km',
    isOpen: true,
    specialties: ['Emergency Care', 'Surgery', 'ICU'],
  },
  {
    id: '3',
    name: 'Pet Pharmacy Plus',
    type: 'pharmacy',
    address: '789 Medicine Lane, Uptown',
    phone: '+1 (555) 456-7890',
    rating: 4.7,
    reviews: 156,
    distance: '0.5 km',
    isOpen: true,
    specialties: ['Prescription Meds', 'Supplements', 'Flea Control'],
  },
  {
    id: '4',
    name: 'Compassionate Spay & Neuter',
    type: 'neutering',
    address: '321 Care Circle, Suburbia',
    phone: '+1 (555) 234-5678',
    rating: 4.9,
    reviews: 312,
    distance: '2.1 km',
    isOpen: false,
    specialties: ['Spay/Neuter', 'Microchipping', 'Dental Care'],
  },
];

const categories = [
  {
    id: 'diagnostic',
    name: 'Diagnostic Centers',
    icon: Stethoscope,
    color: '#8B5CF6',
    description: 'X-rays, blood tests, and health screenings',
  },
  {
    id: 'paramedic',
    name: 'Emergency Care',
    icon: Heart,
    color: '#EF4444',
    description: 'Emergency services and urgent care',
  },
  {
    id: 'pharmacy',
    name: 'Pet Pharmacies',
    icon: Pill,
    color: '#10B981',
    description: 'Medications and health supplements',
  },
  {
    id: 'neutering',
    name: 'Spay & Neuter',
    icon: Scissors,
    color: '#F59E0B',
    description: 'Neutering and microchipping services',
  },
];

export default function HealthcareScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFacilities = mockFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || facility.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnostic': return Stethoscope;
      case 'paramedic': return Heart;
      case 'pharmacy': return Pill;
      case 'neutering': return Scissors;
      default: return Stethoscope;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnostic': return '#8B5CF6';
      case 'paramedic': return '#EF4444';
      case 'pharmacy': return '#10B981';
      case 'neutering': return '#F59E0B';
      default: return '#8B5CF6';
    }
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#F0F8FF']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Healthcare Facilities</Text>
        <Text style={styles.subtitle}>Find the best care for your pet</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchText}
            placeholder="Search facilities..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategoryCard
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <category.icon size={24} color={category.color} />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.selectedCategoryName
                ]}>
                  {category.name}
                </Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Facilities List */}
        <View style={styles.facilitiesContainer}>
          <View style={styles.facilitiesHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name 
                : 'All Facilities'
              }
            </Text>
            <Text style={styles.resultsCount}>
              {filteredFacilities.length} results
            </Text>
          </View>

          <View style={styles.facilitiesList}>
            {filteredFacilities.map((facility) => {
              const TypeIcon = getTypeIcon(facility.type);
              const typeColor = getTypeColor(facility.type);
              
              return (
                <TouchableOpacity key={facility.id} style={styles.facilityCard}>
                  <View style={styles.facilityHeader}>
                    <View style={[styles.facilityTypeIcon, { backgroundColor: `${typeColor}20` }]}>
                      <TypeIcon size={20} color={typeColor} />
                    </View>
                    <View style={styles.facilityInfo}>
                      <Text style={styles.facilityName}>{facility.name}</Text>
                      <View style={styles.facilityMeta}>
                        <View style={styles.ratingContainer}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.rating}>{facility.rating}</Text>
                          <Text style={styles.reviewCount}>({facility.reviews})</Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: facility.isOpen ? '#10B981' : '#EF4444' }
                        ]}>
                          <Text style={styles.statusText}>
                            {facility.isOpen ? 'Open' : 'Closed'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </View>

                  <View style={styles.facilityDetails}>
                    <View style={styles.facilityRow}>
                      <MapPin size={16} color="#6B7280" />
                      <Text style={styles.facilityAddress}>{facility.address}</Text>
                      <Text style={styles.facilityDistance}>{facility.distance}</Text>
                    </View>
                    
                    <View style={styles.facilityRow}>
                      <Phone size={16} color="#6B7280" />
                      <Text style={styles.facilityPhone}>{facility.phone}</Text>
                    </View>

                    {facility.specialties && (
                      <View style={styles.specialtiesContainer}>
                        <Text style={styles.specialtiesLabel}>Specialties:</Text>
                        <View style={styles.specialtiesList}>
                          {facility.specialties.map((specialty, index) => (
                            <View key={index} style={styles.specialtyTag}>
                              <Text style={styles.specialtyText}>{specialty}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#374151',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesList: {
    paddingLeft: 20,
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 160,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCategoryCard: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  selectedCategoryName: {
    color: '#8B5CF6',
  },
  categoryDescription: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },
  facilitiesContainer: {
    paddingHorizontal: 20,
  },
  facilitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  facilitiesList: {
    gap: 16,
  },
  facilityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  facilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  facilityTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  facilityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  facilityDetails: {
    gap: 8,
  },
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  facilityAddress: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  facilityDistance: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#8B5CF6',
  },
  facilityPhone: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  specialtiesContainer: {
    marginTop: 8,
  },
  specialtiesLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
    marginBottom: 6,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialtyText: {
    fontSize: 11,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 20,
  },
});