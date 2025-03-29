import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

// Update the GET function to not rely on exec_sql
export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Check if the screen_messages table exists and if it has the display_time column
    try {
      const { data, error } = await supabase.from("screen_messages").select("display_time").limit(1)

      if (!error) {
        console.log("The display_time column already exists")
        return NextResponse.json({
          success: true,
          message: "display_time column already exists",
        })
      }

      // If there's an error, it could be because the table doesn't exist or the column doesn't exist
      console.error("Error checking display_time column:", error)

      // We can't add the column directly without raw SQL execution
      // Return a message suggesting to add it manually
      return NextResponse.json({
        success: false,
        message: "Cannot add display_time column automatically. Please add it manually in the Supabase dashboard.",
        instructions:
          "Add a column named 'display_time' of type INTEGER with default value 10 to the screen_messages table",
      })
    } catch (error) {
      console.error("Error checking display_time column:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Error checking display_time column",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

