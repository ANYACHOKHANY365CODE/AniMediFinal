/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Use default values for development if environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kigszvelfstchvkimpms.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZ3N6dmVsZnN0Y2h2a2ltcG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk5NzI5NzcsImV4cCI6MjAyNTU0ODk3N30.Nh95GmRRh-kzXhXNrQVxVplC3CRGzQZPJk_1QxpFYwY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'pet_owner' | 'vet' | 'dog_walker' | 'admin';
  phone?: string;
  avatar_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  public: boolean;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: number;
  weight: number;
  gender?: 'male' | 'female';
  is_neutered: boolean;
  is_microchipped: boolean;
  allergies: string[];
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  pet_id: string;
  user_id: string;
  title: string;
  record_type: 'document' | 'image';
  file_url: string;
  extracted_text?: string;
  record_date: string;
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: string;
  pet_id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: 'vaccination' | 'medication' | 'checkup' | 'grooming';
  due_date: string;
  due_time?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface HealthcareFacility {
  id: string;
  name: string;
  facility_type: 'diagnostic' | 'paramedic' | 'pharmacy' | 'neutering';
  address: string;
  phone: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  specialties?: string[];
  is_open: boolean;
  opening_hours?: any;
  created_at: string;
  updated_at: string;
}

export interface FacilityReview {
  id: string;
  facility_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface Veterinarian {
  id: string;
  name: string;
  specialty: string;
  experience_years: number;
  price_per_consultation: number;
  photo_url?: string;
  bio?: string;
  rating?: number;
  review_count?: number;
  is_available: boolean;
  next_available_time?: string;
  created_at: string;
  updated_at: string;
  consultation_types?: { consultation_type: string }[];
}

export interface DogWalker {
  id: string;
  name: string;
  photo_url?: string;
  experience_years: number;
  price_per_hour: number;
  bio?: string;
  specialties?: string[];
  latitude?: number;
  longitude?: number;
  is_available: boolean;
  availability_schedule?: any;
  created_at: string;
  updated_at: string;
}

export interface WalkerReview {
  id: string;
  walker_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profiles?: Profile;
}

export interface Booking {
  id: string;
  user_id: string;
  pet_id?: string;
  booking_type: 'vet_consultation' | 'dog_walking';
  service_provider_id: string;
  booking_date: string;
  booking_time: string;
  duration_minutes?: number;
  duration_hours?: number;
  consultation_type?: string;
  contact_method?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  total_price?: number;
  created_at: string;
  updated_at: string;
}

export interface VetBooking {
  id: string;
  user_id: string;
  pet_id: string;
  vet_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: 'video' | 'phone' | 'in-person';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  fee?: number;
  created_at: string;
  updated_at: string;
}