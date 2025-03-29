import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"
import { uploadImage } from "@/lib/storage-utils"

export async function POST(request: Request) {
  try {
    // Obtener los datos del formulario
    const formData = await request.formData()
    const song = formData.get("song") as string
    const name = formData.get("name") as string
    const tip = formData.get("tip") as string
    const timestamp = (formData.get("timestamp") as string) || new Date().toISOString()
    const message = (formData.get("message") as string) || null
    const image = formData.get("image") as File | null
    const displayTime = Number.parseInt((formData.get("display_time") as string) || "10", 10)

    const supabase = getSupabaseServer()

    // Validar los datos de la canción
    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Subir la imagen si existe
    let image_url = null
    if (image) {
      image_url = await uploadImage(image)

      if (!image_url) {
        console.error("Error al subir imagen")
        // Continuamos con la solicitud aunque la imagen falle
      }
    }

    // Insertar la solicitud de canción
    const { data: songData, error: songError } = await supabase
      .from("song_requests")
      .insert([
        {
          song,
          name,
          tip,
          timestamp,
          played: false,
        },
      ])
      .select()

    if (songError) {
      console.error("Error al insertar en Supabase:", songError)
      return NextResponse.json({ error: "Error al guardar la solicitud" }, { status: 500 })
    }

    // Si hay mensaje o imagen, guardar en la tabla de mensajes de pantalla
    if (message || image_url) {
      // Incluir el nombre en el mensaje para mostrarlo en la pantalla
      const displayMessage = message
        ? message + "\n\n- " + name
        : // Añadir el nombre al final del mensaje
          "- " + name // Solo el nombre si no hay mensaje

      try {
        // Primero verificamos si la tabla tiene la columna display_time
        const { error: columnCheckError } = await supabase.from("screen_messages").select("id").limit(1)

        if (columnCheckError) {
          console.error("Error al verificar la tabla screen_messages:", columnCheckError)
          // La tabla no existe, intentamos crearla
          console.log("Intentando crear la tabla screen_messages...")

          // Aquí no podemos crear la tabla directamente, así que solo registramos el mensaje
          console.log("No se pudo guardar el mensaje en pantalla porque la tabla no existe")
        } else {
          // Intentamos insertar con o sin display_time
          try {
            // Primero intentamos con display_time
            const { error: messageError } = await supabase.from("screen_messages").insert([
              {
                message: displayMessage,
                image_url,
                timestamp: new Date().toISOString(),
                visible: true,
                display_time: displayTime,
              },
            ])

            if (messageError) {
              console.error("Error al guardar mensaje con display_time:", messageError)

              // Si falla, intentamos sin display_time
              const { error: messageError2 } = await supabase.from("screen_messages").insert([
                {
                  message: displayMessage,
                  image_url,
                  timestamp: new Date().toISOString(),
                  visible: true,
                },
              ])

              if (messageError2) {
                console.error("Error al guardar mensaje sin display_time:", messageError2)
              }
            }
          } catch (insertError) {
            console.error("Error al insertar mensaje:", insertError)
          }
        }
      } catch (error) {
        console.error("Error al verificar la tabla screen_messages:", error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

