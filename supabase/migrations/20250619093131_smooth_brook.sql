/*
  # Dog Walker Google Calendar Integration

  1. New Tables
    - `walker_available_slots` - Stores available time slots from Google Calendar
    - `walker_google_auth` - Stores Google authentication tokens for walkers

  2. Updates to Existing Tables
    - Add Google Calendar fields to `dog_walkers` table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create storage bucket for pet photos
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('pet-photos', 'pet-photos', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create policy to allow authenticated users to upload photos
  CREATE POLICY "Users can upload pet photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pet-photos');

  -- Create policy to allow anyone to view pet photos
  CREATE POLICY "Anyone can view pet photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'pet-photos');
END $$;

-- Create stored procedure for creating pets table
CREATE OR REPLACE FUNCTION create_pets_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create pets table if it doesn't exist
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

  -- Enable RLS
  ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

  -- Create policy for managing own pets
  DROP POLICY IF EXISTS "Users can manage their own pets" ON pets;
  CREATE POLICY "Users can manage their own pets"
    ON pets
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

  -- Create policies for pets table
  CREATE POLICY "Users can view their own pets"
    ON pets
    FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can create their own pets"
    ON pets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own pets"
    ON pets
    FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own pets"
    ON pets
    FOR DELETE
    USING (auth.uid() = user_id);

  -- Storage policies for pet photos
  DO $$
  BEGIN
    -- Create pet-photos bucket if it doesn't exist
    IF NOT EXISTS (
      SELECT 1
      FROM storage.buckets
      WHERE id = 'pet-photos'
    ) THEN
      INSERT INTO storage.buckets (id, name)
      VALUES ('pet-photos', 'pet-photos');
    END IF;

    -- Enable RLS on the bucket
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Create policy to allow authenticated users to upload
    CREATE POLICY "Authenticated users can upload pet photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'pet-photos' AND
      (CASE
        WHEN mime_type = 'image/jpeg' THEN true
        WHEN mime_type = 'image/png' THEN true
        WHEN mime_type = 'image/gif' THEN true
        ELSE false
      END)
    );

    -- Create policy to allow public read access
    CREATE POLICY "Public read access for pet photos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'pet-photos');

    -- Create policy to allow users to delete their own uploads
    CREATE POLICY "Users can delete their own pet photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'pet-photos' AND auth.uid()::text = owner);
  END
  $$;
END;
$$;

-- Add Google Calendar fields to dog_walkers table
ALTER TABLE dog_walkers ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE dog_walkers ADD COLUMN IF NOT EXISTS google_access_token text;
ALTER TABLE dog_walkers ADD COLUMN IF NOT EXISTS google_refresh_token text;
ALTER TABLE dog_walkers ADD COLUMN IF NOT EXISTS google_calendar_id text DEFAULT 'primary';
ALTER TABLE dog_walkers ADD COLUMN IF NOT EXISTS last_calendar_sync timestamptz;

-- Create walker_available_slots table
CREATE TABLE IF NOT EXISTS walker_available_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  walker_id uuid NOT NULL REFERENCES dog_walkers(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  google_event_id text,
  is_booked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE walker_available_slots ENABLE ROW LEVEL SECURITY;

-- Policies for walker_available_slots
CREATE POLICY "Walkers can manage their own slots"
  ON walker_available_slots
  FOR ALL
  TO authenticated
  USING (walker_id IN (SELECT id FROM dog_walkers WHERE email = auth.email()))
  WITH CHECK (walker_id IN (SELECT id FROM dog_walkers WHERE email = auth.email()));

CREATE POLICY "Users can view available slots"
  ON walker_available_slots
  FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for updating last_calendar_sync
CREATE OR REPLACE FUNCTION update_last_calendar_sync()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dog_walkers
  SET last_calendar_sync = now()
  WHERE id = NEW.walker_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_walker_calendar_sync
  AFTER INSERT ON walker_available_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_last_calendar_sync();

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  veterinarian text DEFAULT NULL,
  clinic text DEFAULT NULL,
  files jsonb,
  tags _text,
  priority text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for medical_records
CREATE POLICY "Users can view their own pets' medical records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create medical records for their pets"
  ON medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their pets' medical records"
  ON medical_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their pets' medical records"
  ON medical_records
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create storage bucket for medical records
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('medical-records', 'medical-records', false)
  ON CONFLICT (id) DO NOTHING;

  -- Create policy to allow authenticated users to upload medical records
  CREATE POLICY "Users can upload medical records"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'medical-records' AND auth.uid()::text = owner);

  -- Create policy to allow users to view their own medical records
  CREATE POLICY "Users can view their own medical records"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'medical-records' AND auth.uid()::text = owner);

  -- Create policy to allow users to delete their own medical records
  CREATE POLICY "Users can delete their own medical records"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'medical-records' AND auth.uid()::text = owner);
END $$;