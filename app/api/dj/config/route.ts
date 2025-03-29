import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

// Modificar la función GET para devolver valores correctos
export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si existe la tabla dj_config
    const { error: tableCheckError } = await supabase.from("dj_config").select("*").limit(1)

    // Si hay un error, probablemente la tabla no existe
    if (tableCheckError) {
      console.log("La tabla dj_config no existe, devolviendo configuración por defecto")

      // Devolver configuración por defecto en lugar de intentar crear la tabla
      return NextResponse.json({
        config: {
          show_tip_section: false,
          show_message_section: true,
        },
      })
    }

    // Obtener la configuración
    const { data, error } = await supabase.from("dj_config").select("*").eq("id", 1).single()

    if (error) {
      console.error("Error al obtener configuración:", error)
      return NextResponse.json({
        config: {
          show_tip_section: false,
          show_message_section: true,
        },
      })
    }

    return NextResponse.json({ config: data })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({
      config: {
        show_tip_section: false,
        show_message_section: true,
      },
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { show_tip_section, show_message_section } = body

    const supabase = getSupabaseServer()

    // Verificar si existe la tabla dj_config
    const { error: tableCheckError } = await supabase.from("dj_config").select("*").limit(1)

    // Si hay un error, probablemente la tabla no existe
    if (tableCheckError) {
      return NextResponse.json(
        {
          success: false,
          message: "La tabla dj_config no existe. Por favor, inicialice la base de datos primero.",
        },
        { status: 400 },
      )
    }

    // Actualizar la configuración
    const { error } = await supabase
      .from("dj_config")
      .update({
        show_tip_section,
        show_message_section,
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

