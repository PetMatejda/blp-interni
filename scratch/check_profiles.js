const { createClient } = require('@supabase/supabase-js');

const url = "https://rxvjuliaxorfvxvlmpiw.supabase.co";
const key = "sb_publishable_fEHhrXkLBZyCQx8nVLEFRQ_yuJ484R9";

const supabase = createClient(url, key);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('--- Profiles in DB ---');
  data.forEach(p => {
    console.log(`ID: ${p.id}, Name: ${p.full_name}, Email: ${p.email}`);
  });
}

checkProfiles();
