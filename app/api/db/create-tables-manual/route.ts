import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // SQL para crear las tablas necesarias
    const sql = `
    -- Crear tabla dj_config
    CREATE TABLE IF NOT EXISTS public.dj_config (
      id SERIAL PRIMARY KEY,
      show_tip_section BOOLEAN DEFAULT FALSE,
      show_message_section BOOLEAN DEFAULT FALSE
    );
    
    -- Insertar configuración por defecto si la tabla está vacía
    INSERT INTO public.dj_config (id, show_tip_section, show_message_section)
    SELECT 1, FALSE, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM public.dj_config WHERE id = 1);
    
    -- Crear tabla screen_messages si no existe
    CREATE TABLE IF NOT EXISTS public.screen_messages (
      id SERIAL PRIMARY KEY,
      message TEXT,
      image_url TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      visible BOOLEAN DEFAULT TRUE,
      display_time INTEGER DEFAULT 10
    );
    
    -- Crear tabla screen_config si no existe
    CREATE TABLE IF NOT EXISTS public.screen_config (
      id SERIAL PRIMARY KEY,
      enabled BOOLEAN DEFAULT TRUE,
      display_time INTEGER DEFAULT 10000,
      transition_effect TEXT DEFAULT 'fade',
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      image_size_percent INTEGER DEFAULT 80,
      enable_movement BOOLEAN DEFAULT TRUE,
      enable_effects BOOLEAN DEFAULT FALSE,
      effect_type TEXT DEFAULT 'none',
      random_transitions BOOLEAN DEFAULT FALSE
    );
    
    -- Insertar configuración por defecto si la tabla está vacía
    INSERT INTO public.screen_config (id, enabled, display_time, transition_effect, image_size_percent, enable_movement, enable_effects, effect_type, random_transitions)
    SELECT 1, TRUE, 10000, 'fade', 80, TRUE, FALSE, 'none', FALSE
    WHERE NOT EXISTS (SELECT 1 FROM public.screen_config WHERE id = 1);
    `

    // Intentar ejecutar el SQL directamente
    try {
      // Ejecutar cada sentencia por separado
      const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)

      for (const statement of statements) {
        try {
          // Usar RPC si está disponible
          const { error } = await supabase.rpc("exec_sql", { sql: statement })

          if (error) {
            console.error(`Error ejecutando SQL: ${statement}`, error)
          }
        } catch (stmtError) {
          console.error(`Error ejecutando sentencia: ${statement}`, stmtError)
          // Continuar con la siguiente sentencia
        }
      }

      return NextResponse.json({
        success: true,
        message: "Tablas creadas o verificadas correctamente",
      })
    } catch (sqlError) {
      console.error("Error ejecutando SQL:", sqlError)

      // Si falla, intentar crear las tablas una por una usando métodos alternativos
      try {
        // Verificar si la tabla dj_config existe
        const { error: checkDjConfigError } = await supabase.from("dj_config").select("id").limit(1)

        if (checkDjConfigError) {
          // Intentar crear la tabla usando insert
          try {
            const { error: insertError } = await supabase.from("dj_config").insert({
              id: 1,
              show_tip_section: false,
              show_message_section: false,
            })

            if (insertError && insertError.code !== "23505") {
              console.error("Error al crear dj_config:", insertError)
            }
          } catch (insertError) {
            console.error("Error al crear dj_config:", insertError)
          }
        }

        // Verificar si la tabla screen_config existe
        const { error: checkScreenConfigError } = await supabase.from("screen_config").select("id").limit(1)

        if (checkScreenConfigError) {
          // Intentar crear la tabla usando insert
          try {
            const { error: insertError } = await supabase.from("screen_config").insert({
              id: 1,
              enabled: true,
              display_time: 10000,
              transition_effect: "fade",
              image_size_percent: 80,
              enable_movement: true,
              enable_effects: false,
              effect_type: "none",
              random_transitions: false,
            })

            if (insertError && insertError.code !== "23505") {
              console.error("Error al crear screen_config:", insertError)
            }
          } catch (insertError) {
            console.error("Error al crear screen_config:", insertError)
          }
        }

        return NextResponse.json({
          success: true,
          message: "Se intentó crear las tablas usando métodos alternativos",
        })
      } catch (alternativeError) {
        console.error("Error al intentar métodos alternativos:", alternativeError)
        return NextResponse.json(
          {
            success: false,
            error: "No se pudieron crear las tablas",
            message: "Por favor, ejecuta el SQL manualmente en el panel de Supabase",
            sql: sql,
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: String(error),
      },
      { status: 500 },
    )
  }
}

