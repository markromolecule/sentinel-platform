import { type DbClient } from '@sentinel/db';
import { type CreateUserBody, type UpdateUserBody } from '../user.dto';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { HTTPException } from 'hono/http-exception';

export class UserAuthService {
    static async createUserAuth(dbClient: DbClient, values: CreateUserBody) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: values.email,
            password: 'Password123!',
            email_confirm: true,
            user_metadata: {
                first_name: values.firstName,
                last_name: values.lastName,
                role: values.role?.toLowerCase(),
            },
            app_metadata: {
                role: values.role?.toLowerCase(),
            },
        });

        if (error || !data?.user) {
            console.error('Supabase admin create user error:', error);
            throw new HTTPException(400, {
                message: error?.message || 'Failed to create auth user',
            });
        }
        return { id: data.user.id };
    }

    static async updateUserAuth(dbClient: DbClient, id: string, values: UpdateUserBody) {
        // Construct metadata payloads.
        const userMetadata: Record<string, any> = {};
        const appMetadata: Record<string, any> = {};

        if (values.firstName) userMetadata.first_name = values.firstName;
        if (values.lastName) userMetadata.last_name = values.lastName;

        if (values.role) {
            const role = values.role.toLowerCase();
            userMetadata.role = role;
            appMetadata.role = role;
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
            ...(values.email && { email: values.email }),
            ...(Object.keys(userMetadata).length > 0 && { user_metadata: userMetadata }),
            ...(Object.keys(appMetadata).length > 0 && { app_metadata: appMetadata }),
        });

        if (error) {
            console.error('Supabase admin update user error:', error);
            throw new HTTPException(400, { message: error.message });
        }
    }

    static async deleteUserAuth(dbClient: DbClient, id: string) {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            console.error('Supabase admin delete user error:', error);
            throw new HTTPException(400, { message: error.message });
        }
    }

    static async inviteUserAuth(dbClient: DbClient, values: CreateUserBody) {
        const coreRoles = ['superadmin', 'admin', 'disciplinary_officer'];
        const isCoreRole = coreRoles.includes(values.role?.toLowerCase() || '');

        const redirectBase = isCoreRole
            ? process.env.NEXT_PUBLIC_CORE_URL || 'http://localhost:3002'
            : process.env.FRONTEND_URL || 'http://localhost:3000';

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(values.email, {
            data: {
                first_name: values.firstName,
                last_name: values.lastName,
                role: values.role?.toLowerCase(),
            },
            redirectTo: `${redirectBase}/auth/callback?next=/auth/update-password`,
        });

        // After inviting, we immediately update the user to set app_metadata
        // as inviteUserByEmail doesn't support app_metadata directly in the same call.
        if (data?.user) {
            await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
                app_metadata: { role: values.role?.toLowerCase() },
            });
        }

        if (error || !data?.user) {
            const errorMessage = error?.message || 'Failed to send invite';
            const isDuplicate =
                errorMessage.toLowerCase().includes('already registered') ||
                errorMessage.toLowerCase().includes('already exists');
            const isRateLimit = errorMessage.toLowerCase().includes('rate limit');
            const isSmtpError =
                errorMessage.toLowerCase().includes('error sending invite email') ||
                errorMessage.toLowerCase().includes('unexpected_failure');

            console.error('Supabase admin invite user error:', error);

            let status: any = 400;
            let message = errorMessage;

            if (isDuplicate) {
                status = 409;
                message = 'User is already registered in the system.';
            } else if (isRateLimit) {
                status = 429;
                message =
                    'Email rate limit exceeded. Please try again later or configure a custom SMTP server.';
            } else if (isSmtpError) {
                status = 502;
                message =
                    'Failed to send invite email. Please verify your Supabase SMTP and Resend domain settings.';
            }

            throw new HTTPException(status, { message });
        }

        return { id: data.user.id };
    }
}
