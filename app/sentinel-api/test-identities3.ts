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
  if (data.users.length > 0) {
      console.log('Sample User Keys:', Object.keys(data.users[0]));
      console.log('Sample User last_sign_in_at:', data.users[0].last_sign_in_at);
      // See if we have an identities array
      if (data.users[0].identities) {
         console.log('Sample User Identity 0:', data.users[0].identities[0]);
      }
  }
}

test();
