// app/api/submit-data/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY; // This key is secret, don’t expose it on the client!

// Create the client for server-side use.
const supabase = createClient(supabaseUrl, supabaseSecretKey);

export async function POST(request) {
  try {
    const { app_id, data } = await request.json();

    const { error } = await supabase
      .from("app_data")
      .insert([{ app_id, data }]);

    if (error) {
      console.error("Error saving data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
