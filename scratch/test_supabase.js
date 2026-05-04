const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rxvjuliaxorfvxvlmpiw.supabase.co';
const supabaseAnonKey = 'sb_publishable_fEHhrXkLBZyCQx8nVLEFRQ_yuJ484R9';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  // Try to fetch something public or just get server time
  const { data, error } = await supabase.from('attendance').select('*').limit(1);
  
  if (error) {
    console.error('Connection failed:', error.message);
    if (error.message.includes('FetchError')) {
      console.log('TIP: Check if the URL is correct and Supabase project is active.');
    }
  } else {
    console.log('Connection successful!');
    console.log('Data fetched (even if empty, it means keys are valid):', data);
  }
}

testConnection();
