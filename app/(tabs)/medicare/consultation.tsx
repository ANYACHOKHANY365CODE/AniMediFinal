import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft,
  Video,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Star,
  User,
  ChevronRight,
  Send
} from 'lucide-react-native';
import { router } from 'expo-router';

interface Veterinarian {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  price: string;
  available: boolean;
  nextAvailable: string;
  photo: string;
}

const mockVets: Veterinarian[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    specialty: 'General Veterinarian',
    rating: 4.9,
    reviews: 247,
    experience: '8 years',
    price: '$45/consultation',
    available: true,
    nextAvailable: 'Available now',
    photo: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Emergency Medicine',
    rating: 4.8,
    reviews: 189,
    experience: '12 years',
    price: '$65/consultation',
    available: false,
    nextAvailable: 'Available in 2 hours',
    photo: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    rating: 4.7,
    reviews: 156,
    experience: '6 years',
    price: '$55/consultation',
    available: true,
    nextAvailable: 'Available now',
    photo: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

export default function ConsultationScreen() {
  const [selectedTab, setSelectedTab] = useState<'book' | 'chat'>('book');
  const [message, setMessage] = useState('');
  const [selectedVet, setSelectedVet] = useState<string | null>(null);

  const handleBookConsultation = (vet: Veterinarian) => {
    if (!vet.available) {
      Alert.alert('Unavailable', `${vet.name} is currently unavailable. ${vet.nextAvailable}.`);
      return;
    }
    
    Alert.alert(
      'Book Consultation',
      `Would you like to book a consultation with ${vet.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => Alert.alert('Success', 'Consultation booked successfully!')
        },
      ]
    );
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    Alert.alert('Message Sent', 'Your message has been sent to the veterinarian.');
    setMessage('');
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
        <Text style={styles.title}>Vet Consultation</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'book' && styles.activeTab]}
          onPress={() => setSelectedTab('book')}
        >
          <Video size={20} color={selectedTab === 'book' ? '#8B5CF6' : '#9CA3AF'} />
          <Text style={[styles.tabText, selectedTab === 'book' && styles.activeTabText]}>
            Book Consultation
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'chat' && styles.activeTab]}
          onPress={() => setSelectedTab('chat')}
        >
          <MessageCircle size={20} color={selectedTab === 'chat' ? '#8B5CF6' : '#9CA3AF'} />
          <Text style={[styles.tabText, selectedTab === 'chat' && styles.activeTabText]}>
            Quick Chat
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'book' ? (
          <View style={styles.bookingContent}>
            <View style={styles.consultationTypes}>
              <Text style={styles.sectionTitle}>Consultation Types</Text>
              <View style={styles.typeCards}>
                <TouchableOpacity style={styles.typeCard}>
                  <Video size={24} color="#8B5CF6" />
                  <Text style={styles.typeTitle}>Video Call</Text>
                  <Text style={styles.typeDescription}>Face-to-face consultation</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.typeCard}>
                  <Phone size={24} color="#10B981" />
                  <Text style={styles.typeTitle}>Phone Call</Text>
                  <Text style={styles.typeDescription}>Voice consultation</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.typeCard}>
                  <MessageCircle size={24} color="#F59E0B" />
                  <Text style={styles.typeTitle}>Chat</Text>
                  <Text style={styles.typeDescription}>Text-based consultation</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.vetsSection}>
              <Text style={styles.sectionTitle}>Available Veterinarians</Text>
              <View style={styles.vetsList}>
                {mockVets.map((vet) => (
                  <TouchableOpacity
                    key={vet.id}
                    style={[
                      styles.vetCard,
                      selectedVet === vet.id && styles.selectedVetCard
                    ]}
                    onPress={() => setSelectedVet(vet.id)}
                  >
                    <View style={styles.vetHeader}>
                      <Image source={{ uri: vet.photo }} style={styles.vetPhoto} />
                      <View style={styles.vetInfo}>
                        <Text style={styles.vetName}>{vet.name}</Text>
                        <Text style={styles.vetSpecialty}>{vet.specialty}</Text>
                        <View style={styles.vetMeta}>
                          <View style={styles.ratingContainer}>
                            <Star size={12} color="#F59E0B" fill="#F59E0B" />
                            <Text style={styles.rating}>{vet.rating}</Text>
                            <Text style={styles.reviewCount}>({vet.reviews})</Text>
                          </View>
                          <Text style={styles.experience}>{vet.experience} exp</Text>
                        </View>
                      </View>
                      <View style={styles.vetPricing}>
                        <Text style={styles.price}>{vet.price}</Text>
                        <View style={[
                          styles.availabilityBadge,
                          { backgroundColor: vet.available ? '#10B981' : '#F59E0B' }
                        ]}>
                          <Text style={styles.availabilityText}>{vet.nextAvailable}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.bookButton,
                        !vet.available && styles.disabledBookButton
                      ]}
                      onPress={() => handleBookConsultation(vet)}
                    >
                      <Text style={[
                        styles.bookButtonText,
                        !vet.available && styles.disabledBookButtonText
                      ]}>
                        {vet.available ? 'Book Now' : 'Not Available'}
                      </Text>
                      <ChevronRight size={16} color={vet.available ? '#FFFFFF' : '#9CA3AF'} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.chatContent}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Quick Chat with Vet</Text>
              <Text style={styles.chatSubtitle}>
                Get quick answers to your pet health questions
              </Text>
            </View>

            <View style={styles.chatMessages}>
              <View style={styles.systemMessage}>
                <Text style={styles.systemMessageText}>
                  👋 Hello! I'm here to help with your pet health questions. Please describe your concern.
                </Text>
              </View>
            </View>

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your question here..."
                value={message}
                onChangeText={setMessage}
                multiline
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickQuestions}>
              <Text style={styles.quickQuestionsTitle}>Common Questions</Text>
              <View style={styles.questionTags}>
                {[
                  'My pet won\'t eat',
                  'Skin irritation',
                  'Vomiting',
                  'Lethargy',
                  'Vaccination schedule',
                  'Behavioral changes'
                ].map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.questionTag}
                    onPress={() => setMessage(question)}
                  >
                    <Text style={styles.questionTagText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

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
  placeholder: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  bookingContent: {
    paddingHorizontal: 20,
  },
  consultationTypes: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 16,
  },
  typeCards: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
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
  typeTitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginTop: 8,
  },
  typeDescription: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  vetsSection: {
    marginBottom: 24,
  },
  vetsList: {
    gap: 16,
  },
  vetCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedVetCard: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  vetHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  vetPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  vetInfo: {
    flex: 1,
  },
  vetName: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  vetSpecialty: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  vetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#374151',
  },
  reviewCount: {
    fontSize: 10,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  experience: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  vetPricing: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  availabilityText: {
    fontSize: 10,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFFFFF',
  },
  bookButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledBookButton: {
    backgroundColor: '#F3F4F6',
  },
  bookButtonText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  disabledBookButtonText: {
    color: '#9CA3AF',
  },
  chatContent: {
    paddingHorizontal: 20,
  },
  chatHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  chatTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
  },
  chatSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  chatMessages: {
    marginBottom: 20,
  },
  systemMessage: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  systemMessageText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chatInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#374151',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  quickQuestions: {
    marginBottom: 24,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#374151',
    marginBottom: 12,
  },
  questionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionTagText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
  },
  bottomSpacing: {
    height: 20,
  },
});