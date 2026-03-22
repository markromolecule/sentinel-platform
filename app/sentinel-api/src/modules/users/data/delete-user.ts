import { type DbClient } from '@sentinel/db';

export type DeleteUserDataArgs = {
    dbClient: DbClient;
    id: string;
};

export async function deleteUserData({ dbClient, id }: DeleteUserDataArgs) {
    // Explicitly delete from dependent tables to ensure no orphans
    // regardless of database level cascade configurations.
    
    // 1. Delete from students
    await dbClient.deleteFrom('students').where('user_id', '=', id).execute();
    
    // 2. Delete from instructors
    await dbClient.deleteFrom('instructors').where('user_id', '=', id).execute();
    
    // 3. Delete from user_profiles
    await dbClient.deleteFrom('user_profiles').where('user_id', '=', id).execute();
    
    return null;
}
