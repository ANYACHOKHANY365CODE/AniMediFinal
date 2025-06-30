import React, { useState } from 'react';
import { Camera, Upload, Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePet } from '../contexts/PetContext';

const ProfileSetupScreen: React.FC = () => {
  const [petName, setPetName] = useState('');
  const [type, setType] = useState<'cat' | 'dog' | ''>('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isNeutered, setIsNeutered] = useState(false);
  const [isMicrochipped, setIsMicrochipped] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { addPet } = usePet();
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (1MB limit)
      if (file.size > 1024 * 1024) {
        setError('File size must be less than 1MB');
        return;
      }
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('Only JPEG and PNG images are allowed');
        return;
      }
      setPhoto(file);
      setError(null);
    }
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!petName || !type || !breed || !age || !weight || !gender) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);

      let avatarUrl = undefined;
      if (photo) {
        // Convert photo to base64
        const reader = new FileReader();
        avatarUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
      }

      const newPet = await addPet({
        name: petName,
        type: type as 'dog' | 'cat',
        breed,
        age: parseInt(age),
        weight: parseFloat(weight),
        gender,
        is_neutered: isNeutered,
        is_microchipped: isMicrochipped,
        allergies,
        avatar_url: avatarUrl,
      });
      
      // Trigger AI care guide generation in the background
      fetch('http://localhost:3000/api/generate-care-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pet: newPet }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Care guide generation initiated successfully.');
        } else {
          console.error('Failed to initiate care guide generation:', data.error);
        }
      })
      .catch(err => console.error('Error calling care guide API:', err));

      navigate('/medicare');
    } catch (error) {
      console.error('Error creating pet profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to create pet profile');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Heart size={40} color="#8B5CF6" strokeWidth={2} />
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#374151',
            marginTop: '16px',
            marginBottom: '8px',
            fontFamily: 'Nunito'
          }}>
            Let's Meet Your Pet! 🐾
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            fontFamily: 'Nunito'
          }}>
            Tell us about your furry friend to get personalized care
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontFamily: 'Nunito'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.1)',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {photo ? (
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Pet" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Upload size={32} color="#8B5CF6" />
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#8B5CF6',
                    marginTop: '8px',
                    fontFamily: 'Nunito'
                  }}>
                    Add Photo
                  </p>
                </div>
              )}
            </div>
            <label 
              htmlFor="photo-upload"
              style={{
              position: 'absolute',
              bottom: '0',
              right: 'calc(50% - 60px + 18px)',
              backgroundColor: '#8B5CF6',
              width: '36px',
              height: '36px',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
              cursor: 'pointer'
              }}
            >
              <Camera size={20} color="#FFFFFF" />
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: '0',
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0,0,0,0)',
                  border: '0'
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'block',
              fontFamily: 'Nunito'
            }}>
              Pet Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Buddy, Whiskers"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                fontSize: '16px',
                fontFamily: 'Nunito',
                color: '#374151',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'block',
              fontFamily: 'Nunito'
            }}>
              Type *
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setType('dog')}
                style={{
                  flex: 1,
                  backgroundColor: type === 'dog' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  border: type === 'dog' ? '2px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: type === 'dog' ? '#8B5CF6' : '#6B7280',
                  cursor: 'pointer',
                  fontFamily: 'Nunito',
                  transition: 'all 0.3s ease'
                }}
              >
                🐕 Dog
              </button>
              <button
                type="button"
                onClick={() => setType('cat')}
                style={{
                  flex: 1,
                  backgroundColor: type === 'cat' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  border: type === 'cat' ? '2px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: type === 'cat' ? '#8B5CF6' : '#6B7280',
                  cursor: 'pointer',
                  fontFamily: 'Nunito',
                  transition: 'all 0.3s ease'
                }}
              >
                🐱 Cat
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'block',
              fontFamily: 'Nunito'
            }}>
              Breed *
            </label>
            <input
              type="text"
              placeholder="e.g., Golden Retriever, Persian"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                fontSize: '16px',
                fontFamily: 'Nunito',
                color: '#374151',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
                fontFamily: 'Nunito'
              }}>
                Age (years) *
              </label>
              <input
                type="number"
                placeholder="e.g., 3"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                step="1"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  fontSize: '16px',
                  fontFamily: 'Nunito',
                  color: '#374151',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
                fontFamily: 'Nunito'
              }}>
                Weight (kg) *
              </label>
              <input
                type="number"
                placeholder="e.g., 15.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                step="0.1"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  fontSize: '16px',
                  fontFamily: 'Nunito',
                  color: '#374151',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
                }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'block',
              fontFamily: 'Nunito'
            }}>
              Gender *
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setGender('male')}
                style={{
                  flex: 1,
                  backgroundColor: gender === 'male' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  border: gender === 'male' ? '2px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: gender === 'male' ? '#8B5CF6' : '#6B7280',
                  cursor: 'pointer',
                  fontFamily: 'Nunito',
                  transition: 'all 0.3s ease'
                }}
              >
                ♂️ Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                style={{
                  flex: 1,
                  backgroundColor: gender === 'female' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255, 255, 255, 0.9)',
                  border: gender === 'female' ? '2px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: gender === 'female' ? '#8B5CF6' : '#6B7280',
                  cursor: 'pointer',
                  fontFamily: 'Nunito',
                  transition: 'all 0.3s ease'
                }}
              >
                ♀️ Female
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontFamily: 'Nunito'
              }}>
                <input
                  type="checkbox"
                  checked={isNeutered}
                  onChange={(e) => setIsNeutered(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    accentColor: '#8B5CF6'
                  }}
                />
                <span style={{ color: '#374151', fontSize: '16px' }}>Neutered/Spayed</span>
              </label>
            </div>
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontFamily: 'Nunito'
              }}>
                <input
                  type="checkbox"
                  checked={isMicrochipped}
                  onChange={(e) => setIsMicrochipped(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    accentColor: '#8B5CF6'
                  }}
                />
                <span style={{ color: '#374151', fontSize: '16px' }}>Microchipped</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              display: 'block',
              fontFamily: 'Nunito'
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
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.1)',
                  fontSize: '16px',
                  fontFamily: 'Nunito',
                  color: '#374151',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                style={{
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Nunito'
                }}
              >
                Add
              </button>
            </div>
            {allergies.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {allergies.map((allergy, index) => (
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
                      gap: '4px',
                      fontFamily: 'Nunito'
                    }}
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(index)}
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

          <button
            type="submit"
            disabled={isLoading}
            className="btn-hover"
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#A78BFA' : '#8B5CF6',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '700',
              fontFamily: 'Nunito',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Creating Profile...' : 'Create Profile'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetupScreen;