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
    const { data: titleConfig, error: error1 } = await supabase
      .from("title_config")
      .select("id")
      .limit(1)

    const { data: messages, error: error2 } = await supabase
      .from("messages")
      .select("id")
      .limit(1)

    const { data: requests, error: error3 } = await supabase
      .from("requests")
      .select("id")
      .limit(1)

    const { data: screenConfig, error: error4 } = await supabase
      .from("screen_config")
      .select("id")
      .limit(1)

    // Si las tablas no existen, intentar crearlas
    if (error1?.code === "42P01") {
      // La tabla title_config no existe
      const { error: createError1 } = await supabase
        .from("title_config")
        .insert({
          title: "DJ Song Request System",
          subtitle: "Sistema de solicitud de canciones"
        })
      
      if (createError1) {
        console.error("Error al crear title_config:", createError1)
        return NextResponse.json({ error: "Error al crear title_config" }, { status: 500 })
      }
    }

    if (error2?.code === "42P01") {
      // La tabla messages no existe
      const { error: createError2 } = await supabase
        .from("messages")
        .insert({
          content: "Bienvenido al sistema",
          type: "welcome",
          status: "active"
        })
      
      if (createError2) {
        console.error("Error al crear messages:", createError2)
        return NextResponse.json({ error: "Error al crear messages" }, { status: 500 })
      }
    }

    if (error3?.code === "42P01") {
      // La tabla requests no existe
      const { error: createError3 } = await supabase
        .from("requests")
        .insert({
          song_name: "Ejemplo",
          artist: "Artista",
          requester_name: "Usuario",
          status: "pending"
        })
      
      if (createError3) {
        console.error("Error al crear requests:", createError3)
        return NextResponse.json({ error: "Error al crear requests" }, { status: 500 })
      }
    }

    if (error4?.code === "42P01") {
      // La tabla screen_config no existe
      const { error: createError4 } = await supabase
        .from("screen_config")
        .insert({
          is_active: true,
          current_song: "",
          current_artist: ""
        })
      
      if (createError4) {
        console.error("Error al crear screen_config:", createError4)
        return NextResponse.json({ error: "Error al crear screen_config" }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      message: "Verificación de tablas completada",
      tables: {
        title_config: !error1,
        messages: !error2,
        requests: !error3,
        screen_config: !error4
      }
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

