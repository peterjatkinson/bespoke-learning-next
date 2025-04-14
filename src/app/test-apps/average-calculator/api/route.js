import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create a 'service' client we can use server-side:
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST: Insert new data into "app_data"
export async function POST(request) {
  try {
    const { app_id, data } = await request.json();

    const { error } = await supabase
      .from("app_data")
      .insert([{ app_id, data }]);

    if (error) {
      console.error("Error saving number:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: Fetch all numbers for the app_id in the current year, then compute the average
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const app_id = searchParams.get("app_id");

    if (!app_id) {
      return NextResponse.json(
        { error: "Missing app_id in query params." },
        { status: 400 },
      );
    }

    // Only fetch data from the current calendar year:
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1).toISOString();
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from("app_data")
      .select("data, created_at")
      .eq("app_id", app_id)
      .gte("created_at", startOfYear)
      .lte("created_at", endOfYear);

    if (error) {
      console.error("Error fetching numbers:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Compute the average:
    const numbers = (data || []).map((item) => Number(item.data.number));
    const avg =
      numbers.reduce((acc, num) => acc + num, 0) / (numbers.length || 1);

    return NextResponse.json({
      numbers,
      average: numbers.length ? avg : 0,
    });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove a row based on userId in data->>userId (and app_id)
export async function DELETE(request) {
  try {
    const { app_id, userId } = await request.json();

    if (!app_id || !userId) {
      return NextResponse.json(
        { error: "Missing app_id or userId in request body." },
        { status: 400 },
      );
    }

    // Delete the row(s) matching this user for the given app
    const { error } = await supabase
      .from("app_data")
      .delete()
      .eq("app_id", app_id)
      .eq("data->>userId", userId);

    if (error) {
      console.error("Error resetting submission:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
