
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_name_len CHECK (char_length(name) BETWEEN 1 AND 120),
  ADD CONSTRAINT bookings_email_len CHECK (char_length(email) BETWEEN 3 AND 200),
  ADD CONSTRAINT bookings_phone_len CHECK (char_length(phone) <= 40),
  ADD CONSTRAINT bookings_item_len CHECK (char_length(item_name) <= 120),
  ADD CONSTRAINT bookings_notes_len CHECK (notes IS NULL OR char_length(notes) <= 2000),
  ADD CONSTRAINT bookings_guests_len CHECK (guests IS NULL OR char_length(guests) <= 20),
  ADD CONSTRAINT bookings_kind_vals CHECK (kind IN ('room','activity','general'));
