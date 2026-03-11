import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service_role to access auth.sessions
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  console.log('Users found:', data.users.length);
  // Unfortunately supabase admin API doesn't expose active sessions count directly easily per user,
  // But let's check a user's raw app metadata
  if (data.users.length > 0) {
      console.log('Sample User:', data.users[0]);
  }
}

test();
