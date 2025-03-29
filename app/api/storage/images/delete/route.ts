import { NextResponse } from "next/server"
import { deleteImage } from "@/lib/storage-utils"

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json({ error: "URL de imagen requerida" }, { status: 400 })
    }

    const success = await deleteImage(imageUrl)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Error al eliminar la imagen" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

