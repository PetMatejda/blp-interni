const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = "https://rxvjuliaxorfvxvlmpiw.supabase.co";
const key = "sb_publishable_fEHhrXkLBZyCQx8nVLEFRQ_yuJ484R9";

// Mapping from Excel name to Email
const userMapping = {
  'MACHAJDÍK': { email: 'jaroslav.hluchy@gmail.com', name: 'Jaroslav Hluchý' },
  'KOLODZIEJ': { email: 'koleczko66@gmail.com', name: 'Kolodziej' },
  'MICHAL': { email: 'petrmichal@gmail.com', name: 'Michal' },
  'HOLLAN': { email: 'jirkahollan@gmail.com', name: 'Jirka Hollan' },
  'RADOLF': { email: 'petrradolf@gmail.com', name: 'Petr Radolf' },
  'REŽŇÁK': { email: 'matejreznak@gmail.com', name: 'Matej Režňák' }
};

const password = "TemporaryPassword123!";

async function migrate() {
  const history = JSON.parse(fs.readFileSync('attendance_history.json', 'utf8'));
  console.log(`Read ${history.length} records.`);

  for (const [excelName, info] of Object.entries(userMapping)) {
    console.log(`\nProcessing ${excelName} (${info.email})...`);
    
    const supabase = createClient(url, key);
    
    // 1. Sign up (or it might already exist from my test)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: info.email,
      password: password,
      options: { data: { full_name: info.name } }
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      console.error(`Sign up error for ${info.email}:`, signUpError.message);
      continue;
    }

    // 2. Sign in to get session for RLS
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: info.email,
      password: password
    });

    if (signInError) {
      console.error(`Sign in error for ${info.email}:`, signInError.message);
      continue;
    }

    const userId = signInData.user.id;
    const userSupabase = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } }
    });

    // 3. Filter history for this user
    const userRecords = history.filter(r => r.name === excelName);
    console.log(`Found ${userRecords.length} records for ${excelName}.`);

    if (userRecords.length > 0) {
      const toInsert = userRecords.map(r => ({
        user_id: userId,
        date: r.date,
        check_in: r.check_in,
        check_out: r.check_out,
        type: 'work',
        comment: 'Import z historie'
      }));

      // Insert in chunks of 50 to avoid limits
      for (let i = 0; i < toInsert.length; i += 50) {
        const chunk = toInsert.slice(i, i + 50);
        const { error: insertError } = await userSupabase.from('attendance').insert(chunk);
        if (insertError) {
          console.error(`Insert error for ${excelName}:`, insertError.message);
        } else {
          console.log(`Inserted chunk ${i/50 + 1} for ${excelName}.`);
        }
      }
    }
  }
  console.log('\nMigration finished!');
}

migrate();
