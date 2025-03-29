import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"
import { uploadImage } from "@/lib/storage-utils"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Verificar si la tabla existe
    try {
      const { data: tableExists, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "title_config")
        .single()

      if (error || !tableExists) {
        // Si la tabla no existe, intentar crearla
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/db/create-title-config`)
        if (!createResponse.ok) {
          console.error("No se pudo crear la tabla title_config")
          // Devolver configuración por defecto
          return NextResponse.json({
            config: {
              text: "DEJA VU",
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
    } catch (error) {
      console.error("Error al verificar si la tabla existe:", error)
      // Si hay error, devolver configuración por defecto
      return NextResponse.json({
        config: {
          text: "DEJA VU",
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
    const { data, error } = await supabase.from("title_config").select("*").order("id", { ascending: false }).limit(1)

    if (error) {
      console.error("Error al obtener configuración del título:", error)
      return NextResponse.json({
        config: {
          text: "DEJA VU",
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
          text: "DEJA VU",
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
        text: "DEJA VU",
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

    const text = (formData.get("text") as string) || "INTERACTIVE SCREEN & MUSIC"
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
    try {
      const { data: tableExists, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_name", "title_config")
        .single()

      if (error || !tableExists) {
        // Si la tabla no existe, intentar crearla
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/db/create-title-config`)
        if (!createResponse.ok) {
          return NextResponse.json(
            {
              error: "No se pudo crear la tabla title_config. Por favor, ejecute el script de actualización.",
              instructions: "Ejecute el endpoint /api/db/create-title-config para crear la tabla.",
            },
            { status: 500 }
          )
        }
      }
    } catch (error) {
      console.error("Error al verificar si la tabla existe:", error)
      return NextResponse.json(
        {
          error: "Error al verificar la tabla title_config",
          instructions: "Ejecute el endpoint /api/db/create-title-config para crear la tabla.",
        },
        { status: 500 }
      )
    }

    // Obtener la configuración actual para mantener las URLs de imágenes si es necesario
    const { data: currentConfig, error: getError } = await supabase
      .from("title_config")
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
    const { data: existingData, error: existingError } = await supabase.from("title_config").select("id").limit(1)

    let id = 1
    if (!existingError && existingData && existingData.length > 0) {
      id = existingData[0].id
    }

    // Actualizar o insertar la configuración
    const { data, error } = await supabase
      .from("title_config")
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
      console.error("Error al guardar configuración del título:", error)
      return NextResponse.json({ error: "Error al guardar la configuración" }, { status: 500 })
    }

    return NextResponse.json({ success: true, config: data[0] })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para crear la tabla title_config
async function createTitleConfigTable(supabase: any) {
  try {
    // Crear la tabla title_config
    const sql = `
    CREATE TABLE IF NOT EXISTS title_config (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL DEFAULT 'INTERACTIVE SCREEN & MUSIC',
      image_url TEXT,
      left_image_url TEXT,
      right_image_url TEXT,
      enabled BOOLEAN DEFAULT TRUE,
      image_size_percent INTEGER DEFAULT 80,
      is_static BOOLEAN DEFAULT FALSE
    );
    
    -- Insertar configuración por defecto si la tabla está vacía
    INSERT INTO title_config (text, enabled, image_size_percent, is_static)
    SELECT 'INTERACTIVE SCREEN & MUSIC', TRUE, 80, FALSE
    WHERE NOT EXISTS (SELECT 1 FROM title_config);
    `

    // Ejecutar SQL
    const { error } = await supabase.rpc("exec_sql", { sql })

    if (error) {
      console.error("Error al crear la tabla title_config:", error)
      throw error
    }

    console.log("Tabla title_config creada correctamente")
  } catch (error) {
    console.error("Error al crear la tabla title_config:", error)
    throw error
  }
}

