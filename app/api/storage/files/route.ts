import { NextResponse } from "next/server"
import { uploadFile, deleteFileByUrl, listFiles } from "@/lib/storage-utils"

// Obtener lista de archivos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get("folder") || "uploads"

    const files = await listFiles("files", folder)

    if (!files) {
      return NextResponse.json({ error: "Error al listar archivos" }, { status: 500 })
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Subir un archivo
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    const fileUrl = await uploadFile(file, "files", folder)

    if (!fileUrl) {
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 })
    }

    return NextResponse.json({ success: true, url: fileUrl })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Eliminar un archivo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")

    if (!url) {
      return NextResponse.json({ error: "URL de archivo requerida" }, { status: 400 })
    }

    const success = await deleteFileByUrl(url)

    if (!success) {
      return NextResponse.json({ error: "Error al eliminar el archivo" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

