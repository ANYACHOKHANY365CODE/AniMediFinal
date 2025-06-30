/*
  # Complete AniMedi Database Schema and Sample Data

  1. New Tables
    - `profiles` - User profiles with roles
    - `healthcare_facilities` - Healthcare facilities directory
    - `veterinarians` - Veterinarian profiles
    - `consultation_types` - Available consultation types per vet
    - `dog_walkers` - Dog walker profiles
    - `bookings` - Unified booking system
    - `reviews` - Review system for facilities and walkers
    - `pet_care_tips` - Species-specific care tips
    - `pets` - Pet profiles

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Ensure proper data isolation

  3. Sample Data
    - Healthcare facilities with realistic information
    - Veterinarians with different specialties
    - Dog walkers with various experience levels
    - Pet care tips for dogs and cats
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('pet_owner', 'vet', 'dog_walker', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'profiles'::regclass 
        AND polname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile"
        ON profiles
        FOR SELECT
        TO authenticated
        USING (id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'profiles'::regclass 
        AND polname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
        ON profiles
        FOR UPDATE
        TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'profiles'::regclass 
        AND polname = 'Users can insert their own profile'
    ) THEN
        CREATE POLICY "Users can insert their own profile"
        ON profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (id = auth.uid());
    END IF;
END $$;

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL CHECK (species IN ('dog', 'cat')),
  breed text NOT NULL,
  age integer NOT NULL CHECK (age >= 0),
  weight numeric(5,2) NOT NULL CHECK (weight > 0),
  gender text CHECK (gender IN ('male', 'female')),
  is_neutered boolean DEFAULT false,
  is_microchipped boolean DEFAULT false,
  allergies text[] DEFAULT '{}',
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'pets'::regclass 
        AND polname = 'Users can manage their own pets'
    ) THEN
        CREATE POLICY "Users can manage their own pets"
        ON pets
        FOR ALL
        TO authenticated
        USING (user_id = auth.uid())
        WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Create healthcare_facilities table
CREATE TABLE IF NOT EXISTS healthcare_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  facility_type text NOT NULL CHECK (facility_type IN ('diagnostic', 'paramedic', 'pharmacy', 'neutering')),
  address text NOT NULL,
  phone text NOT NULL,
  email text,
  specialties text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  distance_km numeric(5,2) DEFAULT 0.0,
  is_open boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE healthcare_facilities ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'healthcare_facilities'::regclass 
        AND polname = 'Healthcare facilities are viewable by everyone'
    ) THEN
CREATE POLICY "Healthcare facilities are viewable by everyone"
  ON healthcare_facilities
  FOR SELECT
  TO authenticated
  USING (true);
    END IF;
END $$;

-- Create veterinarians table
CREATE TABLE IF NOT EXISTS veterinarians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialty text NOT NULL,
  experience_years integer NOT NULL CHECK (experience_years >= 0),
  price_per_consultation numeric(10,2) NOT NULL CHECK (price_per_consultation > 0),
  photo_url text,
  bio text,
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  is_available boolean DEFAULT true,
  next_available_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE veterinarians ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'veterinarians'::regclass 
        AND polname = 'Veterinarians are viewable by everyone'
    ) THEN
CREATE POLICY "Veterinarians are viewable by everyone"
  ON veterinarians
  FOR SELECT
  TO authenticated
  USING (true);
    END IF;
END $$;

-- Create consultation_types table
CREATE TABLE IF NOT EXISTS consultation_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vet_id uuid NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
  consultation_type text NOT NULL CHECK (consultation_type IN ('Video Call', 'Phone Call', 'Chat')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(vet_id, consultation_type)
);

ALTER TABLE consultation_types ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'consultation_types'::regclass 
        AND polname = 'Consultation types are viewable by everyone'
    ) THEN
CREATE POLICY "Consultation types are viewable by everyone"
  ON consultation_types
  FOR SELECT
  TO authenticated
  USING (true);
    END IF;
END $$;

-- Create dog_walkers table
CREATE TABLE IF NOT EXISTS dog_walkers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  experience_years integer NOT NULL CHECK (experience_years >= 0),
  price_per_hour numeric(10,2) NOT NULL CHECK (price_per_hour > 0),
  bio text,
  specialties text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
  distance_km numeric(5,2) DEFAULT 0.0,
  is_available boolean DEFAULT true,
  availability_status text DEFAULT 'Available today',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE dog_walkers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'dog_walkers'::regclass 
        AND polname = 'Dog walkers are viewable by everyone'
    ) THEN
CREATE POLICY "Dog walkers are viewable by everyone"
  ON dog_walkers
  FOR SELECT
  TO authenticated
  USING (true);
    END IF;
END $$;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  booking_type text NOT NULL CHECK (booking_type IN ('vet_consultation', 'dog_walking')),
  service_provider_id uuid NOT NULL, -- References either veterinarians.id or dog_walkers.id
  booking_date date NOT NULL,
  booking_time time,
  consultation_type text, -- For vet consultations
  duration_hours numeric(3,1), -- For dog walking
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes text,
  total_price numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'bookings'::regclass 
        AND polname = 'Users can manage own bookings'
    ) THEN
CREATE POLICY "Users can manage own bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_type text NOT NULL CHECK (review_type IN ('healthcare_facility', 'veterinarian', 'dog_walker')),
  service_provider_id uuid NOT NULL, -- References the respective service provider
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, review_type, service_provider_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'reviews'::regclass 
        AND polname = 'Users can manage own reviews'
    ) THEN
CREATE POLICY "Users can manage own reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'reviews'::regclass 
        AND polname = 'Reviews are viewable by everyone'
    ) THEN
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);
    END IF;
END $$;

-- Create pet_care_tips table
CREATE TABLE IF NOT EXISTS pet_care_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  species text NOT NULL CHECK (species IN ('dog', 'cat')),
  tip_type text NOT NULL CHECK (tip_type IN ('do', 'dont')),
  category text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  importance text CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  severity text CHECK (severity IN ('low', 'moderate', 'high', 'critical')),
  icon_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pet_care_tips ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policy 
        WHERE polrelid = 'pet_care_tips'::regclass 
        AND polname = 'Pet care tips are viewable by everyone'
    ) THEN
CREATE POLICY "Pet care tips are viewable by everyone"
  ON pet_care_tips
  FOR SELECT
  TO authenticated
  USING (true);
    END IF;
END $$;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_healthcare_facilities_updated_at') THEN
        CREATE TRIGGER update_healthcare_facilities_updated_at
            BEFORE UPDATE ON healthcare_facilities
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_veterinarians_updated_at') THEN
        CREATE TRIGGER update_veterinarians_updated_at
            BEFORE UPDATE ON veterinarians
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_dog_walkers_updated_at') THEN
        CREATE TRIGGER update_dog_walkers_updated_at
            BEFORE UPDATE ON dog_walkers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookings_updated_at') THEN
        CREATE TRIGGER update_bookings_updated_at
            BEFORE UPDATE ON bookings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reviews_updated_at') THEN
        CREATE TRIGGER update_reviews_updated_at
            BEFORE UPDATE ON reviews
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insert sample healthcare facilities
INSERT INTO healthcare_facilities (name, facility_type, address, phone, email, specialties, rating, review_count, distance_km, is_open) VALUES
('VetCare Animal Hospital', 'diagnostic', '123 Pet Street, Downtown', '+1 (555) 123-4567', 'info@vetcare.com', ARRAY['X-Ray', 'Ultrasound', 'Blood Tests', 'MRI'], 4.8, 245, 0.8, true),
('Emergency Pet Clinic', 'paramedic', '456 Animal Ave, Midtown', '+1 (555) 987-6543', 'emergency@petclinic.com', ARRAY['Emergency Care', 'Surgery', 'ICU'], 4.6, 189, 1.2, true),
('Pet Pharmacy Plus', 'pharmacy', '789 Medicine Lane, Uptown', '+1 (555) 456-7890', 'orders@petpharmacy.com', ARRAY['Prescription Meds', 'Supplements', 'Flea Control'], 4.7, 156, 0.5, true),
('Compassionate Spay & Neuter', 'neutering', '321 Care Circle, Suburbia', '+1 (555) 234-5678', 'appointments@spayneuter.com', ARRAY['Spay/Neuter', 'Microchipping', 'Dental Care'], 4.9, 312, 2.1, false);

-- Insert sample veterinarians
INSERT INTO veterinarians (name, specialty, experience_years, price_per_consultation, photo_url, bio, rating, review_count, is_available, next_available_time) VALUES
('Dr. Sarah Wilson', 'General Veterinarian', 8, 45.00, 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300', 'Experienced veterinarian with a passion for animal care and preventive medicine.', 4.9, 247, true, now() + interval '1 hour'),
('Dr. Michael Chen', 'Emergency Medicine', 12, 65.00, 'https://images.pexels.com/photos/6129507/pexels-photo-6129507.jpeg?auto=compress&cs=tinysrgb&w=300', 'Specialist in emergency and critical care with extensive surgical experience.', 4.8, 189, false, now() + interval '2 hours'),
('Dr. Emily Rodriguez', 'Dermatology', 6, 55.00, 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300', 'Board-certified veterinary dermatologist specializing in skin conditions and allergies.', 4.7, 156, true, now() + interval '30 minutes');

-- Insert consultation types for veterinarians
INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, ct.type
FROM veterinarians v
CROSS JOIN (VALUES ('Video Call'), ('Phone Call'), ('Chat')) AS ct(type)
WHERE v.name = 'Dr. Sarah Wilson';

INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, ct.type
FROM veterinarians v
CROSS JOIN (VALUES ('Video Call'), ('Phone Call')) AS ct(type)
WHERE v.name = 'Dr. Michael Chen';

INSERT INTO consultation_types (vet_id, consultation_type) 
SELECT v.id, ct.type
FROM veterinarians v
CROSS JOIN (VALUES ('Video Call')) AS ct(type)
WHERE v.name = 'Dr. Emily Rodriguez';

-- Insert sample dog walkers
INSERT INTO dog_walkers (name, photo_url, experience_years, price_per_hour, bio, specialties, rating, review_count, distance_km, is_available, availability_status) VALUES
('Sarah Johnson', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=300', 3, 25.00, 'Experienced dog walker with a passion for animal care. I provide personalized attention to each dog.', ARRAY['Large Dogs', 'Puppy Training', 'Senior Dogs'], 4.9, 127, 0.8, true, 'Available today'),
('Mike Chen', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300', 2, 20.00, 'Reliable and energetic dog walker. I love taking dogs on adventures and ensuring they get proper exercise.', ARRAY['Small Dogs', 'Energetic Dogs', 'Group Walks'], 4.8, 89, 1.2, false, 'Available tomorrow'),
('Emma Rodriguez', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300', 4, 30.00, 'Certified dog trainer and walker. I specialize in working with dogs that need extra care and attention.', ARRAY['Anxious Dogs', 'Behavioral Training', 'Medical Needs'], 4.7, 156, 0.5, true, 'Available today'),
('David Park', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300', 1, 18.00, 'Weekend warrior who loves taking dogs on hiking adventures. Perfect for active dogs who need extra exercise.', ARRAY['Active Dogs', 'Hiking', 'Weekend Walks'], 4.6, 73, 2.1, true, 'Available this weekend');

-- Insert pet care tips for dogs
INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, icon_name) VALUES
('dog', 'do', 'Feeding', 'Provide Fresh Water Daily', 'Always ensure your dog has access to clean, fresh water. Change it daily and clean the bowl regularly.', 'high', 'Utensils'),
('dog', 'do', 'Exercise', 'Daily Exercise Routine', 'Dogs need at least 30 minutes to 2 hours of exercise daily, depending on their breed and age.', 'high', 'Activity'),
('dog', 'do', 'Health', 'Regular Vet Checkups', 'Schedule annual vet visits for vaccinations and health screenings. Puppies and senior dogs may need more frequent visits.', 'high', 'Heart'),
('dog', 'do', 'Grooming', 'Brush Teeth Regularly', 'Brush your dog''s teeth 2-3 times per week to prevent dental disease and maintain oral health.', 'medium', 'Shield'),
('dog', 'do', 'Safety', 'Use Proper Identification', 'Ensure your dog wears a collar with ID tags and consider microchipping for permanent identification.', 'high', 'Shield'),
('dog', 'dont', 'Feeding', 'Never Feed Chocolate', 'Chocolate contains theobromine, which is toxic to dogs and can cause serious health problems or death.', null, 'AlertTriangle'),
('dog', 'dont', 'Safety', 'Don''t Leave in Hot Cars', 'Never leave your dog in a parked car, especially in warm weather. Cars can quickly become deadly hot.', null, 'AlertTriangle'),
('dog', 'dont', 'Training', 'Avoid Punishment-Based Training', 'Don''t use physical punishment or yelling. Positive reinforcement is more effective and safer.', null, 'XCircle'),
('dog', 'dont', 'Health', 'Don''t Skip Vaccinations', 'Skipping or delaying vaccinations can leave your dog vulnerable to serious diseases.', null, 'Shield');

-- Insert pet care tips for cats
INSERT INTO pet_care_tips (species, tip_type, category, title, description, importance, icon_name) VALUES
('cat', 'do', 'Litter', 'Keep Litter Box Clean', 'Scoop litter daily and change completely weekly. Cats are very particular about cleanliness.', 'high', 'Shield'),
('cat', 'do', 'Health', 'Regular Vet Checkups', 'Annual vet visits are essential for vaccinations and early detection of health issues.', 'high', 'Heart'),
('cat', 'do', 'Environment', 'Provide Vertical Spaces', 'Cats love to climb and perch. Provide cat trees, shelves, or other vertical spaces.', 'medium', 'Activity'),
('cat', 'do', 'Feeding', 'Multiple Small Meals', 'Feed your cat small, frequent meals rather than one large meal to aid digestion.', 'medium', 'Utensils'),
('cat', 'do', 'Safety', 'Indoor Safety Check', 'Cat-proof your home by securing toxic plants, chemicals, and small objects that could be swallowed.', 'high', 'Shield'),
('cat', 'dont', 'Feeding', 'Never Feed Onions or Garlic', 'Onions and garlic are toxic to cats and can cause anemia and other serious health problems.', null, 'AlertTriangle'),
('cat', 'dont', 'Plants', 'Avoid Toxic Plants', 'Many common houseplants like lilies, azaleas, and poinsettias are toxic to cats.', null, 'AlertTriangle'),
('cat', 'dont', 'Declawing', 'Don''t Declaw', 'Declawing is inhumane and can cause long-term physical and behavioral problems.', null, 'XCircle'),
('cat', 'dont', 'Milk', 'Don''t Give Milk', 'Most adult cats are lactose intolerant and milk can cause digestive upset.', null, 'XCircle');

-- Set severity for don't tips
UPDATE pet_care_tips 
SET severity = CASE 
  WHEN icon_name = 'AlertTriangle' THEN 'critical'
  WHEN icon_name = 'Shield' THEN 'high'
  WHEN icon_name = 'XCircle' THEN 'moderate'
  ELSE 'moderate'
END
WHERE tip_type = 'dont';