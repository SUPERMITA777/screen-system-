import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si existe la tabla screen_config
    const { error: tableCheckError } = await supabase.from("screen_config").select("*").limit(1)

    // Si hay un error, probablemente la tabla no existe
    if (tableCheckError) {
      console.log("La tabla screen_config no existe, devolviendo configuración por defecto")

      // Devolver configuración por defecto en lugar de intentar crear la tabla
      return NextResponse.json({
        config: {
          enabled: true,
          display_time: 10000,
          transition_effect: "fade",
        },
      })
    }

    // Obtener la configuración
    const { data, error } = await supabase.from("screen_config").select("*").eq("id", 1).single()

    if (error) {
      console.error("Error al obtener configuración:", error)
      return NextResponse.json({
        config: {
          enabled: true,
          display_time: 10000,
          transition_effect: "fade",
        },
      })
    }

    return NextResponse.json({ config: data })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({
      config: {
        enabled: true,
        display_time: 10000,
        transition_effect: "fade",
      },
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { enabled, display_time, transition_effect } = body

    const supabase = getSupabaseServer()

    // Verificar si existe la tabla screen_config
    const { error: tableCheckError } = await supabase.from("screen_config").select("*").limit(1)

    // Si hay un error, probablemente la tabla no existe
    if (tableCheckError) {
      return NextResponse.json(
        {
          success: false,
          message: "La tabla screen_config no existe. Por favor, inicialice la base de datos primero.",
        },
        { status: 400 },
      )
    }

    // Actualizar la configuración
    const { error } = await supabase
      .from("screen_config")
      .update({
        enabled,
        display_time,
        transition_effect,
        last_updated: new Date().toISOString(),
      })
      .eq("id", 1)

    if (error) {
      console.error("Error al actualizar configuración:", error)
      return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

