import React from 'react';
import { X, Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilityName: string;
  reviews: any[];
  averageRating: number;
  totalReviews: number;
  onAddReview: (rating: number, comment: string, showName: boolean) => void;
  onDeleteReview: (reviewId: string) => void;
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  facilityName,
  reviews,
  averageRating,
  totalReviews,
  onAddReview,
  onDeleteReview
}) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [showName, setShowName] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setError('Please select a rating and enter a comment.');
      return;
    }
    setError('');
    setSubmitting(true);
    await onAddReview(rating, comment, showName);
    setRating(0);
    setComment('');
    setShowName(false);
    setSubmitting(false);
  };

  const renderStars = (ratingValue: number, onClick?: (val: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color="#F59E0B"
        fill={index < ratingValue ? "#F59E0B" : "none"}
        style={onClick ? { cursor: 'pointer' } : {}}
        onClick={onClick ? () => onClick(index + 1) : undefined}
      />
    ));
  };

  const displayReviews = reviews;

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
        {/* Add Review Form */}
        {user && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '24px', background: '#F9FAFB', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {error && (
              <div style={{ color: '#EF4444', fontSize: '13px', fontFamily: 'Nunito', marginBottom: '4px' }}>{error}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', fontFamily: 'Nunito' }}>Your Rating:</span>
              {renderStars(rating, setRating)}
            </div>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your review..."
              style={{ fontFamily: 'Nunito', fontSize: '14px', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '8px', resize: 'vertical', minHeight: '48px' }}
              maxLength={500}
              required
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', fontFamily: 'Nunito', marginTop: '4px' }}>
              <input
                type="checkbox"
                checked={showName}
                onChange={e => setShowName(e.target.checked)}
                style={{ accentColor: '#8B5CF6' }}
              />
              Show my name on this review
            </label>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Nunito',
                cursor: submitting ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-end',
                marginTop: '4px',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Add Review'}
            </button>
          </form>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#374151',
              fontFamily: 'Nunito',
              margin: 0
            }}>
              Reviews for {facilityName}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px'
            }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {renderStars(Math.round(averageRating))}
              </div>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                fontFamily: 'Nunito'
              }}>
                {averageRating.toFixed(1)}
              </span>
              <span style={{
                fontSize: '14px',
                color: '#6B7280',
                fontFamily: 'Nunito'
              }}>
                ({totalReviews} reviews)
              </span>
            </div>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {displayReviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6B7280', fontFamily: 'Nunito', fontSize: '15px', margin: '32px 0' }}>
              No reviews yet.
            </div>
          ) : (
            displayReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '12px',
                  padding: '16px',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '16px',
                      backgroundColor: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={16} color="#FFFFFF" />
                    </div>
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#374151',
                          fontFamily: 'Nunito'
                        }}>
                          {review.show_name ? (review.userName || review.user_name || review.profiles?.name || profile?.name || 'User') : 'Anonymous'}
                        </span>
                        {review.verified && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color: '#10B981',
                            backgroundColor: '#10B98120',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontFamily: 'Nunito'
                          }}>
                            VERIFIED
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: '#9CA3AF',
                    fontFamily: 'Nunito'
                  }}>
                    {review.date || new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {/* Delete button for own reviews */}
                  {user && review.user_id === user.id && (
                    <button
                      onClick={() => onDeleteReview(review.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginLeft: '12px',
                        fontFamily: 'Nunito'
                      }}
                      title="Delete review"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#6B7280',
                  fontFamily: 'Nunito',
                  lineHeight: '20px',
                  margin: 0
                }}>
                  {review.comment || review.review_text || 'Great service!'}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewsModal;