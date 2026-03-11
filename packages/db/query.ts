import { Client } from 'pg';

async function main() {
    const client = new Client({
        connectionString: 'postgresql://postgres:@Silvallana02@db.khcnxdmiyyzgbafjprff.supabase.co:5432/postgres'
    });
    
    await client.connect();
    
    try {
        const defaultInstId = "7e34b907-6ed9-4d30-852d-34174e074ca4";
        const usersRes = await client.query("SELECT id, email, raw_user_meta_data FROM auth.users");
        
        let fixedCount = 0;
        for (const user of usersRes.rows) {
            const role = user.raw_user_meta_data?.role;
            if (role === 'admin') {
                const profileRes = await client.query("SELECT * FROM user_profiles WHERE user_id = $1", [user.id]);
                if (profileRes.rows.length === 0) {
                    await client.query(`
                        INSERT INTO user_profiles (user_id, first_name, last_name, institution_id, status)
                        VALUES ($1, 'Admin', 'User', $2, 'ACTIVE')
                    `, [user.id, defaultInstId]);
                    fixedCount++;
                    console.log(`Fixed missing profile for admin: ${user.email}`);
                } else if (!profileRes.rows[0].institution_id) {
                    await client.query("UPDATE user_profiles SET institution_id = $1 WHERE user_id = $2", [defaultInstId, user.id]);
                    fixedCount++;
                    console.log(`Fixed null institution_id for admin: ${user.email}`);
                }
            }
        }

        console.log(`All admin profiles checked! Fixed ${fixedCount} profiles.`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}

main().catch(console.error);
