import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Calendar, Clock, User, Phone, Video, Edit3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePet } from '../contexts/PetContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingDetails: any) => void;
  serviceProvider: any;
  serviceType: 'vet_consultation' | 'facility_booking';
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onConfirm, serviceProvider, serviceType }) => {
  const { activePet } = usePet();
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    duration: 30,
    contactMethod: 'video',
    notes: ''
  });

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDetails.date || !bookingDetails.time) {
      alert('Please select a date and time.');
      return;
    }
    onConfirm(bookingDetails);
  };

  if (!isOpen || !modalRoot) {
    return null;
  }

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '500px',
          fontFamily: 'Nunito, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
            Book Appointment
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
            <X size={28} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '16px', marginBottom: '24px' }}>
          <img 
            src={serviceProvider.photo_url || 'https://via.placeholder.com/150'} 
            alt={serviceProvider.name} 
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginRight: '16px' }} 
          />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151', margin: 0 }}>{serviceProvider.name}</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>{serviceProvider.specialty || serviceProvider.type}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label htmlFor="date" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={20} style={{ position: 'absolute', top: '13px', left: '12px', color: '#9CA3AF' }} />
                <input type="date" id="date" name="date" value={bookingDetails.date} onChange={handleInputChange} required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '14px' }}/>
              </div>
            </div>
            <div>
              <label htmlFor="time" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Time</label>
              <div style={{ position: 'relative' }}>
                <Clock size={20} style={{ position: 'absolute', top: '13px', left: '12px', color: '#9CA3AF' }} />
                <input type="time" id="time" name="time" value={bookingDetails.time} onChange={handleInputChange} required style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '14px' }}/>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
             <label htmlFor="contactMethod" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Consultation Type</label>
             <div style={{ display: 'flex', gap: '10px' }}>
                {['video', 'phone', 'chat'].map(method => (
                  <button 
                    key={method}
                    type="button"
                    onClick={() => setBookingDetails(prev => ({ ...prev, contactMethod: method }))}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: `2px solid ${bookingDetails.contactMethod === method ? '#8B5CF6' : '#E5E7EB'}`,
                      backgroundColor: bookingDetails.contactMethod === method ? '#F5F3FF' : 'white',
                      color: bookingDetails.contactMethod === method ? '#8B5CF6' : '#4B5563',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                      {method === 'video' && <Video size={18} />}
                      {method === 'phone' && <Phone size={18} />}
                      {method === 'chat' && <Edit3 size={18} />}
                      <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                  </button>
                ))}
             </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="notes" style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Notes for the Doctor (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={bookingDetails.notes}
              onChange={handleInputChange}
              placeholder={`Booking for ${activePet?.name || 'my pet'}. Any specific concerns?`}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            Confirm Booking
            <ArrowRight size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, modalRoot);
};

export default BookingModal; 