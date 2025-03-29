import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Obtener la configuración de tema (la primera que encuentre)
    const { data, error } = await supabase.from("theme_settings").select("*").limit(1)

    if (error) {
      console.error("Error obteniendo tema:", error)
      return NextResponse.json({
        primary_color: "#9333ea",
        secondary_color: "#000000",
        accent_color: "#6b21a8",
      })
    }

    return NextResponse.json(
      data && data.length > 0
        ? data[0]
        : {
            primary_color: "#9333ea",
            secondary_color: "#000000",
            accent_color: "#6b21a8",
          },
    )
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({
      primary_color: "#9333ea",
      secondary_color: "#000000",
      accent_color: "#6b21a8",
    })
  }
}

export async function PUT(request: Request) {
  try {
    const text = await request.text()
    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      const params = new URLSearchParams(text)
      body = Object.fromEntries(params)
    }

    const { primary_color, secondary_color, accent_color } = body
    const supabase = getSupabaseServer()

    // Verificar si ya existe un tema
    const { data: existingTheme } = await supabase.from("theme_settings").select("id").limit(1)

    let updateError

    if (existingTheme && existingTheme.length > 0) {
      // Actualizar tema existente
      const { error } = await supabase
        .from("theme_settings")
        .update({
          primary_color,
          secondary_color,
          accent_color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTheme[0].id)

      updateError = error
    } else {
      // Crear nuevo tema
      const { error } = await supabase.from("theme_settings").insert({
        primary_color,
        secondary_color,
        accent_color,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      updateError = error
    }

    if (updateError) {
      console.error("Error actualizando tema:", updateError)
      return NextResponse.json({ error: "Error actualizando tema" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

