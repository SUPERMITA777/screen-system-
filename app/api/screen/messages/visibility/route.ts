import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

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

    const { id, visible, display_time } = body
    const supabase = getSupabaseServer()

    if (!id) {
      return NextResponse.json({ error: "ID de mensaje requerido" }, { status: 400 })
    }

    // Preparar los datos a actualizar
    const updateData: any = {}

    // Solo incluir los campos que se proporcionan
    if (visible !== undefined) {
      updateData.visible = visible === true || visible === "true"
    }

    if (display_time !== undefined) {
      updateData.display_time = Number.parseInt(display_time, 10)
    }

    // Actualizar el mensaje
    const { error } = await supabase.from("screen_messages").update(updateData).eq("id", id)

    if (error) {
      console.error("Error al actualizar en Supabase:", error)
      return NextResponse.json({ error: "Error al actualizar el mensaje" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

