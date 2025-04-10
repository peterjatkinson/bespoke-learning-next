// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Use NEXT_PUBLIC_ prefix so these are accessible in both client and server as needed.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a singleton client instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
