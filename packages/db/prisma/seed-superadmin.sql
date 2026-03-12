-- SQL to create or update a superadmin user in Supabase/PostgreSQL
-- Replace 'superadmin@sentinel.edu' and 'password123' with desired credentials

DO $$
DECLARE
  uid UUID := gen_random_uuid();
  target_email TEXT := 'superadmin@sentinel.edu';
BEGIN
  -- Check if user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = target_email) THEN
    INSERT INTO auth.users (
      id, 
      instance_id, 
      email, 
      encrypted_password, 
      email_confirmed_at, 
      raw_app_meta_data, 
      raw_user_meta_data, 
      aud, 
      role, 
      is_super_admin,
      confirmed_at
    )
    VALUES (
      uid,
      '00000000-0000-0000-0000-000000000000',
      target_email,
      crypt('password123', gen_salt('bf')), -- Note: This requires pgcrypto extension
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"firstName":"System","lastName":"Superadmin"}',
      'authenticated',
      'authenticated',
      true,
      now()
    );
    
    -- Also create a profile in public.user_profiles if needed
    INSERT INTO public.user_profiles (user_id, first_name, last_name, status)
    VALUES (uid, 'System', 'Superadmin', 'ACTIVE');
    
  ELSE
    -- If user exists, ensure they are a superadmin
    UPDATE auth.users 
    SET is_super_admin = true 
    WHERE email = target_email;
  END IF;
END $$;
