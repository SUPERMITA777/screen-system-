import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = getSupabaseServer()

    // Crear la función RPC para crear la tabla title_config
    const createTitleConfigFunction = `
    CREATE OR REPLACE FUNCTION create_title_config_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS title_config (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL DEFAULT 'INTERACTIVE SCREEN & MUSIC',
        image_url TEXT,
        left_image_url TEXT,
        right_image_url TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        image_size_percent INTEGER DEFAULT 80,
        is_static BOOLEAN DEFAULT FALSE
      );
      
      -- Insertar registro inicial si la tabla está vacía
      IF NOT EXISTS (SELECT 1 FROM title_config) THEN
        INSERT INTO title_config (text, enabled, image_size_percent, is_static)
        VALUES ('INTERACTIVE SCREEN & MUSIC', TRUE, 80, FALSE);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Crear la función RPC para crear la tabla zocal_config
    const createZocalConfigFunction = `
    CREATE OR REPLACE FUNCTION create_zocal_config_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS zocal_config (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL DEFAULT 'INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita',
        image_url TEXT,
        left_image_url TEXT,
        right_image_url TEXT,
        enabled BOOLEAN DEFAULT TRUE,
        image_size_percent INTEGER DEFAULT 80,
        is_static BOOLEAN DEFAULT FALSE
      );
      
      -- Insertar registro inicial si la tabla está vacía
      IF NOT EXISTS (SELECT 1 FROM zocal_config) THEN
        INSERT INTO zocal_config (text, enabled, image_size_percent, is_static)
        VALUES ('INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita', TRUE, 80, FALSE);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    `

    // Ejecutar las consultas para crear las funciones
    await supabase.rpc("exec_sql", { sql: createTitleConfigFunction })
    await supabase.rpc("exec_sql", { sql: createZocalConfigFunction })

    // Ejecutar las funciones para crear las tablas
    await supabase.rpc("create_title_config_table")
    await supabase.rpc("create_zocal_config_table")

    return NextResponse.json({ success: true, message: "Tablas inicializadas correctamente" })
  } catch (error) {
    console.error("Error al inicializar tablas:", error)
    return NextResponse.json({ error: "Error al inicializar tablas" }, { status: 500 })
  }
}

