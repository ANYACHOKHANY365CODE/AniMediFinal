import { useState, useEffect } from 'react';
import { supabase, type Veterinarian, type Booking, type VetBooking } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useVeterinarians = () => {
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchVeterinarians();
  }, []);

  const fetchVeterinarians = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('veterinarians')
        .select('*');

      if (error) throw error;
      
      // Get consultation types for each vet
      const vetsWithConsultationTypes = await Promise.all(
        (data || []).map(async (vet) => {
          const { data: consultationTypes } = await supabase
            .from('consultation_types')
            .select('consultation_type')
            .eq('vet_id', vet.id);
            
          return {
            ...vet,
            consultation_types: consultationTypes || []
          };
        })
      );
      
      setVeterinarians(vetsWithConsultationTypes);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching veterinarians:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch veterinarians');
      setIsLoading(false);
      
      // Fallback to mock data if fetch fails
      setVeterinarians([
        {
          id: '1',
          name: 'Dr. Sarah Wilson',
          specialty: 'General Veterinarian',
          experience_years: 8,
          price_per_consultation: 45.00,
          photo_url: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
          bio: 'Experienced veterinarian with a passion for animal care and preventive medicine.',
          rating: 4.9,
          review_count: 247,
          is_available: true,
          next_available_time: new Date(Date.now() + 3600000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          consultation_types: [
            { consultation_type: 'Video Call' },
            { consultation_type: 'Phone Call' },
            { consultation_type: 'Chat' }
          ]
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Emergency Medicine',
          experience_years: 12,
          price_per_consultation: 65.00,
          photo_url: 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=300',
          bio: 'Specialist in emergency and critical care with extensive surgical experience.',
          rating: 4.8,
          review_count: 189,
          is_available: false,
          next_available_time: new Date(Date.now() + 7200000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          consultation_types: [
            { consultation_type: 'Video Call' },
            { consultation_type: 'Phone Call' }
          ]
        },
        {
          id: '3',
          name: 'Dr. Emily Rodriguez',
          specialty: 'Dermatology',
          experience_years: 6,
          price_per_consultation: 55.00,
          photo_url: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300',
          bio: 'Board-certified veterinary dermatologist specializing in skin conditions and allergies.',
          rating: 4.7,
          review_count: 156,
          is_available: true,
          next_available_time: new Date(Date.now() + 1800000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          consultation_types: [
            { consultation_type: 'Video Call' }
          ]
        }
      ]);
    }
  };

  const bookConsultation = async (bookingData: {
    vet_id: string;
    pet_id?: string;
    appointment_date: string;
    appointment_time: string;
    consultation_type: 'video' | 'phone' | 'in-person';
    notes?: string;
    fee?: number;
  }): Promise<VetBooking> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('vet_bookings')
        .insert([{
          ...bookingData,
          user_id: user.id,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error booking consultation:', err);
      throw err;
    }
  };

  return {
    veterinarians,
    isLoading,
    error,
    bookConsultation,
    refetch: fetchVeterinarians
  };
};