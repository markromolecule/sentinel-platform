import { type DbClient } from '@sentinel/db';

export type DeleteUserDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteUserData({ dbClient, id }: DeleteUserDataArgs) {
    // Other cleanup if not handled by cascades
    // await dbClient.deleteFrom('user_profiles').where('user_id', '=', id).execute();
    return null;
}
