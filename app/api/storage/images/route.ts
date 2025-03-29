import { NextResponse } from "next/server"
import { uploadImage, deleteFileByUrl, listFiles } from "@/lib/storage-utils"

// Obtener lista de imágenes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get("folder") || "uploads"

    const images = await listFiles("images", folder)

    if (!images) {
      return NextResponse.json({ error: "Error al listar imágenes" }, { status: 500 })
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Subir una imagen
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!image) {
      return NextResponse.json({ error: "No se proporcionó ninguna imagen" }, { status: 400 })
    }

    const imageUrl = await uploadImage(image, "images", folder)

    if (!imageUrl) {
      return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: imageUrl })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Eliminar una imagen
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL de imagen requerida" }, { status: 400 })
    }

    const success = await deleteFileByUrl(url)

    if (!success) {
      return NextResponse.json({ error: "Error al eliminar la imagen" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

