import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Faltan variables de entorno" }, { status: 500 })
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "public" },
    })

    // Crear tabla screen_messages
    const { error: error1 } = await supabase.rpc("exec_sql", {
      sql: `
      CREATE TABLE IF NOT EXISTS public.screen_messages (
        id SERIAL PRIMARY KEY,
        message TEXT,
        image_url TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        visible BOOLEAN DEFAULT TRUE,
        display_time INTEGER DEFAULT 10,
        max_repetitions INTEGER DEFAULT 10,
        current_repetitions INTEGER DEFAULT 0
      );

      -- Habilitar RLS
      ALTER TABLE public.screen_messages ENABLE ROW LEVEL SECURITY;

      -- Políticas de RLS
      DROP POLICY IF EXISTS "Permitir lectura pública de screen_messages" ON public.screen_messages;
      DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON public.screen_messages;
      DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON public.screen_messages;

      CREATE POLICY "Permitir lectura pública de screen_messages"
        ON public.screen_messages FOR SELECT
        TO public
        USING (true);

      CREATE POLICY "Permitir inserción a usuarios autenticados"
        ON public.screen_messages FOR INSERT
        TO authenticated
        WITH CHECK (true);

      CREATE POLICY "Permitir actualización a usuarios autenticados"
        ON public.screen_messages FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
      `
    })

    // Crear tabla title_config
    const { error: error2 } = await supabase.rpc("exec_sql", {
      sql: `
      CREATE TABLE IF NOT EXISTS public.title_config (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL DEFAULT 'DJ Song Request System',
        image_url TEXT DEFAULT NULL,
        left_image_url TEXT DEFAULT NULL,
        right_image_url TEXT DEFAULT NULL,
        enabled BOOLEAN DEFAULT TRUE,
        image_size_percent INTEGER DEFAULT 80,
        is_static BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Habilitar RLS
      ALTER TABLE public.title_config ENABLE ROW LEVEL SECURITY;

      -- Políticas de RLS
      DROP POLICY IF EXISTS "Permitir lectura pública de title_config" ON public.title_config;
      DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON public.title_config;
      DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON public.title_config;

      CREATE POLICY "Permitir lectura pública de title_config"
        ON public.title_config FOR SELECT
        TO public
        USING (true);

      CREATE POLICY "Permitir inserción a usuarios autenticados"
        ON public.title_config FOR INSERT
        TO authenticated
        WITH CHECK (true);

      CREATE POLICY "Permitir actualización a usuarios autenticados"
        ON public.title_config FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);

      -- Insertar configuración por defecto si la tabla está vacía
      INSERT INTO public.title_config (id, text, enabled, is_static)
      SELECT 1, 'DJ Song Request System', TRUE, FALSE
      WHERE NOT EXISTS (SELECT 1 FROM public.title_config WHERE id = 1);
      `
    })

    // Crear tabla screen_config
    const { error: error3 } = await supabase.rpc("exec_sql", {
      sql: `
      CREATE TABLE IF NOT EXISTS public.screen_config (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN DEFAULT TRUE,
        display_time INTEGER DEFAULT 10000,
        transition_effect TEXT DEFAULT 'fade',
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Habilitar RLS
      ALTER TABLE public.screen_config ENABLE ROW LEVEL SECURITY;

      -- Políticas de RLS
      DROP POLICY IF EXISTS "Permitir lectura pública de screen_config" ON public.screen_config;
      DROP POLICY IF EXISTS "Permitir inserción a usuarios autenticados" ON public.screen_config;
      DROP POLICY IF EXISTS "Permitir actualización a usuarios autenticados" ON public.screen_config;

      CREATE POLICY "Permitir lectura pública de screen_config"
        ON public.screen_config FOR SELECT
        TO public
        USING (true);

      CREATE POLICY "Permitir inserción a usuarios autenticados"
        ON public.screen_config FOR INSERT
        TO authenticated
        WITH CHECK (true);

      CREATE POLICY "Permitir actualización a usuarios autenticados"
        ON public.screen_config FOR UPDATE
        TO authenticated
        USING (true)
        WITH CHECK (true);
      
      -- Insertar configuración por defecto si la tabla está vacía
      INSERT INTO public.screen_config (id, enabled, display_time, transition_effect)
      SELECT 1, TRUE, 10000, 'fade'
      WHERE NOT EXISTS (SELECT 1 FROM public.screen_config WHERE id = 1);
      `
    })

    if (error1 || error2 || error3) {
      console.error("Error al crear tablas:", { error1, error2, error3 })
      return NextResponse.json({ error: "Error al crear las tablas" }, { status: 500 })
    }

    return NextResponse.json({ message: "Tablas creadas correctamente" })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

