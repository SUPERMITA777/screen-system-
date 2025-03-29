import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Obtener mensajes visibles
    const { data, error } = await supabase
      .from("screen_messages")
      .select("*")
      .eq("visible", true)
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Error al obtener mensajes:", error)
      return NextResponse.json({ messages: [] }, { status: 500 })
    }

    // Procesar los mensajes para extraer el nombre si está incluido en el formato "mensaje\n\n- Nombre"
    const processedMessages = (data || []).map((message) => {
      let name = "Anónimo"
      let displayMessage = message.message || ""

      // Intentar extraer el nombre del mensaje si tiene el formato esperado
      if (displayMessage && displayMessage.includes("\n\n- ")) {
        const parts = displayMessage.split("\n\n- ")
        if (parts.length === 2) {
          displayMessage = parts[0]
          name = parts[1]
        }
      } else if (displayMessage && displayMessage.startsWith("- ")) {
        // Si solo es un nombre sin mensaje
        name = displayMessage.substring(2)
        displayMessage = ""
      }

      return {
        ...message,
        message: displayMessage,
        name: name,
        display_time: message.display_time || 10, // Valor por defecto si no existe
        max_repetitions: message.max_repetitions || 10, // Valor por defecto si no existe
        current_repetitions: message.current_repetitions || 0, // Valor por defecto si no existe
      }
    })

    return NextResponse.json({ messages: processedMessages })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ messages: [] }, { status: 500 })
  }
}

