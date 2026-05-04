const { createClient } = require('@supabase/supabase-js');

const url = "https://rxvjuliaxorfvxvlmpiw.supabase.co";
const key = "sb_publishable_fEHhrXkLBZyCQx8nVLEFRQ_yuJ484R9";

const supabase = createClient(url, key);

async function checkAttendance() {
  const { data, error } = await supabase.from('attendance').select('user_id').limit(10);
  if (error) {
    console.error('Error:', error);
    return;
  }
  const uniqueUsers = [...new Set(data.map(a => a.user_id))];
  console.log('--- Unique Users in Attendance ---');
  uniqueUsers.forEach(id => console.log(id));
}

checkAttendance();
