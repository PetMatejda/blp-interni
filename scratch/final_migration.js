const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError.message);
    return;
  }

  const emailToId = {};
  users.forEach(u => {
    emailToId[u.email] = u.id;
  });

  for (const [excelName, info] of Object.entries(userMapping)) {
    console.log(`\nProcessing ${excelName} (${info.email})...`);
    
    let userId = emailToId[info.email];

    if (!userId) {
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email: info.email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: info.name }
      });

      if (createError) {
        console.error(`Create error for ${info.email}:`, createError.message);
        continue;
      }
      userId = userData.user.id;
    }

    const userRecords = history.filter(r => r.name === excelName);
    console.log(`Found ${userRecords.length} records for ${excelName}.`);

    if (userRecords.length > 0) {
      const toInsert = userRecords.map(r => {
        // Fix check_in/out format
        // Some records have "1900-01-01 00:00:00" which means 00:00:00
        let cin = r.check_in;
        if (cin.includes('1900-01-01')) cin = cin.split(' ')[1];
        
        let cout = r.check_out;
        if (cout.includes('1900-01-01')) cout = cout.split(' ')[1];

        // Ensure 00:00:00 is handled if it's missing seconds or similar
        if (cin === '00:00:00') cin = '00:00:00';
        if (cout === '00:00:00') cout = '00:00:00';

        return {
          user_id: userId,
          check_in: `${r.date}T${cin}`,
          check_out: `${r.date}T${cout}`,
          type: 'Sklad', // Default type
          comment: 'Import z historie'
        };
      });

      // Insert in chunks
      for (let i = 0; i < toInsert.length; i += 50) {
        const chunk = toInsert.slice(i, i + 50);
        const { error: insertError } = await supabase.from('attendance').insert(chunk);
        if (insertError) {
          console.error(`Insert error for ${excelName}:`, insertError.message);
        } else {
          console.log(`Inserted chunk ${i/50 + 1} for ${excelName}.`);
        }
      }
    }
  }
  console.log('\nMigration successful!');
}

migrate();
