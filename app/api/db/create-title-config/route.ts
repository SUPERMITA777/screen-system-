import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si la tabla existe
    const { data: tableExists, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "title_config")
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error al verificar si la tabla existe:", checkError)
      return NextResponse.json(
        {
          success: false,
          error: "Error al verificar la tabla title_config",
          details: checkError,
        },
        { status: 500 }
      )
    }

    if (tableExists) {
      return NextResponse.json({
        success: true,
        message: "La tabla title_config ya existe",
      })
    }

    // Crear la tabla
    const { error: createError } = await supabase
      .from("title_config")
      .insert([
        {
          id: 1,
          text: "INTERACTIVE SCREEN & MUSIC",
          image_url: null,
          left_image_url: null,
          right_image_url: null,
          enabled: true,
          image_size_percent: 80,
          is_static: false,
        },
      ])

    if (createError) {
      console.error("Error al crear la tabla title_config:", createError)
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo crear la tabla title_config",
          details: createError,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tabla title_config creada correctamente",
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error,
      },
      { status: 500 }
    )
  }
}

