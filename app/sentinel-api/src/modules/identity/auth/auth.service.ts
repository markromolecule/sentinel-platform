import { supabaseAnon } from '../../../lib/supabase-anon';
import { LoginSchemaType, RegisterSchemaType } from '@sentinel/shared/schema';

export class AuthService {
    /**
     * Authenticate a user with email and password via Supabase.
     */
    static async login(credentials: LoginSchemaType) {
        const { data, error } = await supabaseAnon.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Register a new user via Supabase.
     */
    static async register(body: RegisterSchemaType) {
        const { data, error } = await supabaseAnon.auth.signUp({
            email: body.email,
            password: body.password,
            options: {
                data: {
                    first_name: body.firstName,
                    last_name: body.lastName,
                    role: 'student', // Default role for portal signups
                },
            },
        });

        if (error) {
            throw error;
        }

        return data;
    }
}
