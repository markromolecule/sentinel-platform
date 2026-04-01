import { type EmailOtpType } from '@supabase/supabase-js';

export const EMAIL_OTP_TYPES = new Set<EmailOtpType>([
    'signup',
    'invite',
    'magiclink',
    'recovery',
    'email_change',
    'email',
]);
