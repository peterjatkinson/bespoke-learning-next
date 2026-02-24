import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

let supabase;
if (supabaseUrl && supabaseSecretKey) {
  supabase = createClient(supabaseUrl, supabaseSecretKey);
}

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }
  
  const { data, error } = await supabase
    .from('app_data_test-area')
    .select('id, data, created_at')
    .eq('app_id', 'MedianCalculator')
    .order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data: data || [] }, { status: 200 });
}

export async function POST(request) {
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }
  
  const { app_id, data: numberData } = await request.json();
  
  const { data: insertedData, error } = await supabase
    .from("app_data_test-area")
    .insert([{ app_id: app_id, data: numberData }])
    .select('id')
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, id: insertedData.id }, { status: 201 });
}

export async function DELETE(request) {
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }
  
  const { id } = await request.json();
  
  const { error } = await supabase
    .from('app_data_test-area')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
}