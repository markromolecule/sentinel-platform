import { supabaseAdmin } from '../../../lib/supabase-admin';
import { supabaseAnon } from '../../../lib/supabase-anon';
import {
    LoginSchemaType,
    ApiRegisterSchemaType,
    VerifyOtpSchemaType,
} from '@sentinel/shared/schema';

export class AuthService {
    /**
     * Authenticate a user with email and password via Supabase.
     * Web requests forwarding a Cloudflare Turnstile token authenticate via supabaseAnon.
     * Mobile requests or requests without a captchaToken authenticate via supabaseAdmin
     * to bypass Turnstile rejection while preserving API rate-limiting and audit logging.
     */
    static async login(credentials: LoginSchemaType, clientType?: string) {
        const hasCaptchaToken = Boolean(
            typeof credentials.captchaToken === 'string' && credentials.captchaToken.trim(),
        );
        const isMobileClient = clientType === 'mobile';

        if (hasCaptchaToken) {
            const { data, error } = await supabaseAnon.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
                options: {
                    captchaToken: credentials.captchaToken!.trim(),
                },
            });

            if (error) {
                throw error;
            }

            return data;
        }

        const authClient = isMobileClient || !hasCaptchaToken ? supabaseAdmin : supabaseAnon;

        const { data, error } = await authClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (error) {
            throw error;
        }

        return data;
    }

    /**
     * Register a new user via Supabase and trigger native 6-digit email OTP dispatch.
     */
    static async register(body: ApiRegisterSchemaType) {
        const { data, error } = await supabaseAnon.auth.signUp({
            email: body.email,
            password: body.password,
            options: {
                data: {
                    first_name: body.firstName,
                    last_name: body.lastName,
                    role: 'student', // Default role for portal signups
                },
                ...(typeof body.captchaToken === 'string' && body.captchaToken.trim()
                    ? { captchaToken: body.captchaToken.trim() }
                    : {}),
            },
        });

        if (error) {
            throw error;
        }

        return {
            user: data.user,
            session: data.session,
            requiresVerification: !data.session,
        };
    }

    /**
     * Verify a 6-digit email OTP code via Supabase.
     */
    static async verifyOtp(body: VerifyOtpSchemaType) {
        const { data, error } = await supabaseAnon.auth.verifyOtp({
            email: body.email,
            token: body.token,
            type: body.type || 'signup',
        });

        if (error) {
            throw error;
        }

        return data;
    }
}
