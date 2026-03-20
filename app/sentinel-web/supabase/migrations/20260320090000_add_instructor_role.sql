-- Add instructor role to roles table if missing
-- Ensure role_id sequence is aligned to prevent duplicate key errors
SELECT setval(
  pg_get_serial_sequence('public.roles', 'role_id'),
  COALESCE((SELECT MAX(role_id) FROM public.roles), 0)
);

INSERT INTO public.roles (role_name)
SELECT 'instructor'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.roles
  WHERE role_name = 'instructor'
);
