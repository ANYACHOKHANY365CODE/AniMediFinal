import React, { useState, useEffect } from 'react';
import { X, Plus, Heart, Edit, Trash2, Camera, Save, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePet } from '../contexts/PetContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PetProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NewPet {
  name: string;
  type: 'dog' | 'cat' | '';
  breed: string;
  age: string;
  weight: string;
  gender: 'male' | 'female' | '';
  avatar_url?: string;
  is_neutered: boolean;
  is_microchipped: boolean;
  allergies: string[];
}

const PetProfilesModal: React.FC<PetProfilesModalProps> = ({ isOpen, onClose }) => {
  const { pets, activePet, setActivePet, addPet, refreshActivePetDetails } = usePet() as any;
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [editingPet, setEditingPet] = useState<NewPet | null>(null);
  const [allergyInput, setAllergyInput] = useState('');
  const [newPet, setNewPet] = useState<NewPet>({
    name: '',
    type: '',
    breed: '',
    age: '',
    weight: '',
    gender: '',
    avatar_url: '',
    is_neutered: false,
    is_microchipped: false,
    allergies: []
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; petId: string | null }>({ open: false, petId: null });

  const handleStartEdit = (pet: any) => {
    setEditingPetId(pet.id);
    setEditingPet({
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age.toString(),
      weight: pet.weight.toString(),
      gender: pet.gender || '',
      avatar_url: pet.avatar_url,
      is_neutered: pet.is_neutered || false,
      is_microchipped: pet.is_microchipped || false,
      allergies: pet.allergies || []
    });
  };

  const handleCancelEdit = () => {
    setEditingPetId(null);
    setEditingPet(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPet || !editingPetId) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('pets')
        .update({
          name: editingPet.name,
          type: editingPet.type,
          breed: editingPet.breed,
          age: parseInt(editingPet.age),
          weight: parseFloat(editingPet.weight),
          gender: editingPet.gender || null,
          avatar_url: editingPet.avatar_url,
          is_neutered: editingPet.is_neutered,
          is_microchipped: editingPet.is_microchipped,
          allergies: editingPet.allergies
        })
        .eq('id', editingPetId);

      if (error) throw error;

      await refreshActivePetDetails();
      if (editingPetId && setActivePet) setActivePet(editingPetId);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error updating pet:', error);
    } finally {
      setIsLoading(false);
      setEditingPetId(null);
      setEditingPet(null);
    }
  };

  const handleAddAllergy = () => {
    if (!allergyInput.trim()) return;
    if (editingPet) {
      setEditingPet({
        ...editingPet,
        allergies: [...editingPet.allergies, allergyInput.trim()]
      });
    }
    setAllergyInput('');
  };

  const handleRemoveAllergy = (index: number) => {
    if (editingPet) {
      const newAllergies = [...editingPet.allergies];
      newAllergies.splice(index, 1);
      setEditingPet({
        ...editingPet,
        allergies: newAllergies
      });
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPet.name || !newPet.type || !newPet.breed || !newPet.age || !newPet.weight) {
      return;
    }

    try {
      setIsLoading(true);
      const addedPet = await addPet({
        name: newPet.name,
        type: newPet.type as 'dog' | 'cat',
        breed: newPet.breed,
        age: parseInt(newPet.age),
        weight: parseFloat(newPet.weight),
        gender: newPet.gender || 'male',
        avatar_url: newPet.avatar_url || undefined,
        is_neutered: newPet.is_neutered,
        is_microchipped: newPet.is_microchipped,
        allergies: newPet.allergies
      });
      if (addedPet && setActivePet) setActivePet(addedPet.id);
      await refreshActivePetDetails();
      setNewPet({
        name: '',
        type: '',
        breed: '',
        age: '',
        weight: '',
        gender: '',
        avatar_url: '',
        is_neutered: false,
        is_microchipped: false,
        allergies: []
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding pet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePet = async (petId: string) => {
    setConfirmDelete({ open: true, petId });
  };

  const confirmDeletePet = async () => {
    if (!confirmDelete.petId) return;
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', confirmDelete.petId);
      if (error) throw error;
      await refreshActivePetDetails();
      // Fetch updated pets list from context after refresh
      if (user && user.id) {
        const { data: updatedPets } = await supabase
          .from('pets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        if (updatedPets && updatedPets.length > 0 && setActivePet) {
          setActivePet(updatedPets[0].id);
        } else if (setActivePet) {
          setActivePet(null);
        }
      } else if (setActivePet) {
        setActivePet(null);
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
    } finally {
      setIsLoading(false);
      setConfirmDelete({ open: false, petId: null });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isEditing && editingPet) {
          setEditingPet({ ...editingPet, avatar_url: e.target?.result as string });
        } else {
        setNewPet({ ...newPet, avatar_url: e.target?.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            margin: 0
          }}>
            Pet Profiles
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: '#F3F4F6',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} color="#374151" />
          </button>
        </div>

        {!showAddForm ? (
          <>
            {/* Pet List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {pets.map((pet: any) => (
                <div
                  key={pet.id}
                  onClick={() => {
                    if (editingPetId !== pet.id && setActivePet) setActivePet(pet.id);
                  }}
                  style={{
                    backgroundColor: activePet?.id === pet.id ? 'rgba(139, 92, 246, 0.1)' : '#F9FAFB',
                    borderRadius: '12px',
                    padding: '16px',
                    border: activePet?.id === pet.id ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                    cursor: editingPetId !== pet.id ? 'pointer' : 'default'
                  }}
                >
                  {editingPetId === pet.id ? (
                    // Edit Mode
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Photo Upload */}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '50px',
                          backgroundColor: '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 12px',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer'
                        }}>
                          {editingPet?.avatar_url ? (
                            <img 
                              src={editingPet.avatar_url} 
                              alt={editingPet.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '40px' }}>
                              {editingPet?.type === 'dog' ? '🐕' : '🐱'}
                            </span>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              opacity: 0,
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          color: '#8B5CF6',
                          fontSize: '14px',
                          fontFamily: 'Nunito'
                        }}>
                          <Camera size={16} />
                          Change Photo
                        </div>
                      </div>

                      {/* Basic Information */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input
                          type="text"
                          value={editingPet?.name}
                          onChange={(e) => setEditingPet(prev => prev ? { ...prev, name: e.target.value } : null)}
                          placeholder="Pet Name"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '16px'
                          }}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPet(prev => prev ? { ...prev, type: 'dog' } : null);
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: editingPet?.type === 'dog' ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                              borderRadius: '8px',
                              backgroundColor: editingPet?.type === 'dog' ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF',
                              cursor: 'pointer'
                            }}
                          >
                            🐕 Dog
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPet(prev => prev ? { ...prev, type: 'cat' } : null);
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              border: editingPet?.type === 'cat' ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                              borderRadius: '8px',
                              backgroundColor: editingPet?.type === 'cat' ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF',
                              cursor: 'pointer'
                            }}
                          >
                            🐱 Cat
                          </button>
                        </div>

                        <input
                          type="text"
                          value={editingPet?.breed}
                          onChange={(e) => setEditingPet(prev => prev ? { ...prev, breed: e.target.value } : null)}
                          placeholder="Breed"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '16px'
                          }}
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <input
                            type="number"
                            value={editingPet?.age}
                            onChange={(e) => setEditingPet(prev => prev ? { ...prev, age: e.target.value } : null)}
                            placeholder="Age (years)"
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #E5E7EB',
                              fontSize: '16px'
                            }}
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={editingPet?.weight}
                            onChange={(e) => setEditingPet(prev => prev ? { ...prev, weight: e.target.value } : null)}
                            placeholder="Weight (kg)"
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #E5E7EB',
                              fontSize: '16px'
                            }}
                          />
                        </div>

                        <select
                          value={editingPet?.gender}
                          onChange={(e) => setEditingPet(prev => prev ? { ...prev, gender: e.target.value as 'male' | 'female' | '' } : null)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            fontSize: '16px'
                          }}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={editingPet?.is_neutered}
                              onChange={(e) => setEditingPet(prev => prev ? { ...prev, is_neutered: e.target.checked } : null)}
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                accentColor: '#8B5CF6'
                              }}
                            />
                            <span>Neutered/Spayed</span>
                          </label>
                          <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                          }}>
                            <input
                              type="checkbox"
                              checked={editingPet?.is_microchipped}
                              onChange={(e) => setEditingPet(prev => prev ? { ...prev, is_microchipped: e.target.checked } : null)}
                              style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                accentColor: '#8B5CF6'
                              }}
                            />
                            <span>Microchipped</span>
                          </label>
                        </div>

                        {/* Allergies Section */}
                        <div>
                          <label style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'block'
                          }}>
                            Allergies
                          </label>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                              type="text"
                              value={allergyInput}
                              onChange={(e) => setAllergyInput(e.target.value)}
                              placeholder="Add allergy"
                              style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid #E5E7EB',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleAddAllergy}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#8B5CF6',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                            >
                              Add
                            </button>
                          </div>
                          {editingPet?.allergies && editingPet.allergies.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {editingPet.allergies.map((allergy: string, index: number) => (
                                <span
                                  key={index}
                                  style={{
                                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                    color: '#8B5CF6',
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {allergy}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveAllergy(index);
                                    }}
                                    style={{
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      color: '#8B5CF6',
                                      cursor: 'pointer',
                                      padding: '0 4px',
                                      fontSize: '16px',
                                      lineHeight: '1'
                                    }}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#F3F4F6',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <XCircle size={16} />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            disabled={isLoading}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#8B5CF6',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            <Save size={16} />
                            {isLoading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '40px',
                      backgroundColor: '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        marginRight: '16px',
                      overflow: 'hidden'
                    }}>
                      {pet.avatar_url ? (
                        <img 
                          src={pet.avatar_url} 
                          alt={pet.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                          <span style={{ fontSize: '32px' }}>
                          {pet.type === 'dog' ? '🐕' : '🐱'}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                      <h3 style={{
                              fontSize: '18px',
                        fontWeight: '700',
                        color: '#374151',
                              margin: '0 0 4px 0'
                      }}>
                        {pet.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6B7280',
                              margin: '0 0 8px 0'
                      }}>
                        {pet.breed} • {pet.age} years • {pet.weight}kg
                              {pet.gender && ` • ${pet.gender}`}
                            </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(pet);
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '16px',
                                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit size={16} color="#8B5CF6" />
                            </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePet(pet.id);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '16px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    </div>
                  </div>
                        
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            {pet.is_neutered && (
                              <span style={{
                                fontSize: '12px',
                                color: '#059669',
                                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}>
                                Neutered/Spayed
                              </span>
                            )}
                            {pet.is_microchipped && (
                              <span style={{
                                fontSize: '12px',
                                color: '#2563EB',
                                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}>
                                Microchipped
                              </span>
                            )}
                          </div>
                          
                          {pet.allergies && pet.allergies.length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              <div style={{
                                fontSize: '12px',
                                color: '#6B7280',
                                marginBottom: '4px'
                              }}>
                                Allergies:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {pet.allergies.map((allergy: string, index: number) => (
                                  <span
                                    key={index}
                                    style={{
                                      fontSize: '12px',
                                      color: '#DC2626',
                                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                                      padding: '2px 8px',
                                      borderRadius: '12px'
                                    }}
                                  >
                                    {allergy}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {activePet?.id === pet.id && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#8B5CF6'
                          }}>
                            Active Pet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Pet Button */}
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                fontFamily: 'Nunito',
                cursor: 'pointer',
                gap: '8px'
              }}
            >
              <Plus size={20} />
              Add New Pet
            </button>
          </>
        ) : (
          /* Add Pet Form */
          <form onSubmit={handleAddPet}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Pet Photo */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50px',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}>
                  {newPet.avatar_url ? (
                    <img 
                      src={newPet.avatar_url} 
                      alt="Pet" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '40px' }}>
                      {newPet.type === 'dog' ? '🐕' : newPet.type === 'cat' ? '🐱' : '📷'}
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  color: '#8B5CF6',
                  fontSize: '14px',
                  fontFamily: 'Nunito'
                }}>
                  <Camera size={16} />
                  Add Photo
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'Nunito',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  placeholder="e.g., Buddy, Whiskers"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'Nunito',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Species *
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setNewPet({ ...newPet, type: 'dog' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: newPet.type === 'dog' ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                      borderRadius: '8px',
                      backgroundColor: newPet.type === 'dog' ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'Nunito'
                    }}
                  >
                    🐕 Dog
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPet({ ...newPet, type: 'cat' })}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: newPet.type === 'cat' ? '2px solid #8B5CF6' : '1px solid #E5E7EB',
                      borderRadius: '8px',
                      backgroundColor: newPet.type === 'cat' ? 'rgba(139, 92, 246, 0.1)' : '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'Nunito'
                    }}
                  >
                    🐱 Cat
                  </button>
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'Nunito',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Breed *
                </label>
                <input
                  type="text"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                  placeholder="e.g., Golden Retriever, Persian"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    fontFamily: 'Nunito',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Age (years) *
                  </label>
                  <input
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet({ ...newPet, age: e.target.value })}
                    placeholder="e.g., 3"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: 'Nunito',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    fontFamily: 'Nunito',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPet.weight}
                    onChange={(e) => setNewPet({ ...newPet, weight: e.target.value })}
                    placeholder="e.g., 15.5"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: 'Nunito',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'Nunito',
                  marginBottom: '8px',
                  display: 'block'
                }}>
                  Gender
                </label>
                <select
                  value={newPet.gender}
                  onChange={(e) => setNewPet({ ...newPet, gender: e.target.value as 'male' | 'female' | '' })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'Nunito',
                    outline: 'none'
                  }}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newPet.is_neutered}
                    onChange={e => setNewPet({ ...newPet, is_neutered: e.target.checked })}
                    style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: '#8B5CF6' }}
                  />
                  <span>Neutered/Spayed</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newPet.is_microchipped}
                    onChange={e => setNewPet({ ...newPet, is_microchipped: e.target.checked })}
                    style={{ width: '16px', height: '16px', borderRadius: '4px', accentColor: '#8B5CF6' }}
                  />
                  <span>Microchipped</span>
                </label>
              </div>

              {/* Allergies Section */}
              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block' }}>
                  Allergies
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={e => setAllergyInput(e.target.value)}
                    placeholder="Add allergy"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (allergyInput.trim()) {
                        setNewPet({ ...newPet, allergies: [...newPet.allergies, allergyInput.trim()] });
                        setAllergyInput('');
                      }
                    }}
                    style={{ padding: '8px 16px', backgroundColor: '#8B5CF6', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                </div>
                {newPet.allergies && newPet.allergies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {newPet.allergies.map((allergy: string, index: number) => (
                      <span
                        key={index}
                        style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', padding: '4px 12px', borderRadius: '16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {allergy}
                        <button
                          type="button"
                          onClick={() => setNewPet({ ...newPet, allergies: newPet.allergies.filter((_, i) => i !== index) })}
                          style={{ backgroundColor: 'transparent', border: 'none', color: '#8B5CF6', cursor: 'pointer', padding: '0 4px', fontSize: '16px', lineHeight: '1' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    fontFamily: 'Nunito',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    backgroundColor: isLoading ? '#9CA3AF' : '#8B5CF6',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    fontFamily: 'Nunito',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Adding...' : 'Add Pet'}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default PetProfilesModal;