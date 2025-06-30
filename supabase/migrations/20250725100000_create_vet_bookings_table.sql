create table public.vet_bookings (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  pet_id uuid not null,
  vet_id uuid not null,
  appointment_date date not null,
  appointment_time time without time zone not null,
  consultation_type text not null,
  status text not null default 'pending'::text,
  notes text null,
  fee numeric(10, 2) null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint vet_bookings_pkey primary key (id),
  constraint vet_bookings_pet_id_fkey foreign KEY (pet_id) references pets (id) on delete CASCADE,
  constraint vet_bookings_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint vet_bookings_vet_id_fkey foreign KEY (vet_id) references vet_profiles (id) on delete CASCADE,
  constraint vet_bookings_consultation_type_check check (
    (
      consultation_type = any (
        array['video'::text, 'phone'::text, 'in-person'::text]
      )
    )
  ),
  constraint vet_bookings_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_vet_bookings_updated_at BEFORE
update on vet_bookings for EACH row
execute FUNCTION update_updated_at_column (); 