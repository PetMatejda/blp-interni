const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("URL:", supabaseUrl);
  // Log in as the user to test RLS
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'petmatejda@gmail.com', // Assuming this is the user
    password: 'password' // We don't have the password
  });
  
  // We can just use service role key if we had it, but we only have anon key.
}
check();
