import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const supabase = getSupabaseServer()

    if (!id) {
      return NextResponse.json({ error: "ID de mensaje requerido" }, { status: 400 })
    }

    // Obtener el mensaje actual para verificar el contador
    const { data: message, error: fetchError } = await supabase
      .from("screen_messages")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error al obtener mensaje:", fetchError)
      return NextResponse.json({ error: "Error al obtener el mensaje" }, { status: 500 })
    }

    // Verificar si el mensaje existe
    if (!message) {
      return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 })
    }

    // Incrementar el contador de repeticiones
    const currentRepetitions = (message.current_repetitions || 0) + 1
    const maxRepetitions = message.max_repetitions || 10

    // Actualizar el contador y desactivar si alcanza el máximo
    const shouldDeactivate = currentRepetitions >= maxRepetitions

    const { error: updateError } = await supabase
      .from("screen_messages")
      .update({
        current_repetitions: currentRepetitions,
        visible: shouldDeactivate ? false : message.visible,
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error al actualizar contador:", updateError)
      return NextResponse.json({ error: "Error al actualizar el contador" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      current_repetitions: currentRepetitions,
      max_repetitions: maxRepetitions,
      deactivated: shouldDeactivate,
    })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

