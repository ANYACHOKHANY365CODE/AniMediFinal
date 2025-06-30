/*
  # Sample Data Population for AniMedi

  1. Views
    - Create aggregated rating views for facilities and walkers
    - Create review views with user information

  2. Sample Data
    - Healthcare facilities with realistic information
    - Veterinarians with specialties and availability
    - Dog walkers with experience and pricing
    - Pet care tips for dogs and cats

  3. Data Safety
    - Uses WHERE NOT EXISTS to prevent duplicates
    - Safe for multiple runs without conflicts
*/

-- Create views for ratings aggregation
CREATE OR REPLACE VIEW facility_ratings AS
SELECT 
  hf.id,
  hf.name,
  hf.facility_type,
  hf.address,
  hf.phone,
  hf.email,
  hf.specialties,
  hf.distance_km,
  hf.is_open,
  hf.created_at,
  hf.updated_at,
  COALESCE(AVG(r.rating), 0) as calculated_rating,
  COUNT(r.id) as calculated_review_count
FROM healthcare_facilities hf
LEFT JOIN reviews r ON hf.id = r.service_provider_id AND r.review_type = 'healthcare_facility'
GROUP BY hf.id, hf.name, hf.facility_type, hf.address, hf.phone, hf.email, hf.specialties, hf.distance_km, hf.is_open, hf.created_at, hf.updated_at;

CREATE OR REPLACE VIEW walker_ratings AS
SELECT 
  dw.id,
  dw.name,
  dw.photo_url,
  dw.experience_years,
  dw.price_per_hour,
  dw.bio,
  dw.specialties,
  dw.distance_km,
  dw.is_available,
  dw.availability_status,
  dw.created_at,
  dw.updated_at,
  COALESCE(AVG(r.rating), 0) as calculated_rating,
  COUNT(r.id) as calculated_review_count
FROM dog_walkers dw
LEFT JOIN reviews r ON dw.id = r.service_provider_id AND r.review_type = 'dog_walker'
GROUP BY dw.id, dw.name, dw.photo_url, dw.experience_years, dw.price_per_hour, dw.bio, dw.specialties, dw.distance_km, dw.is_available, dw.availability_status, dw.created_at, dw.updated_at;

-- Create facility_reviews view for easier querying
CREATE OR REPLACE VIEW facility_reviews AS
SELECT 
  r.id,
  r.user_id,
  r.review_type,
  r.service_provider_id,
  r.rating,
  r.review_text,
  r.booking_id,
  r.created_at,
  r.updated_at,
  p.name as user_name
FROM reviews r
JOIN profiles p ON r.user_id = p.id
WHERE r.review_type = 'healthcare_facility';

-- Create walker_reviews view for easier querying
CREATE OR REPLACE VIEW walker_reviews AS
SELECT 
  r.id,
  r.user_id,
  r.review_type,
  r.service_provider_id,
  r.rating,
  r.review_text,
  r.booking_id,
  r.created_at,
  r.updated_at,
  p.name as user_name
FROM reviews r
JOIN profiles p ON r.user_id = p.id
WHERE r.review_type = 'dog_walker';

