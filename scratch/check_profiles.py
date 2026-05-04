import os
from supabase import create_client

url = "https://rxvjuliaxorfvxvlmpiw.supabase.co"
key = "sb_publishable_fEHhrXkLBZyCQx8nVLEFRQ_yuJ484R9" # Anon key

supabase = create_client(url, key)

def get_profiles():
    # Fetch all profiles
    # Note: RLS might prevent this if I'm not logged in.
    # But let's try.
    response = supabase.table('profiles').select('*').execute()
    return response.data

profiles = get_profiles()
if profiles:
    print("--- Profiles in DB ---")
    for p in profiles:
        print(f"ID: {p['id']}, Name: {p['full_name']}, Email: {p['email']}")
else:
    print("No profiles found or access denied.")
