const { createClient } = require('@supabase/supabase-js');

const url = "https://rxvjuliaxorfvxvlmpiw.supabase.co";
const key = "sb_publishable_fEHhrXkLBZyCQx8nVLEFRQ_yuJ484R9";

const supabase = createClient(url, key);

async function testSignUp() {
  const email = "jaroslav.hluchy@gmail.com";
  const password = "TemporaryPassword123!"; // They can reset it later
  
  console.log(`Trying to sign up ${email}...`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Jaroslav Hluchý'
      }
    }
  });
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! User ID:', data.user.id);
    console.log('Identities:', data.user.identities);
  }
}

testSignUp();
