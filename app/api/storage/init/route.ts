import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si el bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error al listar buckets:", bucketsError)
      return NextResponse.json({ error: "Error al listar buckets" }, { status: 500 })
    }

    // Crear bucket para imágenes si no existe
    if (!buckets.some((bucket) => bucket.name === "images")) {
      const { error: createError } = await supabase.storage.createBucket("images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error("Error al crear bucket de imágenes:", createError)
        return NextResponse.json({ error: "Error al crear bucket de imágenes" }, { status: 500 })
      }

      // Establecer política de acceso público
      const { error: policyError } = await supabase.storage.from("images").createSignedUrl("dummy.txt", 1)
      console.log("Bucket de imágenes creado correctamente")
    }

    // Crear bucket para archivos si no existe
    if (!buckets.some((bucket) => bucket.name === "files")) {
      const { error: createError } = await supabase.storage.createBucket("files", {
        public: true,
        fileSizeLimit: 20971520, // 20MB
      })

      if (createError) {
        console.error("Error al crear bucket de archivos:", createError)
        return NextResponse.json({ error: "Error al crear bucket de archivos" }, { status: 500 })
      }

      // Establecer política de acceso público
      const { error: policyError } = await supabase.storage.from("files").createSignedUrl("dummy.txt", 1)
      console.log("Bucket de archivos creado correctamente")
    }

    return NextResponse.json({ success: true, message: "Almacenamiento inicializado correctamente" })
  } catch (error) {
    console.error("Error al inicializar almacenamiento:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

