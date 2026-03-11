import { type DbClient } from '@sentinel/db';
import * as bcrypt from 'bcrypt';
import { type CreateUserBody, type UpdateUserBody } from '../user.dto';

export class UserAuthService {
    static async createUserAuth(dbClient: DbClient, userId: string, values: CreateUserBody) {
        const hashedPassword = await bcrypt.hash('Password123!', 10);

        await dbClient
            .insertInto('auth.users')
            .values({
                id: userId,
                email: values.email,
                encrypted_password: hashedPassword,
                email_confirmed_at: new Date() as any,
                role: 'authenticated', // Supabase default
                aud: 'authenticated',
                raw_user_meta_data: {
                    first_name: values.firstName,
                    last_name: values.lastName,
                    role: values.role,
                },
                created_at: new Date() as any,
                updated_at: new Date() as any,
                is_sso_user: false,
            })
            .execute();

        // Update with specific app role
        await dbClient
            .updateTable('auth.users')
            .set({ role: values.role })
            .where('id', '=', userId)
            .execute();

        return { id: userId };
    }

    static async updateUserAuth(dbClient: DbClient, id: string, values: UpdateUserBody) {
        const authUpdates: any = { updated_at: new Date().toISOString() };
        if (values.role) authUpdates.role = values.role;
        if (values.email) authUpdates.email = values.email;

        if (values.firstName || values.lastName || values.role) {
            const currentUser = await dbClient
                .selectFrom('auth.users')
                .where('id', '=', id)
                .select('raw_user_meta_data')
                .executeTakeFirst();

            const currentMeta = (currentUser?.raw_user_meta_data as any) || {};
            authUpdates.raw_user_meta_data = {
                ...currentMeta,
                ...(values.firstName ? { first_name: values.firstName } : {}),
                ...(values.lastName ? { last_name: values.lastName } : {}),
                ...(values.role ? { role: values.role } : {}),
            };
        }

        if (Object.keys(authUpdates).length > 1) {
            await dbClient
                .updateTable('auth.users')
                .set(authUpdates)
                .where('id', '=', id)
                .execute();
        }
    }

    static async deleteUserAuth(dbClient: DbClient, id: string) {
        await dbClient.deleteFrom('auth.users').where('id', '=', id).execute();
    }
}
