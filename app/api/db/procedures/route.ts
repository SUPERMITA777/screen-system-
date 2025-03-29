import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Crear procedimiento para tabla song_requests
    const songRequestsProc = `
    CREATE OR REPLACE FUNCTION create_song_requests_table()
    RETURNS void AS $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'song_requests'
      ) THEN
        CREATE TABLE public.song_requests (
          id SERIAL PRIMARY KEY,
          song TEXT NOT NULL,
          name TEXT NOT NULL,
          tip NUMERIC DEFAULT 0,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          played BOOLEAN DEFAULT FALSE
        );
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Crear procedimiento para tabla dj_config
    const djConfigProc = `
    CREATE OR REPLACE FUNCTION create_dj_config_table()
    RETURNS void AS $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dj_config'
      ) THEN
        CREATE TABLE public.dj_config (
          id SERIAL PRIMARY KEY,
          show_tip_section BOOLEAN DEFAULT FALSE,
          show_message_section BOOLEAN DEFAULT FALSE
        );
        
        INSERT INTO public.dj_config (id, show_tip_section, show_message_section)
        VALUES (1, FALSE, FALSE);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Crear procedimiento para tabla screen_messages
    const screenMessagesProc = `
    CREATE OR REPLACE FUNCTION create_screen_messages_table()
    RETURNS void AS $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'screen_messages'
      ) THEN
        CREATE TABLE public.screen_messages (
          id SERIAL PRIMARY KEY,
          message TEXT,
          image_url TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          visible BOOLEAN DEFAULT TRUE
        );
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Crear procedimiento para tabla screen_config
    const screenConfigProc = `
    CREATE OR REPLACE FUNCTION create_screen_config_table()
    RETURNS void AS $$
    BEGIN
      IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'screen_config'
      ) THEN
        CREATE TABLE public.screen_config (
          id SERIAL PRIMARY KEY,
          enabled BOOLEAN DEFAULT TRUE,
          display_time INTEGER DEFAULT 10000,
          transition_effect TEXT DEFAULT 'fade',
          last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO public.screen_config (id, enabled, display_time, transition_effect)
        VALUES (1, TRUE, 10000, 'fade');
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Ejecutar los procedimientos
    const { error: error1 } = await supabase.rpc("exec_sql", { sql: songRequestsProc })
    const { error: error2 } = await supabase.rpc("exec_sql", { sql: djConfigProc })
    const { error: error3 } = await supabase.rpc("exec_sql", { sql: screenMessagesProc })
    const { error: error4 } = await supabase.rpc("exec_sql", { sql: screenConfigProc })

    // Verificar si hubo errores
    if (error1 || error2 || error3 || error4) {
      console.error("Errores al crear procedimientos:", {
        error1,
        error2,
        error3,
        error4,
      })

      return NextResponse.json(
        {
          success: false,
          errors: {
            error1,
            error2,
            error3,
            error4,
          },
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Procedimientos creados correctamente",
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

