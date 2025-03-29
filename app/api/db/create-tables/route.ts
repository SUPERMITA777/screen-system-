import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si las tablas existen
    const tables = ["dj_config", "screen_messages", "screen_config", "song_requests"]
    const results = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("id").limit(1)
        results[table] = { exists: !error, error: error ? JSON.stringify(error) : null }
      } catch (error) {
        console.error(`Error al verificar tabla ${table}:`, error)
        results[table] = { exists: false, error: String(error) }
      }
    }

    // Intentar crear la tabla dj_config si no existe
    if (!results["dj_config"]?.exists) {
      try {
        // Intentar insertar un registro para crear la tabla
        const { error } = await supabase.from("dj_config").insert({
          show_tip_section: false,
          show_message_section: false,
        })

        if (error) {
          console.error("Error al crear dj_config:", JSON.stringify(error))
          results["dj_config"].createError = JSON.stringify(error)
        } else {
          results["dj_config"].created = true
        }
      } catch (error) {
        console.error("Error al crear dj_config:", error)
        results["dj_config"].createError = String(error)
      }
    }

    // No intentamos crear las otras tablas automáticamente, ya que probablemente fallarán
    // En su lugar, proporcionamos instrucciones para crearlas manualmente

    return NextResponse.json({
      success: true,
      message: "Verificación de tablas completada",
      results,
      instructions: {
        dj_config: `
          CREATE TABLE public.dj_config (
            id SERIAL PRIMARY KEY,
            show_tip_section BOOLEAN DEFAULT FALSE,
            show_message_section BOOLEAN DEFAULT FALSE
          );
        `,
        screen_messages: `
          CREATE TABLE public.screen_messages (
            id SERIAL PRIMARY KEY,
            message TEXT,
            image_url TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            visible BOOLEAN DEFAULT TRUE,
            display_time INTEGER DEFAULT 10
          );
        `,
        screen_config: `
          CREATE TABLE public.screen_config (
            id SERIAL PRIMARY KEY,
            enabled BOOLEAN DEFAULT TRUE,
            display_time INTEGER DEFAULT 10000,
            transition_effect TEXT DEFAULT 'fade',
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            image_size_percent INTEGER DEFAULT 80,
            enable_movement BOOLEAN DEFAULT TRUE,
            enable_effects BOOLEAN DEFAULT FALSE,
            effect_type TEXT DEFAULT 'none'
          );
        `,
        song_requests: `
          CREATE TABLE public.song_requests (
            id SERIAL PRIMARY KEY,
            song TEXT NOT NULL,
            name TEXT NOT NULL,
            tip NUMERIC DEFAULT 0,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            played BOOLEAN DEFAULT FALSE
          );
        `,
      },
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

