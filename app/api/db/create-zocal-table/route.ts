import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // SQL para crear la tabla e insertar datos por defecto
    const sql = `
    CREATE TABLE IF NOT EXISTS public.zocal_config (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      image_url TEXT,
      enabled BOOLEAN DEFAULT TRUE,
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Insertar configuración por defecto si la tabla está vacía
    INSERT INTO public.zocal_config (id, text, image_url, enabled, last_updated)
    SELECT 1, 'DJ Song Request System - Envía tu mensaje y solicita tu canción favorita', NULL, TRUE, CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM public.zocal_config WHERE id = 1);
    `

    // Ejecutar SQL directamente usando la API de ejecución SQL
    const response = await fetch("/api/db/execute-sql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error al ejecutar SQL:", errorData)
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo crear la tabla zocal_config",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tabla zocal_config creada correctamente",
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}

