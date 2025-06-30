import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Star, Stethoscope, Heart, Pill, Scissors, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHealthcareFacilities } from '../hooks/useHealthcareFacilities';
import ReviewsModal from '../components/ReviewsModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  {
    id: 'diagnostic',
    name: 'Diagnostic Centers',
    icon: Stethoscope,
    color: '#8B5CF6',
    description: 'X-rays, blood tests, and health screenings',
  },
  {
    id: 'paramedic',
    name: 'Emergency Care',
    icon: Heart,
    color: '#EF4444',
    description: 'Emergency services and urgent care',
  },
  {
    id: 'pharmacy',
    name: 'Pet Pharmacies',
    icon: Pill,
    color: '#10B981',
    description: 'Medications and health supplements',
  },
  {
    id: 'neutering',
    name: 'Spay & Neuter',
    icon: Scissors,
    color: '#F59E0B',
    description: 'Neutering and microchipping services',
  },
];

// Utility to check if facility is open right now
function isFacilityOpen(workingHours: any): boolean {
  if (!workingHours) return false;
  const days = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const now = new Date();
  const today = days[now.getDay()];
  const todayHours = workingHours[today];
  if (!todayHours) return false; // closed today
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  const openTime = new Date(now);
  openTime.setHours(openHour, openMin, 0, 0);
  const closeTime = new Date(now);
  closeTime.setHours(closeHour, closeMin, 0, 0);
  return now >= openTime && now <= closeTime;
}

// Utility to get today's open/close string
function getTodayOpenClose(workingHours: any): string {
  if (!workingHours) return 'Closed today';
  const days = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];
  const now = new Date();
  const today = days[now.getDay()];
  const todayHours = workingHours[today];
  if (!todayHours) return 'Closed today';
  return `Open: ${todayHours.open} - ${todayHours.close}`;
}

const HealthcareScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [facilityReviews, setFacilityReviews] = useState<any[]>([]);
  const [facilityReviewsMap, setFacilityReviewsMap] = useState<{ [facilityId: string]: any[] }>({});
  const [facilityAverageRatingMap, setFacilityAverageRatingMap] = useState<{ [facilityId: string]: number }>({});
  const [facilityReviewStats, setFacilityReviewStats] = useState<{ [facilityId: string]: { count: number, avg: number } }>({});
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFacilities() {
      const { data, error } = await supabase
        .from('healthcare_facilities')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) {
        setFacilities(data);
      }
    }
    fetchFacilities();
  }, []);

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || facility.facility_type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleReviewsClick = async (facility: any) => {
    setSelectedFacility(facility);
    // Fetch reviews from supabase
    const { data: reviews, error } = await supabase
      .from('healthcare_reviews')
      .select('*')
      .eq('facility_id', facility.id)
      .order('created_at', { ascending: false });
    if (!error) {
      setFacilityReviewsMap(prev => ({ ...prev, [facility.id]: reviews || [] }));
      setFacilityReviews(reviews || []);
      // Calculate average rating
      const avg = reviews && reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) : 0;
      setFacilityAverageRatingMap(prev => ({ ...prev, [facility.id]: avg }));
    } else {
      setFacilityReviews([]);
      setFacilityAverageRatingMap(prev => ({ ...prev, [facility.id]: 0 }));
    }
    setShowReviews(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'diagnostic': return Stethoscope;
      case 'paramedic': return Heart;
      case 'pharmacy': return Pill;
      case 'neutering': return Scissors;
      default: return Stethoscope;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnostic': return '#8B5CF6';
      case 'paramedic': return '#EF4444';
      case 'pharmacy': return '#10B981';
      case 'neutering': return '#F59E0B';
      default: return '#8B5CF6';
    }
  };

  // Add Review Handler
  const handleAddReview = async (rating: number, comment: string, showName: boolean) => {
    if (!user || !selectedFacility) return;
    if (!rating || !comment.trim()) {
      alert('Please select a rating and enter a comment.');
      return;
    }
    const { error } = await supabase.from('healthcare_reviews').insert({
      facility_id: selectedFacility.id,
      user_id: user.id,
      rating,
      comment,
      show_name: showName
    });
    if (error) {
      alert('Error adding review: ' + error.message);
      return;
    }
    // Refetch reviews and stats
    await handleReviewsClick(selectedFacility);
    await fetchAllReviewStats();
  };

  // Delete Review Handler
  const handleDeleteReview = async (reviewId: string) => {
    if (!user) return;
    await supabase.from('healthcare_reviews').delete().eq('id', reviewId).eq('user_id', user.id);
    // Refetch reviews and stats
    if (selectedFacility) {
      await handleReviewsClick(selectedFacility);
      await fetchAllReviewStats();
    }
  };

  // Move fetchAllReviewStats to top-level so it can be called from handlers
  async function fetchAllReviewStats() {
    const { data, error } = await supabase
      .from('healthcare_reviews')
      .select('facility_id, rating');
    if (!error && data) {
      const tempStats: { [facilityId: string]: { count: number; sum: number } } = {};
      data.forEach((review: any) => {
        if (!tempStats[review.facility_id]) {
          tempStats[review.facility_id] = { count: 0, sum: 0 };
        }
        tempStats[review.facility_id].count += 1;
        tempStats[review.facility_id].sum += review.rating || 0;
      });
      const stats: { [facilityId: string]: { count: number; avg: number } } = {};
      Object.keys(tempStats).forEach(fid => {
        const { count, sum } = tempStats[fid];
        stats[fid] = { count, avg: count > 0 ? sum / count : 0 };
      });
      setFacilityReviewStats(stats);
    }
  }

  useEffect(() => {
    fetchAllReviewStats();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E6FA 0%, #F0F8FF 100%)'
    }}>
      <div style={{ padding: '0 20px' }}>
        {/* Header */}
        <div style={{
          paddingTop: '60px',
          paddingBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            margin: 0
          }}>
            Healthcare Facilities
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6B7280',
            fontFamily: 'Nunito',
            marginTop: '4px',
            margin: 0
          }}>
            Find the best care for your pet
          </p>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)'
          }}>
            <Search size={20} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                marginLeft: '12px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: 'Nunito',
                color: '#374151',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            fontFamily: 'Nunito',
            marginBottom: '16px'
          }}>
            Browse by Category
          </h2>
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '16px',
            paddingBottom: '8px'
          }}>
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                  className="card-hover"
                  style={{
                    minWidth: '160px',
                    backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
                    border: isSelected ? '2px solid #8B5CF6' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '24px',
                    backgroundColor: `${category.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <IconComponent size={24} color={category.color} />
                  </div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: isSelected ? '#8B5CF6' : '#374151',
                    fontFamily: 'Nunito',
                    marginBottom: '4px',
                    margin: 0
                  }}>
                    {category.name}
                  </h4>
                  <p style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontFamily: 'Nunito',
                    lineHeight: '16px',
                    margin: 0
                  }}>
                    {category.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Facilities List */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#374151',
              fontFamily: 'Nunito',
              margin: 0
            }}>
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory)?.name 
                : 'All Facilities'
              }
            </h2>
            <span style={{
              fontSize: '14px',
              color: '#6B7280',
              fontFamily: 'Nunito'
            }}>
              {filteredFacilities.length} results
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredFacilities.map((facility, index) => {
              const TypeIcon = getTypeIcon(facility.facility_type);
              const typeColor = getTypeColor(facility.facility_type);
              
              return (
                <motion.div
                  key={facility.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card-hover"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '20px',
                      backgroundColor: `${typeColor}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <TypeIcon size={20} color={typeColor} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#374151',
                        fontFamily: 'Nunito',
                        marginBottom: '4px',
                        margin: 0
                      }}>
                        {facility.name}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} color="#F59E0B" fill="#F59E0B" />
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#374151',
                            fontFamily: 'Nunito'
                          }}>
                            {(facilityReviewStats[facility.id]?.avg ?? 0).toFixed(1)}
                          </span>
                        </div>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewsClick(facility);
                          }}
                          style={{
                            fontSize: '12px',
                            color: '#8B5CF6',
                            fontFamily: 'Nunito',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                        >
                          ({facilityReviewStats[facility.id]?.count ?? 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#6B7280" />
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          fontSize: '14px',
                          color: '#6B7280',
                          fontFamily: 'Nunito',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                          padding: 0
                        }}
                      >
                        {facility.address}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={16} color="#6B7280" />
                      <a
                        href={`tel:${facility.phone.replace(/[^\d+]/g, '')}`}
                        style={{
                          fontSize: '14px',
                          color: '#6B7280',
                          fontFamily: 'Nunito',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                          padding: 0
                        }}
                      >
                        {facility.phone}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{
                        color: isFacilityOpen(facility.working_hours) ? '#10B981' : '#EF4444',
                        fontWeight: 600,
                        fontFamily: 'Nunito',
                        fontSize: '13px',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        background: isFacilityOpen(facility.working_hours) ? '#ECFDF5' : '#FEF2F2'
                      }}>
                        {isFacilityOpen(facility.working_hours) ? 'Open' : 'Closed'}
                      </span>
                      <span style={{ color: '#6B7280', fontSize: '13px', fontFamily: 'Nunito' }}>
                        {getTodayOpenClose(facility.working_hours)}
                      </span>
                    </div>
                    {facility.paramedics_available && (
                      <div style={{ color: '#10B981', fontWeight: 600, fontFamily: 'Nunito', fontSize: '13px' }}>
                        Paramedics Available
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Modal */}
      {selectedFacility && (
        <ReviewsModal
          isOpen={showReviews}
          onClose={() => setShowReviews(false)}
          facilityName={selectedFacility?.name || ''}
          reviews={facilityReviews}
          averageRating={facilityReviewStats[selectedFacility?.id]?.avg ?? 0}
          totalReviews={facilityReviewStats[selectedFacility?.id]?.count ?? 0}
          onAddReview={handleAddReview}
          onDeleteReview={handleDeleteReview}
        />
      )}
    </div>
  );
};

export default HealthcareScreen;