-- Insert sample healthcare facilities (only if they don't exist)
INSERT INTO healthcare_facilities (name, facility_type, address, phone, email, specialties, rating, review_count, distance_km, is_open)
SELECT 'VetCare Animal Hospital', 'diagnostic', '123 Pet Street, Downtown', '+1 (555) 123-4567', 'info@vetcare.com', ARRAY['X-Ray', 'Ultrasound', 'Blood Tests', 'MRI'], 4.8, 245, 0.8, true
WHERE NOT EXISTS (SELECT 1 FROM healthcare_facilities WHERE name = 'VetCare Animal Hospital');

INSERT INTO healthcare_facilities (name, facility_type, address, phone, email, specialties, rating, review_count, distance_km, is_open)
SELECT 'Emergency Pet Clinic', 'paramedic', '456 Animal Ave, Midtown', '+1 (555) 987-6543', 'emergency@petclinic.com', ARRAY['Emergency Care', 'Surgery', 'ICU'], 4.6, 189, 1.2, true
WHERE NOT EXISTS (SELECT 1 FROM healthcare_facilities WHERE name = 'Emergency Pet Clinic');

INSERT INTO healthcare_facilities (name, facility_type, address, phone, email, specialties, rating, review_count, distance_km, is_open)
SELECT 'Pet Pharmacy Plus', 'pharmacy', '789 Medicine Lane, Uptown', '+1 (555) 456-7890', 'orders@petpharmacy.com', ARRAY['Prescription Meds', 'Supplements', 'Flea Control'], 4.7, 156, 0.5, true
WHERE NOT EXISTS (SELECT 1 FROM healthcare_facilities WHERE name = 'Pet Pharmacy Plus');

INSERT INTO healthcare_facilities (name, facility_type, address, phone, email, specialties, rating, review_count, distance_km, is_open)
SELECT 'Compassionate Spay & Neuter', 'neutering', '321 Care Circle, Suburbia', '+1 (555) 234-5678', 'appointments@spayneuter.com', ARRAY['Spay/Neuter', 'Microchipping', 'Dental Care'], 4.9, 312, 2.1, false
WHERE NOT EXISTS (SELECT 1 FROM healthcare_facilities WHERE name = 'Compassionate Spay & Neuter');

-- Insert sample veterinarians (only if they don't exist)
INSERT INTO veterinarians (name, specialty, experience_years, price_per_consultation, photo_url, bio, rating, review_count, is_available, next_available_time)
SELECT 'Dr. Sarah Wilson', 'General Veterinarian', 8, 45.00, 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300', 'Experienced veterinarian with a passion for animal care and preventive medicine.', 4.9, 247, true, now() + interval '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM veterinarians WHERE name = 'Dr. Sarah Wilson');

INSERT INTO veterinarians (name, specialty, experience_years, price_per_consultation, photo_url, bio, rating, review_count, is_available, next_available_time)
SELECT 'Dr. Michael Chen', 'Emergency Medicine', 12, 65.00, 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=300', 'Specialist in emergency and critical care with extensive surgical experience.', 4.8, 189, false, now() + interval '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM veterinarians WHERE name = 'Dr. Michael Chen');

INSERT INTO veterinarians (name, specialty, experience_years, price_per_consultation, photo_url, bio, rating, review_count, is_available, next_available_time)
SELECT 'Dr. Emily Rodriguez', 'Dermatology', 6, 55.00, 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300', 'Board-certified veterinary dermatologist specializing in skin conditions and allergies.', 4.7, 156, true, now() + interval '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM veterinarians WHERE name = 'Dr. Emily Rodriguez');

