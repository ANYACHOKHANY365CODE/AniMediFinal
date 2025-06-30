import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
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
  addPet: (pet: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'care_guide'>) => Promise<Pet | undefined>;
  setActivePet: (pet: Pet | null) => void;
  updatePet: (pet: Pet) => void;
  deletePet: (petId: string) => void;
  medicalRecords: { [petId: string]: any[] };
  reminders: { [petId: string]: any[] };
  addMedicalRecord: (petId: string, record: any) => void;
  refreshActivePetDetails: () => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePetState] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<{ [petId: string]: any[] }>({});
  const [reminders, setReminders] = useState<{ [petId: string]: any[] }>({});

  const fetchPets = async (userId: string) => {
    if (!user) {
      setPets([]);
      setActivePetState(null);
      return;
    };
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pets:', error);
    } else {
      setPets(data || []);
      if (data && data.length > 0) {
        if (activePet) {
          const updatedActivePet = data.find(p => p.id === activePet.id);
          setActivePet(updatedActivePet || data[0]);
        } else {
          setActivePet(data[0]);
        }
      } else {
        setActivePet(null);
      }
    }
  };

  const fetchPetDetails = async (petId: string) => {
    const { data: recordsData, error: recordsError } = await supabase
      .from('medical_records')
      .select('*')
      .eq('pet_id', petId);
    
    if (recordsError) console.error('Error fetching medical records:', recordsError);
    else setMedicalRecords(prev => ({...prev, [petId]: recordsData || []}));

    const { data: remindersData, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .eq('pet_id', petId);

    if (remindersError) console.error('Error fetching reminders:', remindersError);
    else setReminders(prev => ({...prev, [petId]: remindersData || []}));
  }

  useEffect(() => {
    if (user) {
      fetchPets(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (activePet) {
      fetchPetDetails(activePet.id);
    }
  }, [activePet]);

  const addPet = async (pet: Omit<Pet, 'id' | 'user_id' | 'created_at' | 'care_guide'>) => {
    if (!user) return;

    const { data: newPet, error } = await supabase
      .from('pets')
      .insert({ ...pet, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding pet:', error);
      throw error;
    }
    
    setPets(prev => [...prev, newPet]);
    if (!activePet) {
      setActivePetState(newPet);
    }
    return newPet;
  };

  const addMedicalRecord = (petId: string, record: any) => {
    setMedicalRecords(prev => ({
      ...prev,
      [petId]: [...(prev[petId] || []), { ...record, id: Date.now().toString() }]
    }));
  };

  const setActivePet = (pet: Pet | null) => {
    setActivePetState(pet);
  };
  
  const updatePet = async (pet: Pet) => {
    const { data, error } = await supabase
        .from('pets')
        .update(pet)
        .eq('id', pet.id)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating pet:', error);
        throw error;
    }

    setPets(prev => prev.map(p => p.id === pet.id ? data : p));
    if (activePet?.id === pet.id) {
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

  const refreshActivePetDetails = async () => {
    if (activePet) {
      await fetchPetDetails(activePet.id);
      }
  };

  return (
    <PetContext.Provider
      value={{
        pets,
        activePet,
        addPet,
        setActivePet,
        updatePet,
        deletePet,
        medicalRecords,
        reminders,
        addMedicalRecord,
        refreshActivePetDetails,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export const usePet = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePet must be used within PetProvider');
  }
  return context;
};