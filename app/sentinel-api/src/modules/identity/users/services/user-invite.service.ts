import { type CreateUserBody } from '../user.dto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { HTTPException } from 'hono/http-exception';

type InviteErrorStatus = 400 | 409 | 429 | 502;

const PRODUCTION_DOMAIN = 'sentinelph.tech';
const PRODUCTION_CORE_URL = `https://core.${PRODUCTION_DOMAIN}`;
const PRODUCTION_SUPPORT_URL = `https://support.${PRODUCTION_DOMAIN}`;
const PRODUCTION_WEB_URL = `https://app.${PRODUCTION_DOMAIN}`;
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function isLoopbackHost(hostname: string) {
    return LOOPBACK_HOSTS.has(hostname.toLowerCase());
}

function isProductionHost(hostname: string) {
    const normalizedHostname = hostname.toLowerCase();

    return (
        normalizedHostname === PRODUCTION_DOMAIN ||
        normalizedHostname.endsWith(`.${PRODUCTION_DOMAIN}`)
    );
}

function normalizeUrl(value?: string | null, options?: { rejectLoopback?: boolean }) {
    if (!value) return null;

    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null;
        }

        if (
            (options?.rejectLoopback || process.env.NODE_ENV === 'production') &&
            isLoopbackHost(hostname)
        ) {
            return null;
        }

        return url.toString().replace(/\/+$/, '');
    } catch {
        return null;
    }
}

function isApiOrigin(value: string) {
    try {
        return new URL(value).hostname.startsWith('api.');
    } catch {
        return false;
    }
}

function hasProductionSignal(candidates: Array<string | null | undefined>) {
    return candidates.some((candidate) => {
        if (!candidate) return false;

        try {
            return isProductionHost(new URL(candidate).hostname);
        } catch {
            return false;
        }
    });
}

type InvitePortal = 'core' | 'support' | 'web';

function resolveInviteBaseUrl(portal: InvitePortal, requestOrigin?: string) {
    const normalizedRequestOrigin = normalizeUrl(requestOrigin);
    const safeRequestOrigin =
        normalizedRequestOrigin && !isApiOrigin(normalizedRequestOrigin)
            ? normalizedRequestOrigin
            : null;

    const envCandidates =
        portal === 'core'
            ? [
              process.env.NEXT_PUBLIC_CORE_URL,
              process.env.CORE_URL,
              safeRequestOrigin,
              process.env.NEXT_PUBLIC_APP_URL,
          ]
            : portal === 'support'
              ? [
                    process.env.NEXT_PUBLIC_SUPPORT_URL,
                    process.env.SUPPORT_URL,
                    process.env.NEXT_PUBLIC_APP_URL,
                    safeRequestOrigin,
                ]
              : [
              process.env.FRONTEND_URL,
              process.env.NEXT_PUBLIC_APP_URL,
              process.env.NEXT_PUBLIC_WEB_URL,
              safeRequestOrigin,
          ];

    const rejectLoopback =
        process.env.NODE_ENV === 'production' ||
        hasProductionSignal([safeRequestOrigin, ...envCandidates]);

    for (const candidate of envCandidates) {
        const normalized = normalizeUrl(candidate, { rejectLoopback });
        if (normalized) {
            return normalized;
        }
    }

    if (rejectLoopback) {
        if (portal === 'core') return PRODUCTION_CORE_URL;
        if (portal === 'support') return PRODUCTION_SUPPORT_URL;
        return PRODUCTION_WEB_URL;
    }

    if (portal === 'core') return 'http://localhost:3002';
    if (portal === 'support') return 'http://localhost:3003';
    return 'http://localhost:3000';
}

function mapInviteErrorMessage(error?: { message?: string } | null): {
    status: InviteErrorStatus;
    message: string;
} {
    const errorMessage = error?.message || 'Failed to send invite';
    const normalizedMessage = errorMessage.toLowerCase();

    if (
        normalizedMessage.includes('already registered') ||
        normalizedMessage.includes('already exists')
    ) {
        return {
            status: 409,
            message: 'User is already registered in the system.',
        };
    }

    if (normalizedMessage.includes('rate limit')) {
        return {
            status: 429,
            message:
                'Email rate limit exceeded. Please try again later or configure a custom SMTP server.',
        };
    }

    if (
        normalizedMessage.includes('error sending invite email') ||
        normalizedMessage.includes('unexpected_failure')
    ) {
        return {
            status: 502,
            message:
                'Failed to send invite email. Please verify your Supabase SMTP and Resend domain settings.',
        };
    }

    return {
        status: 400 as InviteErrorStatus,
        message: errorMessage,
    };
}

export class UserInviteService {
    static async inviteUserAuth(values: CreateUserBody, requestOrigin?: string) {
        const coreRoles = ['superadmin', 'admin', 'disciplinary_officer'];
        const normalizedRole = values.role?.toLowerCase() || '';
        const portal: InvitePortal = coreRoles.includes(normalizedRole)
            ? 'core'
            : normalizedRole === 'support'
              ? 'support'
              : 'web';
        const redirectBase = resolveInviteBaseUrl(portal, requestOrigin);

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(values.email, {
            data: {
                first_name: values.firstName,
                last_name: values.lastName,
                role: normalizedRole,
            },
            redirectTo: `${redirectBase}/auth/callback?next=/auth/update-password`,
        });

        if (data?.user) {
            await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
                app_metadata: { role: normalizedRole },
            });
        }

        if (error || !data?.user) {
            console.error('Supabase admin invite user error:', error);

            const inviteError = mapInviteErrorMessage(error);
            throw new HTTPException(inviteError.status, { message: inviteError.message });
        }

        return { id: data.user.id };
    }
}
