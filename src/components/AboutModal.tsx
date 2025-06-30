import React from 'react';
import { X, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
      zIndex: 1050,
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
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#374151', fontFamily: 'Nunito', margin: 0 }}>
            About
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

        <div style={{ fontFamily: 'Nunito', color: '#4B5563', lineHeight: '1.6' }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
                <Heart size={24} color="#8B5CF6" />
                <h3 style={{fontSize: '18px', fontWeight: 'bold', color: '#374151', margin: 0}}>AniMedi</h3>
            </div>
            <p style={{margin: '0 0 16px 0'}}>
              <strong>Our Mission:</strong> To empower pet owners with the tools and information they need to provide the best possible care for their beloved companions. We believe that proactive, informed pet care leads to happier, healthier lives.
            </p>
            <p style={{margin: 0}}>
              AniMedi is a comprehensive pet healthcare platform designed to be your all-in-one digital companion for pet wellness. From 24/7 vet consultations to managing complex medical records with OCR, we've built the tools you need for modern pet parenting.
            </p>
            <p style={{marginTop: '24px', fontSize: '12px', color: '#6B7280', textAlign: 'center'}}>
              Version: 1.0.0
            </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutModal; 