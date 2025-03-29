import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "public" },
    })

    // Crear tabla dj_config
    const createDjConfigSql = `
    CREATE TABLE IF NOT EXISTS public.dj_config (
      id SERIAL PRIMARY KEY,
      show_tip_section BOOLEAN DEFAULT FALSE,
      show_message_section BOOLEAN DEFAULT FALSE
    );
    
    -- Insertar configuración por defecto si la tabla está vacía
    INSERT INTO public.dj_config (id, show_tip_section, show_message_section)
    SELECT 1, FALSE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM public.dj_config WHERE id = 1);
    `

    // Crear tabla screen_messages
    const createScreenMessagesSql = `
    CREATE TABLE IF NOT EXISTS public.screen_messages (
      id SERIAL PRIMARY KEY,
      message TEXT,
      image_url TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      visible BOOLEAN DEFAULT TRUE
    );
    `

    // Crear tabla screen_config
    const createScreenConfigSql = `
    CREATE TABLE IF NOT EXISTS public.screen_config (
      id SERIAL PRIMARY KEY,
      enabled BOOLEAN DEFAULT TRUE,
      display_time INTEGER DEFAULT 10000,
      transition_effect TEXT DEFAULT 'fade',
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Insertar configuración por defecto si la tabla está vacía
    INSERT INTO public.screen_config (id, enabled, display_time, transition_effect)
    SELECT 1, TRUE, 10000, 'fade'
    WHERE NOT EXISTS (SELECT 1 FROM public.screen_config WHERE id = 1);
    `

    // Crear tabla song_requests
    const createSongRequestsSql = `
    CREATE TABLE IF NOT EXISTS public.song_requests (
      id SERIAL PRIMARY KEY,
      song TEXT NOT NULL,
      name TEXT NOT NULL,
      tip NUMERIC DEFAULT 0,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      played BOOLEAN DEFAULT FALSE
    );
    `

    // Ejecutar las consultas SQL
    try {
      await supabase.from("dj_config").select("count").limit(1)
    } catch (error) {
      console.log("Creando tabla dj_config...")
      // La tabla no existe, intentar crearla
      const { error: createError } = await supabase.rpc("create_dj_config_table")
      if (createError) {
        console.error("Error al crear tabla dj_config:", createError)
      }
    }

    try {
      await supabase.from("screen_messages").select("count").limit(1)
    } catch (error) {
      console.log("Creando tabla screen_messages...")
      // La tabla no existe, intentar crearla
      const { error: createError } = await supabase.rpc("create_screen_messages_table")
      if (createError) {
        console.error("Error al crear tabla screen_messages:", createError)
      }
    }

    try {
      await supabase.from("screen_config").select("count").limit(1)
    } catch (error) {
      console.log("Creando tabla screen_config...")
      // La tabla no existe, intentar crearla
      const { error: createError } = await supabase.rpc("create_screen_config_table")
      if (createError) {
        console.error("Error al crear tabla screen_config:", createError)
      }
    }

    try {
      await supabase.from("song_requests").select("count").limit(1)
    } catch (error) {
      console.log("Creando tabla song_requests...")
      // La tabla no existe, intentar crearla
      const { error: createError } = await supabase.rpc("create_song_requests_table")
      if (createError) {
        console.error("Error al crear tabla song_requests:", createError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tablas verificadas correctamente",
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

