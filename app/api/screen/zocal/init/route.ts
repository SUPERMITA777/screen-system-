import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

// Configuración por defecto
const defaultConfig = {
  text: "DJ Song Request System - Envía tu mensaje y solicita tu canción favorita",
  image_url: null,
  enabled: true,
}

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si la tabla ya existe
    let tableExists = false
    try {
      const { data, error } = await supabase.from("zocal_config").select("id").limit(1)
      tableExists = !error
    } catch (error) {
      console.error("Error al verificar si la tabla existe:", error)
      tableExists = false
    }

    if (!tableExists) {
      console.log("La tabla zocal_config no existe")

      return NextResponse.json({
        success: false,
        error: "La tabla zocal_config no existe",
        message: "Necesitas crear la tabla manualmente en el panel de Supabase",
        instructions: `
          CREATE TABLE public.zocal_config (
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL,
            image_url TEXT,
            enabled BOOLEAN DEFAULT TRUE,
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Insertar configuración por defecto
          INSERT INTO public.zocal_config (text, image_url, enabled, last_updated)
          VALUES ('DJ Song Request System - Envía tu mensaje y solicita tu canción favorita', NULL, TRUE, CURRENT_TIMESTAMP);
        `,
      })
    } else {
      console.log("La tabla zocal_config ya existe")

      // Verificar si hay datos
      const { data, error } = await supabase.from("zocal_config").select("*").limit(1)

      if (error || !data || data.length === 0) {
        console.log("No hay datos en la tabla, intentando insertar configuración por defecto")

        // Insertar configuración por defecto
        try {
          const { error: insertError } = await supabase.from("zocal_config").insert({
            text: defaultConfig.text,
            image_url: null,
            enabled: true,
            last_updated: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error al insertar configuración por defecto:", insertError)
            return NextResponse.json({
              success: false,
              error: "Error al insertar configuración por defecto",
              errorDetails: JSON.stringify(insertError),
              message: "La tabla existe pero no se pudo insertar la configuración por defecto",
            })
          } else {
            console.log("Configuración por defecto insertada correctamente")
          }
        } catch (insertError) {
          console.error("Error al insertar configuración por defecto:", insertError)
          return NextResponse.json({
            success: false,
            error: "Error al insertar configuración por defecto",
            errorDetails: String(insertError),
            message: "La tabla existe pero no se pudo insertar la configuración por defecto",
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Tabla zocal_config verificada correctamente",
    })
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

