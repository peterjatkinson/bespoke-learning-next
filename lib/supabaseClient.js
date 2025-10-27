// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Use NEXT_PUBLIC_ prefix so these are accessible in both client and server as needed.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Create a singleton client instance.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// === Test project ===
const supabaseTestUrl = process.env.NEXT_PUBLIC_SUPABASE_TEST_URL;
const supabaseTestKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_TEST_KEY;
export const supabaseTest = createClient(supabaseTestUrl, supabaseTestKey);
