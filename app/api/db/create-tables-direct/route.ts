import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar si las tablas existen
    const tables = ["dj_config", "screen_messages", "screen_config", "song_requests"]
    const results = {}

    for (const table of tables) {
      try {
        const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })
        results[table] = { exists: !error, count }
      } catch (error) {
        results[table] = { exists: false, error: String(error) }
      }
    }

    // Intentar crear la tabla dj_config si no existe
    if (!results["dj_config"]?.exists) {
      try {
        // Crear la tabla usando insert
        const { error } = await supabase.from("dj_config").insert({
          id: 1,
          show_tip_section: true,
          show_message_section: true,
        })

        if (error && error.code !== "23505") {
          // Ignorar error de clave duplicada
          console.error("Error al crear dj_config:", error)
        } else {
          results["dj_config"] = { exists: true, created: true }
        }
      } catch (error) {
        console.error("Error al crear dj_config:", error)
      }
    }

    // Intentar crear la tabla screen_config si no existe
    if (!results["screen_config"]?.exists) {
      try {
        // Crear la tabla usando insert
        const { error } = await supabase.from("screen_config").insert({
          id: 1,
          enabled: true,
          display_time: 10000,
          transition_effect: "fade",
          last_updated: new Date().toISOString(),
        })

        if (error && error.code !== "23505") {
          // Ignorar error de clave duplicada
          console.error("Error al crear screen_config:", error)
        } else {
          results["screen_config"] = { exists: true, created: true }
        }
      } catch (error) {
        console.error("Error al crear screen_config:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Verificación de tablas completada",
      results,
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

