ALTER TABLE public.roles
    ADD COLUMN IF NOT EXISTS description varchar(255),
    ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

ALTER TABLE public.user_roles
    ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS public.rbac_permissions (
    permission_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key varchar(120) NOT NULL UNIQUE,
    module_key varchar(80) NOT NULL,
    action_key varchar(80) NOT NULL,
    category varchar(80),
    scope varchar(50),
    name varchar(120) NOT NULL,
    description text,
    is_system boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS rbac_permissions_module_key_idx
    ON public.rbac_permissions (module_key);

CREATE TABLE IF NOT EXISTS public.rbac_role_permissions (
    role_id smallint NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT rbac_role_permissions_pkey PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.rbac_user_permission_overrides (
    user_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    effect varchar(10) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT rbac_user_permission_overrides_pkey PRIMARY KEY (user_id, permission_id),
    CONSTRAINT rbac_user_permission_overrides_effect_check CHECK (effect IN ('allow', 'deny'))
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    system_setting_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category varchar(100) NOT NULL,
    setting_key varchar(150) NOT NULL UNIQUE,
    setting_value jsonb NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    updated_by uuid
);

CREATE INDEX IF NOT EXISTS system_settings_category_idx
    ON public.system_settings (category);

DO $$
BEGIN
    ALTER TABLE public.rbac_role_permissions
        ADD CONSTRAINT rbac_role_permissions_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.rbac_role_permissions
        ADD CONSTRAINT rbac_role_permissions_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES public.rbac_permissions(permission_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    ALTER TABLE public.rbac_user_permission_overrides
        ADD CONSTRAINT rbac_user_permission_overrides_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES public.rbac_permissions(permission_id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE public.rbac_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rbac_user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view rbac_permissions"
    ON public.rbac_permissions
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view rbac_role_permissions"
    ON public.rbac_role_permissions
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view rbac_user_permission_overrides"
    ON public.rbac_user_permission_overrides
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
    CREATE POLICY "Authenticated users can view system_settings"
    ON public.system_settings
    FOR SELECT TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

GRANT ALL ON TABLE public.rbac_permissions TO anon;
GRANT ALL ON TABLE public.rbac_permissions TO authenticated;
GRANT ALL ON TABLE public.rbac_permissions TO service_role;

GRANT ALL ON TABLE public.rbac_role_permissions TO anon;
GRANT ALL ON TABLE public.rbac_role_permissions TO authenticated;
GRANT ALL ON TABLE public.rbac_role_permissions TO service_role;

GRANT ALL ON TABLE public.rbac_user_permission_overrides TO anon;
GRANT ALL ON TABLE public.rbac_user_permission_overrides TO authenticated;
GRANT ALL ON TABLE public.rbac_user_permission_overrides TO service_role;

GRANT ALL ON TABLE public.system_settings TO anon;
GRANT ALL ON TABLE public.system_settings TO authenticated;
GRANT ALL ON TABLE public.system_settings TO service_role;
