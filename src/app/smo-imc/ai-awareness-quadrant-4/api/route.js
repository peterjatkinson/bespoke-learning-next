// /app/smo-imc/ai-awareness-quadrant/api/route.js
// Handles GET, POST, and DELETE for company data.

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// --- Handle GET requests to fetch all companies ---
export async function GET() {
  if (!supabase) {
    console.error("Supabase environment variables are not set for GET.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }
  
  try {
    const appIdentifier = 'QuadrantApp';

    const { data, error } = await supabase
      .from('app_data')
      .select('id, data, created_at')
      .eq('app_id', appIdentifier)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase select error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Server error in GET:", error);
    return NextResponse.json({ error: "An unexpected error occurred while fetching data." }, { status: 500 });
  }
}

// --- Handle POST requests to save a new company ---
export async function POST(request) {
  if (!supabase) {
    console.error("Supabase environment variables are not set for POST.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  try {
    const { app_id, data: companyData } = await request.json(); // Renamed data to companyData to avoid conflict

    if (!app_id || !companyData || typeof companyData.name !== 'string' || typeof companyData.x !== 'number' || typeof companyData.y !== 'number') {
      return NextResponse.json({ error: "Invalid data format provided." }, { status: 400 });
    }

    const { data: insertedData, error } = await supabase
      .from("app_data")
      .insert([{ 
        app_id: app_id, 
        data: { name: companyData.name, x: companyData.x, y: companyData.y } 
      }])
      .select('id') // Select the id of the inserted row
      .single();    // Expect a single row back

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: insertedData.id }, { status: 201 }); // Return the ID
  } catch (error) {
    console.error("Server error in POST:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
    }
    return NextResponse.json({ error: "An unexpected error occurred while saving data." }, { status: 500 });
  }
}

// --- Handle DELETE requests to remove a company ---
export async function DELETE(request) {
  if (!supabase) {
    console.error("Supabase environment variables are not set for DELETE.");
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  try {
    const { id } = await request.json(); // Expecting the database record ID

    if (!id) {
      return NextResponse.json({ error: "Missing record ID for deletion." }, { status: 400 });
    }

    // Optional: You might want to verify that this ID belongs to the 'QuadrantApp'
    // if you have a multi-tenant `app_data` table, but for this specific app,
    // deleting by ID should be fine if IDs are unique across all apps.
    // If IDs are only unique per app_id, you'd add .eq('app_id', 'QuadrantApp') here.
    // Given the structure, just ID should be sufficient if IDs are UUIDs.

    const { error: deleteError } = await supabase // Renamed error to deleteError
      .from('app_data')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Record deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Server error in DELETE:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
    }
    return NextResponse.json({ error: "An unexpected error occurred while deleting data." }, { status: 500 });
  }
}