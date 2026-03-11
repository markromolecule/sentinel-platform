import { config } from 'dotenv';
config({ path: '../../.env' }); // Load .env
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.auth.admin.listUsers();
    if(error){
        console.log("Error:", error);
    } else {
        const u = data.users[0];
        console.log('last sign in:', u.last_sign_in_at);
        console.log('identities:', u.identities?.[0]?.last_sign_in_at);
    }
}
check();