-- Insert consultation types for veterinarians (only if they don't exist)
INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, 'Video Call'
FROM veterinarians v
WHERE v.name = 'Dr. Sarah Wilson'
AND NOT EXISTS (
  SELECT 1 FROM consultation_types ct 
  WHERE ct.vet_id = v.id AND ct.consultation_type = 'Video Call'
);

INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, 'Phone Call'
FROM veterinarians v
WHERE v.name = 'Dr. Sarah Wilson'
AND NOT EXISTS (
  SELECT 1 FROM consultation_types ct 
  WHERE ct.vet_id = v.id AND ct.consultation_type = 'Phone Call'
);

INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, 'Chat'
FROM veterinarians v
WHERE v.name = 'Dr. Sarah Wilson'
AND NOT EXISTS (
  SELECT 1 FROM consultation_types ct 
  WHERE ct.vet_id = v.id AND ct.consultation_type = 'Chat'
);

INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, 'Video Call'
FROM veterinarians v
WHERE v.name = 'Dr. Michael Chen'
AND NOT EXISTS (
  SELECT 1 FROM consultation_types ct 
  WHERE ct.vet_id = v.id AND ct.consultation_type = 'Video Call'
);

INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, 'Phone Call'
FROM veterinarians v
WHERE v.name = 'Dr. Michael Chen'
AND NOT EXISTS (
  SELECT 1 FROM consultation_types ct 
  WHERE ct.vet_id = v.id AND ct.consultation_type = 'Phone Call'
);

INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, 'Video Call'
FROM veterinarians v
WHERE v.name = 'Dr. Emily Rodriguez'
AND NOT EXISTS (
  SELECT 1 FROM consultation_types ct 
  WHERE ct.vet_id = v.id AND ct.consultation_type = 'Video Call'
);

-- Insert sample dog walkers (only if they don't exist)
INSERT INTO dog_walkers (name, photo_url, experience_years, price_per_hour, bio, specialties, rating, review_count, distance_km, is_available, availability_status)
SELECT 'Sarah Johnson', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300', 3, 25.00, 'Experienced dog walker with a passion for animal care. I provide personalized attention to each dog.', ARRAY['Large Dogs', 'Puppy Training', 'Senior Dogs'], 4.9, 127, 0.8, true, 'Available today'
WHERE NOT EXISTS (SELECT 1 FROM dog_walkers WHERE name = 'Sarah Johnson');

INSERT INTO dog_walkers (name, photo_url, experience_years, price_per_hour, bio, specialties, rating, review_count, distance_km, is_available, availability_status)
SELECT 'Mike Chen', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', 2, 20.00, 'Reliable and energetic dog walker. I love taking dogs on adventures and ensuring they get proper exercise.', ARRAY['Small Dogs', 'Energetic Dogs', 'Group Walks'], 4.8, 89, 1.2, false, 'Available tomorrow'
WHERE NOT EXISTS (SELECT 1 FROM dog_walkers WHERE name = 'Mike Chen');

INSERT INTO dog_walkers (name, photo_url, experience_years, price_per_hour, bio, specialties, rating, review_count, distance_km, is_available, availability_status)
SELECT 'Emma Rodriguez', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300', 4, 30.00, 'Certified dog trainer and walker. I specialize in working with dogs that need extra care and attention.', ARRAY['Anxious Dogs', 'Behavioral Training', 'Medical Needs'], 4.7, 156, 0.5, true, 'Available today'
WHERE NOT EXISTS (SELECT 1 FROM dog_walkers WHERE name = 'Emma Rodriguez');

INSERT INTO dog_walkers (name, photo_url, experience_years, price_per_hour, bio, specialties, rating, review_count, distance_km, is_available, availability_status)
SELECT 'David Park', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300', 1, 18.00, 'Weekend warrior who loves taking dogs on hiking adventures. Perfect for active dogs who need extra exercise.', ARRAY['Active Dogs', 'Hiking', 'Weekend Walks'], 4.6, 73, 2.1, true, 'Available this weekend'
WHERE NOT EXISTS (SELECT 1 FROM dog_walkers WHERE name = 'David Park');

-- Insert sample pet care tips (only if they don't exist)
-- Dog Do's
INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'do', 'Feeding', 'Provide Fresh Water Daily', 'Always ensure your dog has access to clean, fresh water. Change it daily and clean the bowl regularly.', 'high', NULL, 'droplets'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'do' AND category = 'Feeding' AND title = 'Provide Fresh Water Daily');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'do', 'Exercise', 'Daily Exercise Routine', 'Dogs need at least 30 minutes to 2 hours of exercise daily, depending on their breed and age.', 'high', NULL, 'activity'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'do' AND category = 'Exercise' AND title = 'Daily Exercise Routine');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'do', 'Health', 'Regular Vet Checkups', 'Schedule annual vet visits for vaccinations and health screenings. Puppies and senior dogs may need more frequent visits.', 'high', NULL, 'heart'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'do' AND category = 'Health' AND title = 'Regular Vet Checkups');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'do', 'Grooming', 'Brush Teeth Regularly', 'Brush your dog''s teeth 2-3 times per week to prevent dental disease and maintain oral health.', 'medium', NULL, 'shield'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'do' AND category = 'Grooming' AND title = 'Brush Teeth Regularly');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'do', 'Safety', 'Use Proper Identification', 'Ensure your dog wears a collar with ID tags and consider microchipping for permanent identification.', 'high', NULL, 'shield'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'do' AND category = 'Safety' AND title = 'Use Proper Identification');

