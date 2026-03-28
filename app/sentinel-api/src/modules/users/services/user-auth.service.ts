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
}
