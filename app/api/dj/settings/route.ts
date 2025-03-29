import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase"

// GET para obtener todas las configuraciones o una específica
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    const supabase = getSupabaseServer()

    let query = supabase.from("app_settings").select("*")

    if (key) {
      query = query.eq("key", key)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error al consultar configuraciones:", error)
      return NextResponse.json({ error: "Error al obtener configuraciones" }, { status: 500 })
    }

    // Si se solicitó una clave específica, devolver solo el valor
    if (key && data && data.length > 0) {
      return NextResponse.json({ value: data[0].value })
    } else if (key) {
      // Si se solicitó una clave específica pero no hay datos, devolver un valor por defecto
      if (key === "payment_message") {
        return NextResponse.json({ value: "Para completar tu solicitud, envía ${amount} al siguiente alias:" })
      } else if (key === "payment_alias") {
        return NextResponse.json({ value: "djs.unidos.argentina" })
      } else if (key === "tip_enabled") {
        return NextResponse.json({ value: "true" })
      } else if (key === "no_tip_message") {
        return NextResponse.json({ value: "¡Gracias por tu solicitud! El DJ la reproducirá pronto." })
      } else {
        return NextResponse.json({ value: "" })
      }
    }

    // De lo contrario, devolver todas las configuraciones
    return NextResponse.json({ settings: data || [] })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT para actualizar una configuración
export async function PUT(request: Request) {
  try {
    // Usar URLSearchParams para leer el cuerpo como texto y luego parsearlo
    const text = await request.text()
    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      // Si no es JSON, intentar parsear como URLSearchParams
      const params = new URLSearchParams(text)
      body = Object.fromEntries(params)
    }

    const { key, value } = body
    const supabase = getSupabaseServer()

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Se requieren key y value" }, { status: 400 })
    }

    // Verificar si la configuración ya existe
    const { data: existingConfig } = await supabase.from("app_settings").select("id").eq("key", key)

    if (existingConfig && existingConfig.length > 0) {
      // Actualizar configuración existente
      const { error: updateError } = await supabase
        .from("app_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("id", existingConfig[0].id)

      if (updateError) {
        console.error("Error al actualizar configuración:", updateError)
        return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 })
      }
    } else {
      // Crear nueva configuración
      const { error: insertError } = await supabase.from("app_settings").insert({
        key,
        value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error al crear configuración:", insertError)
        return NextResponse.json({ error: "Error al crear configuración" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

