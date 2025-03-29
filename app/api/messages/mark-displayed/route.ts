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

    // Verificar si la tabla tiene las columnas necesarias
    const { data: columnsData, error: columnsError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "screen_messages")
      .in("column_name", ["current_repetitions", "max_repetitions"])

    const hasRepetitionColumns = columnsData && columnsData.length === 2

    if (hasRepetitionColumns) {
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
    } else {
      // Si no existen las columnas, simplemente registramos que se mostró el mensaje
      // pero no hacemos ningún cambio en la visibilidad
      console.log("Las columnas de repetición no existen en la tabla screen_messages")

      return NextResponse.json({
        success: true,
        message: "Mensaje marcado como mostrado (sin contador de repeticiones)",
      })
    }
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

