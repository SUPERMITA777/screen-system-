import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Faltan variables de entorno" }, { status: 500 })
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "public" },
    })

    // Verificar si las tablas existen
    const { data: screenMessages, error: error1 } = await supabase
      .from("screen_messages")
      .select("id")
      .limit(1)

    const { data: titleConfig, error: error2 } = await supabase
      .from("title_config")
      .select("id")
      .limit(1)

    const { data: screenConfig, error: error3 } = await supabase
      .from("screen_config")
      .select("id")
      .limit(1)

    // Si las tablas no existen, intentar crearlas
    if (error1?.code === "42P01") {
      // La tabla screen_messages no existe
      const { error: createError1 } = await supabase
        .from("screen_messages")
        .insert({
          message: "Bienvenido al sistema",
          visible: true,
          display_time: 10,
          max_repetitions: 10,
          current_repetitions: 0
        })
      
      if (createError1) {
        console.error("Error al crear screen_messages:", createError1)
        return NextResponse.json({ error: "Error al crear screen_messages" }, { status: 500 })
      }
    }

    if (error2?.code === "42P01") {
      // La tabla title_config no existe
      const { error: createError2 } = await supabase
        .from("title_config")
        .insert({
          text: "DJ Song Request System",
          enabled: true,
          image_size_percent: 80,
          is_static: false
        })
      
      if (createError2) {
        console.error("Error al crear title_config:", createError2)
        return NextResponse.json({ error: "Error al crear title_config" }, { status: 500 })
      }
    }

    if (error3?.code === "42P01") {
      // La tabla screen_config no existe
      const { error: createError3 } = await supabase
        .from("screen_config")
        .insert({
          enabled: true,
          display_time: 10000,
          transition_effect: "fade"
        })
      
      if (createError3) {
        console.error("Error al crear screen_config:", createError3)
        return NextResponse.json({ error: "Error al crear screen_config" }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: "Verificación de tablas completada",
      tables: {
        screen_messages: !error1,
        title_config: !error2,
        screen_config: !error3
      }
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