-- Dog Don'ts
INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'dont', 'Feeding', 'Never Feed Chocolate', 'Chocolate contains theobromine, which is toxic to dogs and can cause serious health problems or death.', NULL, 'critical', 'alert-triangle'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'dont' AND category = 'Feeding' AND title = 'Never Feed Chocolate');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'dont', 'Safety', 'Don''t Leave in Hot Cars', 'Never leave your dog in a parked car, especially in warm weather. Cars can quickly become deadly hot.', NULL, 'critical', 'alert-triangle'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'dont' AND category = 'Safety' AND title = 'Don''t Leave in Hot Cars');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'dont', 'Training', 'Avoid Punishment-Based Training', 'Don''t use physical punishment or yelling. Positive reinforcement is more effective and safer.', NULL, 'moderate', 'x-circle'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'dont' AND category = 'Training' AND title = 'Avoid Punishment-Based Training');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'dog', 'dont', 'Health', 'Don''t Skip Vaccinations', 'Skipping or delaying vaccinations can leave your dog vulnerable to serious diseases.', NULL, 'high', 'shield'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'dog' AND tip_type = 'dont' AND category = 'Health' AND title = 'Don''t Skip Vaccinations');

-- Cat Do's
INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'do', 'Litter', 'Keep Litter Box Clean', 'Scoop litter daily and change completely weekly. Cats are very particular about cleanliness.', 'high', NULL, 'shield'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'do' AND category = 'Litter' AND title = 'Keep Litter Box Clean');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'do', 'Health', 'Regular Vet Checkups', 'Annual vet visits are essential for vaccinations and early detection of health issues.', 'high', NULL, 'heart'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'do' AND category = 'Health' AND title = 'Regular Vet Checkups');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'do', 'Environment', 'Provide Vertical Spaces', 'Cats love to climb and perch. Provide cat trees, shelves, or other vertical spaces.', 'medium', NULL, 'activity'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'do' AND category = 'Environment' AND title = 'Provide Vertical Spaces');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'do', 'Feeding', 'Multiple Small Meals', 'Feed your cat small, frequent meals rather than one large meal to aid digestion.', 'medium', NULL, 'utensils'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'do' AND category = 'Feeding' AND title = 'Multiple Small Meals');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'do', 'Safety', 'Indoor Safety Check', 'Cat-proof your home by securing toxic plants, chemicals, and small objects that could be swallowed.', 'high', NULL, 'shield'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'do' AND category = 'Safety' AND title = 'Indoor Safety Check');

-- Cat Don'ts
INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'dont', 'Feeding', 'Never Feed Onions or Garlic', 'Onions and garlic are toxic to cats and can cause anemia and other serious health problems.', NULL, 'critical', 'alert-triangle'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'dont' AND category = 'Feeding' AND title = 'Never Feed Onions or Garlic');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'dont', 'Plants', 'Avoid Toxic Plants', 'Many common houseplants like lilies, azaleas, and poinsettias are toxic to cats.', NULL, 'critical', 'alert-triangle'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'dont' AND category = 'Plants' AND title = 'Avoid Toxic Plants');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'dont', 'Declawing', 'Don''t Declaw', 'Declawing is inhumane and can cause long-term physical and behavioral problems.', NULL, 'high', 'x-circle'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'dont' AND category = 'Declawing' AND title = 'Don''t Declaw');

INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, severity, icon_name)
SELECT 'cat', 'dont', 'Milk', 'Don''t Give Milk', 'Most adult cats are lactose intolerant and milk can cause digestive upset.', NULL, 'moderate', 'x-circle'
WHERE NOT EXISTS (SELECT 1 FROM pet_care_tips WHERE species = 'cat' AND tip_type = 'dont' AND category = 'Milk' AND title = 'Don''t Give Milk');