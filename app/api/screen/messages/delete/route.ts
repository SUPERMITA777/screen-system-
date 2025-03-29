import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"
import { deleteImage } from "@/lib/storage-utils"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const supabase = getSupabaseServer()

    if (!id) {
      return NextResponse.json({ error: "ID de mensaje requerido" }, { status: 400 })
    }

    // Primero obtenemos la información del mensaje para eliminar la imagen si existe
    const { data: messageData, error: messageError } = await supabase
      .from("screen_messages")
      .select("image_url")
      .eq("id", id)
      .single()

    if (messageError) {
      console.error("Error al obtener mensaje:", messageError)
      // Continuamos con la eliminación aunque no podamos obtener la imagen
    } else if (messageData && messageData.image_url) {
      // Eliminar la imagen del storage
      await deleteImage(messageData.image_url)
    }

    // Eliminar el mensaje
    const { error } = await supabase.from("screen_messages").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar en Supabase:", error)
      return NextResponse.json({ error: "Error al eliminar el mensaje" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

