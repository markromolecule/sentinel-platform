-- Update the password for support@sentinelph.tech
-- Since the application uses Supabase Auth, passwords are crypt-hashed (bcrypt) in the auth.users table.
UPDATE auth.users 
SET encrypted_password = crypt('@Livado02', gen_salt('bf'))
WHERE email = 'support@sentinelph.tech';
