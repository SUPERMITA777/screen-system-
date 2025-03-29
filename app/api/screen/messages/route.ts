import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"
import { uploadImage } from "@/lib/storage-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visible = searchParams.get("visible")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const supabase = getSupabaseServer()

    // Verificar si existe la tabla screen_messages
    const { error: tableCheckError } = await supabase.from("screen_messages").select("*").limit(1)

    // Si hay un error, probablemente la tabla no existe
    if (tableCheckError) {
      console.log("La tabla screen_messages no existe, devolviendo lista vacía")
      return NextResponse.json({ messages: [] })
    }

    let query = supabase.from("screen_messages").select("*").order("timestamp", { ascending: false }).limit(limit)

    // Filtrar por visibilidad si se especifica
    if (visible === "true") {
      query = query.eq("visible", true)
    } else if (visible === "false") {
      query = query.eq("visible", false)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al consultar Supabase:", error)
      return NextResponse.json({ error: "Error al obtener los mensajes" }, { status: 500 })
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
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const message = formData.get("message") as string
    const image = formData.get("image") as File | null
    const name = (formData.get("name") as string) || "Anónimo"
    const displayTime = Number.parseInt((formData.get("display_time") as string) || "10", 10)
    const maxRepetitions = Number.parseInt((formData.get("max_repetitions") as string) || "10", 10)

    const supabase = getSupabaseServer()

    // Verificar si existe la tabla screen_messages
    const { error: tableCheckError } = await supabase.from("screen_messages").select("*").limit(1)

    // Si hay un error, probablemente la tabla no existe
    if (tableCheckError) {
      return NextResponse.json(
        {
          error: "La tabla screen_messages no existe. Por favor, inicialice la base de datos primero.",
        },
        { status: 400 },
      )
    }

    let image_url = null

    // Si hay una imagen, subirla
    if (image) {
      image_url = await uploadImage(image)

      if (!image_url) {
        return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
      }
    }

    // Incluir el nombre en el mensaje
    const displayMessage = message
      ? message + "\n\n- " + name
      : // Añadir el nombre al final del mensaje
        "- " + name // Solo el nombre si no hay mensaje

    // Insertar el mensaje en la base de datos
    const { error } = await supabase.from("screen_messages").insert([
      {
        message: displayMessage, // Incluir el nombre como parte del mensaje
        image_url,
        timestamp: new Date().toISOString(),
        visible: true,
        display_time: displayTime, // Agregar el tiempo de visualización
        max_repetitions: maxRepetitions, // Agregar el número máximo de repeticiones
        current_repetitions: 0, // Inicializar el contador de repeticiones
      },
    ])

    if (error) {
      console.error("Error al insertar en Supabase:", error)
      return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

