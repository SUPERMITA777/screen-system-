import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"
import { uploadImage } from "@/lib/storage-utils"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si la tabla existe
    const { data: tableCheck, error: tableCheckError } = await supabase.from("zocal_config").select("id").limit(1)

    if (tableCheckError) {
      console.error("Error al verificar tabla zocal_config:", tableCheckError)
      return NextResponse.json({
        config: {
          text: "INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita",
          image_url: null,
          left_image_url: null,
          right_image_url: null,
          enabled: true,
          image_size_percent: 80,
          is_static: false,
        },
      })
    }

    // Obtener la configuración
    const { data, error } = await supabase.from("zocal_config").select("*").order("id", { ascending: false }).limit(1)

    if (error) {
      console.error("Error al obtener configuración del zócalo:", error)
      return NextResponse.json({
        config: {
          text: "INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita",
          image_url: null,
          left_image_url: null,
          right_image_url: null,
          enabled: true,
          image_size_percent: 80,
          is_static: false,
        },
      })
    }

    // Si no hay datos, devolver configuración por defecto
    if (!data || data.length === 0) {
      return NextResponse.json({
        config: {
          text: "INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita",
          image_url: null,
          left_image_url: null,
          right_image_url: null,
          enabled: true,
          image_size_percent: 80,
          is_static: false,
        },
      })
    }

    return NextResponse.json({ config: data[0] })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({
      config: {
        text: "INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita",
        image_url: null,
        left_image_url: null,
        right_image_url: null,
        enabled: true,
        image_size_percent: 80,
        is_static: false,
      },
    })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const text =
      (formData.get("text") as string) || "INTERACTIVE SCREEN & MUSIC - Envía tu mensaje y solicita tu canción favorita"
    const enabled = formData.get("enabled") === "true"
    const is_static = formData.get("is_static") === "true"
    const image_size_percent = Number.parseInt(formData.get("image_size_percent") as string) || 80

    const keepExistingImage = formData.get("keepExistingImage") === "true"
    const keepExistingLeftImage = formData.get("keepExistingLeftImage") === "true"
    const keepExistingRightImage = formData.get("keepExistingRightImage") === "true"

    const image = formData.get("image") as File | null
    const left_image = formData.get("left_image") as File | null
    const right_image = formData.get("right_image") as File | null

    const supabase = getSupabaseServer()

    // Verificar si la tabla existe
    const { data: tableCheck, error: tableCheckError } = await supabase.from("zocal_config").select("id").limit(1)

    if (tableCheckError) {
      console.error("Error al verificar tabla zocal_config:", tableCheckError)
      return NextResponse.json({ error: "La tabla zocal_config no existe o no es accesible" }, { status: 500 })
    }

    // Obtener la configuración actual para mantener las URLs de imágenes si es necesario
    const { data: currentConfig, error: getError } = await supabase
      .from("zocal_config")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)

    let image_url = null
    let left_image_url = null
    let right_image_url = null

    // Mantener las URLs existentes si se indica
    if (!getError && currentConfig && currentConfig.length > 0) {
      if (keepExistingImage) {
        image_url = currentConfig[0].image_url
      }
      if (keepExistingLeftImage) {
        left_image_url = currentConfig[0].left_image_url
      }
      if (keepExistingRightImage) {
        right_image_url = currentConfig[0].right_image_url
      }
    }

    // Subir nuevas imágenes si se proporcionan
    if (image) {
      const newImageUrl = await uploadImage(image)
      if (newImageUrl) {
        image_url = newImageUrl
      }
    }

    if (left_image) {
      const newLeftImageUrl = await uploadImage(left_image)
      if (newLeftImageUrl) {
        left_image_url = newLeftImageUrl
      }
    }

    if (right_image) {
      const newRightImageUrl = await uploadImage(right_image)
      if (newRightImageUrl) {
        right_image_url = newRightImageUrl
      }
    }

    // Verificar si existe un registro
    const { data: existingData, error: existingError } = await supabase.from("zocal_config").select("id").limit(1)

    let id = 1
    if (!existingError && existingData && existingData.length > 0) {
      id = existingData[0].id
    }

    // Actualizar o insertar la configuración
    const { data, error } = await supabase
      .from("zocal_config")
      .upsert({
        id,
        text,
        image_url,
        left_image_url,
        right_image_url,
        enabled,
        image_size_percent,
        is_static,
      })
      .select()

    if (error) {
      console.error("Error al guardar configuración del zócalo:", error)
      return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 })
    }

    return NextResponse.json({ success: true, config: data[0] })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

