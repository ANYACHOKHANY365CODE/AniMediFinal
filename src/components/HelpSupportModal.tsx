import React, { useState } from 'react';
import { X, HelpCircle, Book, Star, ChevronLeft, Info, Lock, FileText, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      description: 'Learn the basics of using AniMedi',
      content: `
        <h3>Welcome to AniMedi!</h3>
        <p>Here's how to get started with our platform:</p>
        <ul>
          <li><strong>Adding Your First Pet:</strong> Click on "Pet Profiles" in your account settings. Fill in your pet's details including name, species, breed, and any medical conditions.</li>
          <li><strong>Setting Up Health Reminders:</strong> Navigate to the Reminders section to set up vaccination schedules, medication times, and vet appointments.</li>
          <li><strong>Booking Consultations:</strong> Use our Veterinarians section to find and book video consultations with qualified vets.</li>
          <li><strong>Using Your Dashboard:</strong> Your dashboard shows upcoming appointments, reminders, and your pet's health status at a glance.</li>
        </ul>
        <p>For more specific questions, feel free to ask our helpful AI Assistant directly from the dashboard!</p>
      `
    },
    {
      id: 'medical-records',
      title: 'Medical Records',
      icon: HelpCircle,
      description: 'Managing your pet\'s health documents',
      content: `
        <h3>Managing Medical Records</h3>
        <p>Keep your pet's health history organized:</p>
        <ul>
          <li><strong>Uploading Records:</strong> In the Medical Records section, click the upload button to add new documents or images.</li>
          <li><strong>OCR Technology:</strong> Our system automatically extracts text from uploaded documents for easy searching.</li>
          <li><strong>Record Organization:</strong> Records are automatically sorted by date and type. Use filters to find specific records quickly.</li>
          <li><strong>Sharing with Vets:</strong> During consultations, you can easily share relevant records with veterinarians.</li>
        </ul>
      `
    },
    {
      id: 'bookings',
      title: 'Bookings & Appointments',
      icon: Star,
      description: 'Help with consultations and services',
      content: `
        <h3>Managing Your Appointments</h3>
        <p>Everything about booking and managing appointments:</p>
        <ul>
          <li><strong>Booking a Consultation:</strong> Browse available vets, check their schedules, and book a slot that works for you.</li>
          <li><strong>Rescheduling:</strong> Need to change your appointment? Click on the appointment and select "Reschedule" at least 2 hours before.</li>
          <li><strong>Video Calls:</strong> Join video calls directly through our platform. Ensure good internet connectivity and camera access.</li>
          <li><strong>Dog Walking Services:</strong> Find verified dog walkers in your area, view their profiles, and book walks.</li>
        </ul>
      `
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: User,
      description: 'Managing your account and preferences',
      content: `
        <h3>Account Management</h3>
        <p>Customize your AniMedi experience:</p>
        <ul>
          <li><strong>Profile Updates:</strong> Keep your contact information and preferences up to date in Profile Settings.</li>
          <li><strong>Notifications:</strong> Choose how and when you want to receive reminders and updates.</li>
          <li><strong>Privacy Settings:</strong> Control what information is shared and who can see your pet's profiles.</li>
          <li><strong>Multiple Pets:</strong> Add and manage multiple pets under a single account easily.</li>
        </ul>
      `
    }
  ];

  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
          .help-content h3 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #1F2937;
          }
          .help-content p {
            margin-bottom: 16px;
          }
          .help-content ul {
            padding-left: 20px;
            margin-bottom: 16px;
          }
          .help-content li {
            margin-bottom: 8px;
          }
          .help-content strong {
            color: #1F2937;
            font-weight: 600;
          }
        `}
      </style>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
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
                  <ChevronLeft size={20} color="#374151" />
                </button>
              )}
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#374151',
                fontFamily: 'Nunito',
                margin: 0
              }}>
                {selectedCategory 
                  ? helpCategories.find(cat => cat.id === selectedCategory)?.title 
                  : 'Help & Support'}
              </h2>
            </div>
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

          {selectedCategory ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: helpCategories.find(cat => cat.id === selectedCategory)?.content || ''
              }}
              style={{
                color: '#374151',
                fontFamily: 'Nunito',
                lineHeight: '1.6'
              }}
              className="help-content"
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                fontFamily: 'Nunito',
                marginBottom: '8px'
              }}>
                Browse Help Topics
              </h3>
              {helpCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <category.icon size={24} color="#8B5CF6" />
                  <div>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#374151',
                      fontFamily: 'Nunito',
                      margin: 0
                    }}>
                      {category.title}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#6B7280',
                      fontFamily: 'Nunito',
                      margin: '4px 0 0 0'
                    }}>
                      {category.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default HelpSupportModal;