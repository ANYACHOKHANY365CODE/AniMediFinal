import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Pet {
  id: string;
  user_id: string;
  name: string;
  type: 'cat' | 'dog';
  breed: string;
  age: number;
  weight: number;
  gender: 'male' | 'female';
  is_neutered: boolean;
  is_microchipped: boolean;
  allergies: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  medicalRecords?: MedicalRecord[]; // Optional, can be loaded on demand
  reminders?: Reminder[]; // Optional, can be loaded on demand
  care_guide?: string;
  health_score?: number; // Added for dashboard health score
}

interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  type: 'document' | 'image';
  file: string;
  extractedText?: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'grooming';
  completed: boolean;
}

export interface PetContextType {
  pets: Pet[];
  activePet: Pet | null;
  reminders: Reminder[];
  addPet: (pet: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'medicalRecords' | 'reminders'>) => Promise<Pet>;
  setActivePet: (petId: string) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  deletePet: (petId: string) => void;
  loading: boolean;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePetState] = useState<Pet | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPets = async () => {
      if (!user) {
        setPets([]);
        setActivePetState(null);
        setLoading(false);
        return;
      };
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pets:', error);
      } else {
        setPets(data || []);
        if (data && data.length > 0 && !activePet) {
          setActivePetState(data[0]);
        }
      }
      setLoading(false);
    };

    fetchPets();
  }, [user]);

  useEffect(() => {
    const fetchReminders = async () => {
      if (!activePet) {
        setReminders([]);
        return;
      }
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('pet_id', activePet.id);
      
      if (error) {
        console.error('Error fetching reminders:', error);
      } else {
        setReminders(data || []);
      }
    };
    fetchReminders();
  }, [activePet]);

  useEffect(() => {
    if (!user) return;
    const storedPetId = localStorage.getItem('activePetId');
    if (storedPetId && pets.length > 0) {
      const found = pets.find(p => p.id === storedPetId);
      if (found) setActivePetState(found);
    }
  }, [user, pets.length]);

  const addPet = async (petData: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'medicalRecords' | 'reminders'>): Promise<Pet> => {
    if (!user) throw new Error("User not authenticated");

    const { data: newPet, error } = await supabase
      .from('pets')
      .insert({ ...petData, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding pet:', error);
      throw error;
    }

    // Generate care guide using backend
    try {
      const response = await fetch('/api/generate-care-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId: newPet.id, petInfo: { ...newPet, ownerName: user.user_metadata?.name || user.email || 'Owner' } })
      });
      const result = await response.json();
      if (result.care_guide) {
        newPet.care_guide = result.care_guide;
      }
    } catch (err) {
      console.error('Failed to generate care guide:', err);
    }

    setPets(prev => [...prev, newPet]);
    if (!activePet) {
      setActivePetState(newPet);
    }
    return newPet;
  };

  const setActivePet = (petId: string) => {
    const petToActivate = pets.find(p => p.id === petId) || null;
    setActivePetState(petToActivate);
    if (petToActivate) {
      localStorage.setItem('activePetId', petToActivate.id);
    } else {
      localStorage.removeItem('activePetId');
    }
  };
  
  const updatePet = async (petId: string, updates: Partial<Pet>) => {
    const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating pet:', error);
        throw error;
    }

    setPets(prev => prev.map(p => p.id === petId ? data : p));
    if (activePet?.id === petId) {
        setActivePetState(data);
    }
  };

  const deletePet = async (petId: string) => {
      const { error } = await supabase.from('pets').delete().eq('id', petId);
      if (error) {
          console.error('Error deleting pet:', error);
          throw error;
      }

      setPets(prev => prev.filter(p => p.id !== petId));
      if (activePet?.id === petId) {
          setActivePetState(pets.length > 1 ? pets[0] : null);
      }
  };

  return (
    <PetContext.Provider value={{
      pets,
      activePet,
      reminders,
      addPet,
      setActivePet,
      updatePet,
      deletePet,
      loading,
    }}>
      {children}
    </PetContext.Provider>
  );
}

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within PetProvider');
  }
  return context;
};